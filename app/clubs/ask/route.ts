import {env} from 'cloudflare:workers';
import {getDatabase} from '@/db';
import {answerQuestion} from '@/lib/clubs/answer-engine.mjs';
import {readClubsInput,takeClubsLimit,RequestProblem} from '@/lib/clubs/route-helpers';
import {ensureClubsTables} from '@/lib/clubs/database';
import {clubsSession} from '@/lib/clubs/session';
import {json} from '@/lib/clubs/responses';
export async function POST(request:Request){
 try{
  const value=await readClubsInput(request,8000) as {question?:unknown};
  if(!value||typeof value.question!=='string'||!value.question.trim()||value.question.length>2000)return json({message:'Please ask one question, up to 2,000 characters.'},400);
  const session=clubsSession(request);if(!session)return json({status:'handoff',message:'Please refresh this page with cookies enabled, or contact Tim directly.'},403);
  const db=getDatabase();await ensureClubsTables(db);
  if(!await takeClubsLimit(db,'ask',session,env.OPENAI_API_KEY||''))return json({status:'handoff',message:'The assistant has reached its usage limit for now. You can browse the FAQ or contact Tim directly.'},429);
  return json(await answerQuestion(value.question,{apiKey:env.OPENAI_API_KEY}));
 }catch(error){return json({status:'handoff',message:error instanceof RequestProblem?error.message:'The assistant is unavailable right now. You can browse the FAQ or contact Tim directly.'},error instanceof RequestProblem?error.status:503);}
}
