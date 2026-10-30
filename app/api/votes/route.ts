import {getDatabase} from '@/db';
import {boardResponse,voter,validOrigin,publicIdeaExists} from '@/lib/board-server';
export async function POST(request:Request){
 const visitor=voter(request);
 if(!validOrigin(request))return boardResponse({error:'Please vote from this website.'},request,visitor,403);
 if(!request.headers.get('content-type')?.includes('application/json'))return boardResponse({error:'Invalid vote format.'},request,visitor,415);
 const raw=await request.text();if(raw.length>1000)return boardResponse({error:'Invalid vote.'},request,visitor,413);
 let data:{ideaId?:unknown;action?:unknown};try{data=JSON.parse(raw);if(!data||typeof data!=='object')throw new Error();}catch{return boardResponse({error:'Invalid vote.'},request,visitor,400);}
 const {ideaId,action}=data;
 if(typeof ideaId!=='string'||ideaId.length>100||!['vote','remove'].includes(String(action)))return boardResponse({error:'Invalid vote.'},request,visitor,400);
 try{
  if(!await publicIdeaExists(ideaId))return boardResponse({error:'That idea is no longer available.'},request,visitor,404);
  const db=getDatabase();
  if(action==='vote')await db.prepare('INSERT INTO votes (idea_id,voter_id,created_at) VALUES (?,?,?) ON CONFLICT(idea_id,voter_id) DO NOTHING').bind(ideaId,visitor,Date.now()).run();
  else await db.prepare('DELETE FROM votes WHERE idea_id=? AND voter_id=?').bind(ideaId,visitor).run();
  const row=await db.prepare('SELECT COUNT(*) AS count FROM votes WHERE idea_id=?').bind(ideaId).first<{count:number}>();
  return boardResponse({count:row?.count??0,voted:action==='vote'},request,visitor);
 }catch{return boardResponse({error:'Your vote couldn’t be saved. Please try again.'},request,visitor,503);}
}
