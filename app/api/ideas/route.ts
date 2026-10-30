import { catalog } from '@/lib/idea-catalog';
import { normalizeIdeaTitle } from '@/lib/idea-matches';
import { env } from 'cloudflare:workers';
import { getDatabase } from '@/db';
import { uuidPattern, validOrigin, publicIdeaExists, voter, boardResponse } from '@/lib/board-server';
import { reviewIdea, submissionMessage } from '@/lib/idea-review';
import { after } from 'next/server';
import { emailConfigured, feedbackEmail, deliverFeedback } from '@/lib/feedback-email';
const response=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const digest=async(value:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),x=>x.toString(16).padStart(2,'0')).join('');
export async function POST(request:Request) {
 if(!validOrigin(request))return response({error:'Please submit from this website.'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return response({error:'Invalid submission format.'},415);
 if(Number(request.headers.get('content-length'))>16000)return response({error:'This submission is too long.'},413);
 const raw=await request.text();if(raw.length>16000)return response({error:'This submission is too long.'},413);
 let data:Record<string,unknown>;
 try{data=JSON.parse(raw);if(!data||typeof data!=='object'||Array.isArray(data))throw new Error();}catch{return response({error:'Please check your idea and try again.'},400);}
 if(data.website)return response({ok:true,message:'Thanks for your submission.'});
 const {id,idea='',title='',sourceIdea='',name='',contact='',isPublic=false}=data;
 if(typeof id!=='string'||!uuidPattern.test(id))return response({error:'Please refresh and try again.'},400);
 if(typeof idea!=='string'||(!isPublic&&idea.trim().length<5)||idea.trim().length>2000||typeof title!=='string'||title.trim().length>100)return response({error:'Use up to 100 characters for the title and 2,000 for the optional details. Private messages need at least 5 characters.'},400);
 if(typeof isPublic!=='boolean'||(isPublic&&title.trim().length<5))return response({error:'Give your idea a title of at least 5 characters.'},400);
 if(typeof name!=='string'||name.length>100||typeof contact!=='string'||contact.length>200||typeof sourceIdea!=='string'||sourceIdea.length>100)return response({error:'Please check the optional details.'},400);
 if(isPublic&&sourceIdea)return response({error:'Comments are private. Submit a new idea separately.'},400);
 const visitor=voter(request);
 const reply=(status:string,code=201)=>boardResponse({ok:true,isPublic:status==='approved'||status==='legacy',moderationStatus:status,message:submissionMessage(status)},request,visitor,code);
 try{
  const db=getDatabase();
  const hash=await digest(JSON.stringify({idea:idea.trim(),title:title.trim(),sourceIdea,name:name.trim(),contact:contact.trim(),isPublic}));
  const existing=await db.prepare('SELECT request_hash,moderation_status FROM ideas WHERE id=?').bind(id).first<{request_hash:string;moderation_status:string}>();
  if(existing) {
   if(existing.request_hash!==hash)return response({error:'This submission has changed. Please reopen the form and submit again.'},409);
   after(()=>deliverFeedback(db,env,{ideaId:id}));
   return reply(existing.moderation_status);
  }
  if(isPublic){
   const approved=await db.prepare("SELECT id,title FROM ideas WHERE is_public=1 AND moderation_status IN ('approved','legacy') ORDER BY created_at ASC LIMIT 1000").all<{id:string;title:string}>();
   const same=[...catalog,...approved.results].find(item=>normalizeIdeaTitle(item.title)===normalizeIdeaTitle(title));
   if(same)return boardResponse({ok:true,duplicate:{id:same.id,title:same.title},message:'This idea is already on the board. Like it to show your support. If your proposal is different, give it a distinct title.'},request,visitor);
  }
  if(sourceIdea&&!await publicIdeaExists(sourceIdea))return response({error:'That idea is no longer available. Please send a new suggestion.'},400);
  const now=Date.now(),hour=Math.floor(now/3600000),day=Math.floor(now/86400000);
  // Cloudflare supplies the IP header in production. Only a daily hash is stored.
  const client=await digest(`${day}:${request.headers.get('cf-connecting-ip') || visitor}`);
  const limits=[{key:`client:${hour}:${client}`,max:10,expires:now+3600000}];
  if(isPublic)limits.push({key:`public:${day}`,max:250,expires:now+86400000});
  // Fold cleanup into the first counter round trip. Check the client before the
  // global budget so a blocked client cannot consume everyone else's allowance.
  for(const [index,limit] of limits.entries()){
   const counter=db.prepare('INSERT INTO submission_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(limit.key,limit.expires);
   const usage=index===0
    ? (await db.batch<{count:number}>([counter,db.prepare('DELETE FROM submission_limits WHERE expires_at<?').bind(now)]))[0].results[0]
    : await counter.first<{count:number}>();
   if(!usage||usage.count>limit.max)return boardResponse({error:'There have been several submissions recently. Please try again later.'},request,visitor,429);
  }
  // Reserve the ID before calling the model. Concurrent retries never duplicate the call.
  const feedback={id,idea:idea.trim(),title:title.trim(),is_public:0,source_idea:sourceIdea,name:name.trim(),contact:contact.trim(),created_at:now,moderation_status:isPublic?'pending':'private',moderation_reason:''};
  const context=sourceIdea ? catalog.find(item=>item.id===sourceIdea)?.title ?? (await db.prepare('SELECT title FROM ideas WHERE id=?').bind(sourceIdea).first<{title:string}>())?.title ?? sourceIdea : '';
  const insert=db.prepare('INSERT INTO ideas (id,idea,title,is_public,source_idea,name,contact,created_at,moderation_status,moderation_reason,request_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(id,feedback.idea,feedback.title,0,sourceIdea,feedback.name,feedback.contact,now,feedback.moderation_status,'',hash);
  const inserted=emailConfigured(env) ? (await db.batch([
   insert,
   db.prepare('INSERT INTO email_outbox (idea_id,payload,created_at,next_attempt_at) VALUES (?,?,?,?) ON CONFLICT(idea_id) DO NOTHING').bind(id,JSON.stringify(feedbackEmail(feedback,context,env)),now,isPublic?now+120000:now),
  ]))[0] : await insert.run();
  if(!inserted.meta.changes){
   const row=await db.prepare('SELECT request_hash,moderation_status FROM ideas WHERE id=?').bind(id).first<{request_hash:string;moderation_status:string}>();
   return row?.request_hash===hash ? reply(row.moderation_status) : response({error:'Please reopen the form and try again.'},409);
  }
  if(!isPublic){after(()=>deliverFeedback(db,env,{ideaId:id}));return reply('private');}
  const review=await reviewIdea(title.trim(),idea.trim(),env.OPENAI_API_KEY);
  feedback.is_public=review.decision==='approved'?1:0;feedback.moderation_status=review.decision;feedback.moderation_reason=review.reason;
  const update=db.prepare("UPDATE ideas SET is_public=?,moderation_status=?,moderation_reason=? WHERE id=? AND moderation_status='pending'").bind(feedback.is_public,review.decision,review.reason,id);
  if(emailConfigured(env))await db.batch([update,db.prepare("UPDATE email_outbox SET payload=?,next_attempt_at=0 WHERE idea_id=? AND attempts=0 AND status='pending'").bind(JSON.stringify(feedbackEmail(feedback,context,env)),id)]);
  else await update.run();
  after(()=>deliverFeedback(db,env,{ideaId:id}));
  return reply(review.decision);
 }catch{return response({error:'We couldn’t confirm this just now. Your text is still here; please try again.'},503);}
}
