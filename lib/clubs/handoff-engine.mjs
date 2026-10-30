/** Private server-side notification prototype. No environment discovery, no UI, no durable adapter supplied. */
import { createHash, randomUUID } from 'node:crypto';
const retryWindowMs=23*60*60*1000; // Strictly inside Resend's documented 24-hour idempotency window.
export const resolvedRetentionMs=30*24*60*60*1000;
const result=(status,message,extra={})=>({status,message,accepted:status==='accepted',delivered:false,...extra});
const unavailable=()=>result('unavailable','Forwarding is unavailable right now. Please contact Tim directly by email.');
const pending=()=>result('uncertain','I could not confirm that the notification was accepted. Retry this same request, or contact Tim directly; do not submit it as a new request.');
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const isTime=x=>x instanceof Date&&Number.isFinite(x.getTime());

/** The UI must display these EXACT values before obtaining consent. No trim/rewrite occurs here. */
export function validateHandoff(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['id','summary','contact','consent'].includes(k))) return false;
 if(typeof input.id!=='string'||!/^\w[\w-]{19,79}$/.test(input.id)) return false;
 if(typeof input.summary!=='string'||!input.summary.trim()||input.summary.length>3000||/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(input.summary))return false;
 if(input.contact!==undefined&&(typeof input.contact!=='string'||input.contact.length>200||/[\r\n\x00-\x1f]/.test(input.contact)))return false;
 const c=input.consent;
 return !!c&&Object.keys(c).sort().join(',')==='confirmed,contact,summary'&&c.confirmed===true&&c.summary===input.summary&&c.contact===(input.contact??'');
}

/** @param {any} input @param {{apiKey?:string,from?:string,to?:string,store?:any,fetchImpl?:typeof fetch,now?:Date,timeoutMs?:number}} options */
export async function forwardHandoff(input,{apiKey,from,to,store,fetchImpl=globalThis.fetch,now=new Date(),timeoutMs=12000}={}){
 if(!validateHandoff(input))return result('invalid','Please review the exact question summary and optional contact details, then explicitly confirm forwarding.');
 if(!isTime(now)||!apiKey||typeof apiKey!=='string'||typeof from!=='string'||!from.trim()||/[\r\n]/.test(from)||typeof to!=='string'||!/^\S+@[^\s@]+\.[^\s@]+$/.test(to)||!store||typeof store.claim!=='function'||typeof store.finish!=='function'||typeof fetchImpl!=='function')return unavailable();
 const body={from,to:[to],subject:'Clubs question for Tim',text:`A student approved forwarding this summary.\n\n${input.summary}\n\nOptional contact: ${input.contact||'Not provided'}\n\nRequest reference: ${input.id}`};
 const fingerprint=digest(body),owner=randomUUID(),id=input.id,nowMs=now.getTime();
 let claim;
 try{claim=await store.claim({id,fingerprint,owner,now:nowMs,leaseUntil:nowMs+30000,retryBefore:nowMs+retryWindowMs,payload:{summary:input.summary,contact:input.contact??'',consentedAt:now.toISOString()},providerBody:body});}catch{return unavailable();}
 if(claim?.state==='accepted'&&typeof claim.providerId==='string'&&claim.providerId.trim())return result('accepted','Your question was accepted for forwarding to Tim. This does not confirm delivery to his inbox.',{requestId:id});
 if(claim?.state==='conflict')return result('conflict','This request reference already belongs to different content. Please review the original request; do not silently overwrite it.');
 if(claim?.state==='inflight')return result('pending','This request is already being processed. Check again using the same request reference.',{requestId:id});
 if(claim?.state==='expired'||claim?.state==='purged')return result('needs_review','This request needs a manual delivery check. Please contact Tim directly; automatic retry could duplicate it.',{requestId:id});
 if(claim?.state!=='claimed'||!Number.isFinite(claim.firstAttemptAt)||nowMs-claim.firstAttemptAt>=retryWindowMs||claim.firstAttemptAt>nowMs)return result('needs_review','This request needs a manual delivery check. Please contact Tim directly.',{requestId:id});
 const controller=new AbortController();let timer;
 let providerId=null;
 const send=async()=>{
  const r=await fetchImpl('https://api.resend.com/emails',{method:'POST',signal:controller.signal,headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json','Idempotency-Key':`clubs-handoff/${id}`},body:JSON.stringify(body)});
  if(!r.ok)return false;
  const raw=await r.text();if(raw.length>10000)return false;
  const parsed=JSON.parse(raw);if(typeof parsed.id!=='string'||!parsed.id.trim()||parsed.id.length>200)return false;
  return parsed.id;
 };
 try{providerId=await Promise.race([send(),new Promise(resolve=>{timer=setTimeout(()=>{controller.abort();resolve(false);},Number.isFinite(timeoutMs)?Math.max(50,Math.min(20000,timeoutMs)):12000);})]);}catch{}finally{clearTimeout(timer);controller.abort();}
 try{
  const persisted=await store.finish({id,fingerprint,owner,state:providerId?'accepted':'uncertain',providerId:providerId||null,now:nowMs});
  if(persisted!==true)return pending();
 }catch{return pending();}
 return providerId?result('accepted','Your question was accepted for forwarding to Tim. This does not confirm delivery to his inbox.',{requestId:id}):pending();
}

/** Administrative calls only: route/auth/scheduler are integration responsibilities. */
export async function resolveHandoff(id,{store,now=new Date()}={}){
 if(!isTime(now)||typeof id!=='string'||!store?.markResolved)return false;
 return store.markResolved({id,resolvedAt:now.getTime(),deleteAfter:now.getTime()+resolvedRetentionMs});
}
export async function purgeResolvedHandoffs({store,now=new Date()}={}){
 if(!isTime(now)||!store?.purgeResolved)return false;
 return store.purgeResolved({now:now.getTime()});
}
