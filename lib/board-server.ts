import { getDatabase } from '@/db';
import { catalog } from './idea-catalog';
export const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function voter(request:Request) {
 const value=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith('salamander_visitor='))?.split('=')[1];
 return value&&uuidPattern.test(value)?value:crypto.randomUUID();
}
export function boardResponse(data:unknown,request:Request,id:string,status=200) {return Response.json(data,{status,headers:{'Cache-Control':'no-store','Set-Cookie':`salamander_visitor=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=15552000${new URL(request.url).protocol==='https:'?'; Secure':''}`}});}
export function validOrigin(request:Request) {const origin=request.headers.get('origin');return !origin||origin===new URL(request.url).origin;}
export async function publicIdeaExists(id:string) {return catalog.some(i=>i.id===id)||Boolean(await getDatabase().prepare("SELECT id FROM ideas WHERE id=? AND is_public=1 AND moderation_status IN ('approved','legacy')").bind(id).first());}
