const cookieName='mim28_clubs_session';
export function clubsSession(request:Request){
 const value=request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='))?.slice(cookieName.length+1);
 return value&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)?value:null;
}
export function withClubsSession(response:Response,request:Request){
 if(!clubsSession(request))response.headers.set('Set-Cookie',`${cookieName}=${crypto.randomUUID()}; Path=/clubs; HttpOnly; SameSite=Strict; Max-Age=86400${new URL(request.url).protocol==='https:'?'; Secure':''}`);
 return response;
}
