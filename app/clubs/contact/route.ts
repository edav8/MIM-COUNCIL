import {env} from 'cloudflare:workers';
import {getDatabase} from '@/db';
import {forwardHandoff,validateHandoff} from '@/lib/clubs/handoff-engine.mjs';
import {openD1Store} from '@/lib/clubs/d1-store';
import {readClubsInput,takeClubsLimit,RequestProblem} from '@/lib/clubs/route-helpers';
import {ensureClubsTables} from '@/lib/clubs/database';
import {clubsSession} from '@/lib/clubs/session';
import {json} from '@/lib/clubs/responses';
export async function POST(request:Request){
 try{
  const value=await readClubsInput(request) as {id:string;summary:string;contact:string;consent:{confirmed:boolean;summary:string;contact:string}};
  if(!validateHandoff(value))return json({status:'invalid',message:'Please review your message and confirm that you want it sent.'},400);
  const session=clubsSession(request);if(!session)return json({status:'unavailable',message:'Please refresh with cookies enabled or email Tim directly.'},403);
  const db=getDatabase();await ensureClubsTables(db);
  if(!await takeClubsLimit(db,'contact',session,env.RESEND_API_KEY||''))return json({status:'unavailable',message:'The contact form has reached its usage limit for now. Please email Tim directly.'},429);
  return json(await forwardHandoff(value,{apiKey:env.RESEND_API_KEY,from:'Tim · MIM28 Clubs <feedback@mim28.com>',to:'Timothy.Schweins@insead.edu',store:openD1Store(db)}));
 }catch(error){return json({status:error instanceof RequestProblem?'invalid':'unavailable',message:error instanceof RequestProblem?error.message:'Forwarding could not be confirmed. Please retry this same request or email Tim directly.'},error instanceof RequestProblem?error.status:503);}
}
