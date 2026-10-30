/** Metadata only. Consent text and contact details are never saved in D1. */
type Row = { id:string; fingerprint:string; owner:string; state:string; firstAttemptAt:number; leaseUntil:number; retryBefore:number; providerId:string|null };
type Claim = {id:string; fingerprint:string; owner:string; now:number; leaseUntil:number; retryBefore:number};
type Finish = {id:string; fingerprint:string; owner:string; state:string; providerId:string|null; now:number};
export function openD1Store(db:D1Database) {
  return {
    async claim(q:Claim) {
      // D1 batch executes this entire sequence transactionally. The conditional
      // UPDATE is the lease claim, so workers cannot both own an active attempt.
      const results=await db.batch([
        db.prepare("INSERT OR IGNORE INTO clubs_handoffs (id,fingerprint,owner,state,firstAttemptAt,leaseUntil,retryBefore,providerId) VALUES (?,?,?,'sending',?,?,?,NULL)").bind(q.id,q.fingerprint,q.owner,q.now,q.leaseUntil,q.retryBefore),
        db.prepare("UPDATE clubs_handoffs SET owner=?,state='sending',leaseUntil=? WHERE id=? AND fingerprint=? AND state!='accepted' AND retryBefore>? AND (owner=? OR state!='sending' OR leaseUntil<=?)").bind(q.owner,q.leaseUntil,q.id,q.fingerprint,q.now,q.owner,q.now),
        db.prepare('SELECT * FROM clubs_handoffs WHERE id=?').bind(q.id),
      ]);
      const r=results[2].results?.[0] as Row|undefined;
      if(!r)throw new Error('Unable to record request');
      if(r.fingerprint!==q.fingerprint)return {state:'conflict'};
      if(r.state==='accepted')return {state:'accepted',providerId:r.providerId};
      if(q.now>=r.retryBefore)return {state:'expired'};
      if(r.owner===q.owner&&r.state==='sending')return {state:'claimed',firstAttemptAt:r.firstAttemptAt};
      return {state:'inflight'};
    },
    async finish(q:Finish) {
      if(!['accepted','uncertain'].includes(q.state)||(q.state==='accepted'&&!q.providerId))return false;
      const r=await db.prepare("UPDATE clubs_handoffs SET state=?,providerId=?,leaseUntil=0 WHERE id=? AND fingerprint=? AND owner=? AND state='sending'").bind(q.state,q.providerId,q.id,q.fingerprint,q.owner).run();
      return r.meta.changes===1;
    },
  };
}
