import {getDatabase} from '@/db';
import {boardResponse,voter} from '@/lib/board-server';
import {env} from 'cloudflare:workers';
import {after} from 'next/server';
import {deliverFeedback} from '@/lib/feedback-email';
export async function GET(request:Request){
 const visitor=voter(request);
 try{
  const db=getDatabase();
  // A visit can resume a saved failed email; no Mac or scheduled task is needed.
  after(()=>deliverFeedback(db,env,{retries:1}));
  const [ideas,counts,mine]=await db.batch([
   db.prepare("SELECT id,title,idea,created_at FROM ideas WHERE is_public=1 AND moderation_status IN ('approved','legacy') ORDER BY created_at DESC LIMIT 1000"),
   db.prepare('SELECT idea_id,COUNT(*) AS count FROM votes GROUP BY idea_id'),
   db.prepare('SELECT idea_id FROM votes WHERE voter_id=?').bind(visitor)
  ]);
  return boardResponse({ideas:ideas.results,counts:Object.fromEntries((counts.results as {idea_id:string;count:number}[]).map(row=>[row.idea_id,Number(row.count)])),voted:(mine.results as {idea_id:string}[]).map(row=>row.idea_id)},request,visitor);
 }catch{return boardResponse({error:'Live votes are temporarily unavailable. You can still browse the ideas.'},request,visitor,503);}
}
