export class RequestProblem extends Error {
  status:number;
  constructor(status:number,message:string){super(message);this.status=status;}
}
/** Check before reading or sending to providers. Strict same-origin JSON only. */
export async function readClubsInput(request:Request,maxBytes=16384):Promise<unknown> {
  if(request.method!=='POST')throw new RequestProblem(405,'Use the form to submit your question.');
  if(request.headers.get('origin')!==new URL(request.url).origin)throw new RequestProblem(403,'Open the clubs page to submit your question.');
  if(request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json')throw new RequestProblem(415,'Please submit using the clubs form.');
  const stated=request.headers.get('content-length');
  if(stated!==null&&(!/^\d+$/.test(stated)||Number(stated)>maxBytes))throw new RequestProblem(413,'Please shorten your message.');
  if(!request.body)throw new RequestProblem(400,'Please add your question.');
  const reader=request.body.getReader(),chunks:Uint8Array[]=[];let total=0;
  try {
    while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>maxBytes){await reader.cancel();throw new RequestProblem(413,'Please shorten your message.');}chunks.push(value);}
  }finally{reader.releaseLock();}
  const body=new Uint8Array(total);let position=0;for(const chunk of chunks){body.set(chunk,position);position+=chunk.byteLength;}
  try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(body));}catch{throw new RequestProblem(400,'Please submit a valid question using the form.');}
}
export function clubsJson(value:unknown,status=200) {
  return Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
}
/** Anonymous browser-session quota plus a shared daily ceiling. Keys are hashed with a server secret. */
export async function takeClubsLimit(db:D1Database,kind:'ask'|'contact',clientIdentity:string|null,salt:string,now=Date.now()) {
  if(!clientIdentity||!salt||!Number.isFinite(now))return false;
  const hour=Math.floor(now/3600000),day=Math.floor(now/86400000);
  const raw=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${salt}\u0000${kind}\u0000${hour}\u0000${clientIdentity}`));
  const hash=Array.from(new Uint8Array(raw),b=>b.toString(16).padStart(2,'0')).join('');
  const clientKey=`${kind}:client:${hour}:${hash}`,globalKey=`${kind}:global:${day}`;
  const clientMax=kind==='ask'?30:5,globalMax=kind==='ask'?500:100;
  const result=await db.batch([
    db.prepare('DELETE FROM clubs_limits WHERE expiresAt<=?').bind(now),
    db.prepare('INSERT OR IGNORE INTO clubs_limits (key,count,expiresAt) VALUES (?,0,?),(?,0,?)').bind(clientKey,(hour+1)*3600000,globalKey,(day+1)*86400000),
    // One statement consumes both quotas only if both are available. Failed
    // clients therefore do not deplete the shared global allowance.
    db.prepare('UPDATE clubs_limits SET count=count+1 WHERE key IN (?,?) AND (SELECT count FROM clubs_limits WHERE key=?)<? AND (SELECT count FROM clubs_limits WHERE key=?)<? RETURNING key').bind(clientKey,globalKey,clientKey,clientMax,globalKey,globalMax),
  ]);
  return result[2].results?.length===2;
}
