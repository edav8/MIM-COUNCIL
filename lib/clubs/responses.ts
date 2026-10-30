export const securityHeaders={
 'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',
 'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"
};
export function json(value:unknown,status=200){return Response.json(value,{status,headers:securityHeaders});}
export function html(value:string){return new Response(value,{headers:{...securityHeaders,'Content-Type':'text/html; charset=utf-8'}});}
