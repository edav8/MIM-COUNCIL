export type EmailConfig = { RESEND_API_KEY?: string; FEEDBACK_EMAIL_FROM?: string; FEEDBACK_EMAIL_TO?: string };
export type Feedback = { id:string; title:string; idea:string; source_idea:string; name:string; contact:string; created_at:number; moderation_status:string; moderation_reason:string; is_public:number };
export function emailConfigured(config:EmailConfig) {
  return Boolean(config.RESEND_API_KEY && config.FEEDBACK_EMAIL_FROM && config.FEEDBACK_EMAIL_TO);
}
export function feedbackEmail(row:Feedback, context:string, config:EmailConfig) {
  return {
    from:config.FEEDBACK_EMAIL_FROM,
    to:[config.FEEDBACK_EMAIL_TO],
    subject:'MIM’28 website — new feedback',
    text:[
      'New feedback from mim28.com',
      `Submission ID: ${row.id}`,
      `Submitted: ${new Date(row.created_at).toISOString()}`,
      `Title: ${row.title || '(No title)'}`,
      `Initiative: ${context || 'New standalone submission'}`,
      `Name: ${row.name || 'Not provided'}`,
      `Contact: ${row.contact || 'Not provided'}`,
      `Moderation status: ${row.moderation_status}`,
      `Visibility: ${row.is_public ? 'Public' : 'Private; not on the board'}`,
      `Moderation reason: ${row.moderation_reason || 'None'}`,
      ...(row.moderation_status==='pending' ? ['Needs attention: automatic review has not completed. This idea is not published.'] : []),
      '', 'Message:', row.idea || '(No additional details)',
      '', 'Student text is reproduced as submitted. This notification does not change its review status.',
    ].join('\n'),
  };
}

type PendingEmail = { idea_id:string; payload:string; first_attempt_at:number; attempts:number };
// Called by request-triggered background work. Each invocation is bounded so it
// finishes inside the host's response-lifetime allowance.
export async function deliverFeedback(db:D1Database, config:EmailConfig, options:{request?:typeof fetch; sleep?:(ms:number)=>Promise<void>; now?:()=>number; ideaId?:string; retries?:number}={}) {
  if(!emailConfigured(config))return;
  const now=options.now ?? Date.now, send=options.request ?? fetch;
  const sleep=options.sleep ?? (ms=>new Promise(resolve=>setTimeout(resolve,ms)));
  const at=now();
  const claimed=await db.prepare(`UPDATE email_outbox SET lease_until=?
    WHERE idea_id=(SELECT idea_id FROM email_outbox WHERE status='pending' AND next_attempt_at<=? AND lease_until<=?
    ${options.ideaId ? 'AND idea_id=?' : ''} ORDER BY created_at ASC LIMIT 1)
    RETURNING idea_id,payload,first_attempt_at,attempts`).bind(at+30000,at,at,...(options.ideaId?[options.ideaId]:[])).first<PendingEmail>();
  if(!claimed)return;
  // Resend deduplicates for 24 hours. Do not blindly resend an uncertain request
  // after that window; preserve it for reconciliation instead of duplicating mail.
  if(claimed.first_attempt_at && at-claimed.first_attempt_at>=23*3600000){
    await db.prepare("UPDATE email_outbox SET status='attention',lease_until=0,last_error='Check provider delivery before retrying: deduplication window elapsed.' WHERE idea_id=?").bind(claimed.idea_id).run();return;
  }
  for(let attempt=0;attempt<Math.min(options.retries ?? 3,3);attempt++) {
    await db.prepare('UPDATE email_outbox SET attempts=attempts+1,first_attempt_at=CASE WHEN first_attempt_at=0 THEN ? ELSE first_attempt_at END WHERE idea_id=?').bind(now(),claimed.idea_id).run();
    let retryable=true,error='Email provider could not be reached.';
    try {
      const result=await send('https://api.resend.com/emails',{
        method:'POST',signal:AbortSignal.timeout(5000),
        headers:{Authorization:`Bearer ${config.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`mim28-feedback/${claimed.idea_id}`},
        body:claimed.payload,
      });
      if(result.ok){
        const data=await result.json() as {id?:string};
        if(!data.id)throw new Error('Missing delivery confirmation');
        await db.prepare("UPDATE email_outbox SET status='sent',provider_id=?,lease_until=0,last_error='' WHERE idea_id=?").bind(data.id,claimed.idea_id).run();return;
      }
      retryable=result.status===429 || result.status===409 || result.status>=500;
      error=`Email provider returned HTTP ${result.status}.`;
    }catch{ /* Keep the original payload and key for safe retries after uncertainty. */ }
    if(!retryable){
      await db.prepare("UPDATE email_outbox SET status='attention',lease_until=0,last_error=? WHERE idea_id=?").bind(error,claimed.idea_id).run();return;
    }
    await db.prepare('UPDATE email_outbox SET last_error=? WHERE idea_id=?').bind(error,claimed.idea_id).run();
    if(attempt+1<Math.min(options.retries ?? 3,3))await sleep(1000*(attempt+1));
  }
  await db.prepare('UPDATE email_outbox SET lease_until=0,next_attempt_at=? WHERE idea_id=?').bind(now()+60000,claimed.idea_id).run();
}
