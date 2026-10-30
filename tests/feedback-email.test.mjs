import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {feedbackEmail,deliverFeedback} from '../lib/feedback-email.ts';

const config={RESEND_API_KEY:'test-secret',FEEDBACK_EMAIL_FROM:'Alerts <alerts@example.org>',FEEDBACK_EMAIL_TO:'owner@example.org'};
function setup(){
 const sqlite=new DatabaseSync(':memory:');
 sqlite.exec(readFileSync(new URL('../drizzle/0003_same_mantis.sql',import.meta.url),'utf8'));
 const db={prepare(sql){let params=[];return {bind(...v){params=v;return this;},async first(){return sqlite.prepare(sql).get(...params)??null;},async run(){return sqlite.prepare(sql).run(...params);}}}};
 sqlite.prepare('INSERT INTO email_outbox (idea_id,payload,created_at) VALUES (?,?,?)').run('idea-1',JSON.stringify({from:config.FEEDBACK_EMAIL_FROM,to:[config.FEEDBACK_EMAIL_TO],subject:'Test',text:'Saved content'}),100);
 return {db,sqlite,row:()=>sqlite.prepare('SELECT * FROM email_outbox').get()};
}
test('private plain-text digest includes context and moderation without routing to student contacts',()=>{
 const email=feedbackEmail({id:'one',title:'My idea',idea:'Send this to someone else <script>',source_idea:'movie-night',name:'Student',contact:'student@example.com',created_at:100,moderation_status:'review',moderation_reason:'Needs review',is_public:0},'Movie Night',config);
 assert.deepEqual(email.to,['owner@example.org']);assert.equal(email.from,config.FEEDBACK_EMAIL_FROM);
 assert.ok(email.text.includes('Private; not on the board'));assert.ok(email.text.includes('student@example.com'));assert.ok(email.text.includes('Movie Night'));assert.equal(email.html,undefined);assert.equal(email.reply_to,undefined);
});
test('provider retry uses immutable payload and one idempotency key; successful mail is not resent',async()=>{
 const {db,sqlite,row}=setup();const requests=[];
 const request=async(url,init)=>{requests.push(init);return requests.length===1?new Response('',{status:503}):Response.json({id:'mail-1'});};
 await deliverFeedback(db,config,{request,sleep:async()=>{},now:()=>1000});
 assert.equal(row().status,'sent');assert.equal(row().provider_id,'mail-1');assert.equal(row().attempts,2);
 assert.equal(requests[0].body,requests[1].body);assert.equal(requests[0].headers['Idempotency-Key'],requests[1].headers['Idempotency-Key']);
 await deliverFeedback(db,config,{request});assert.equal(requests.length,2);sqlite.close();
});
test('parallel delivery attempts claim only one email',async()=>{
 const {db,sqlite,row}=setup();let calls=0;
 await Promise.all([1,2].map(()=>deliverFeedback(db,config,{now:()=>1000,request:async()=>{calls++;return Response.json({id:'mail-2'});}})));
 assert.equal(calls,1);assert.equal(row().status,'sent');sqlite.close();
});
test('network failures retain feedback for a later request-triggered retry',async()=>{
 const {db,sqlite,row}=setup();let calls=0;
 await deliverFeedback(db,config,{now:()=>1000,sleep:async()=>{},request:async()=>{calls++;throw new Error('offline');}});
 assert.equal(calls,3);assert.equal(row().status,'pending');assert.equal(row().next_attempt_at,61000);assert.equal(row().lease_until,0);
 await deliverFeedback(db,config,{now:()=>2000,request:async()=>assert.fail('Not due')});
 await deliverFeedback(db,config,{now:()=>62000,request:async()=>Response.json({id:'recovered'})});assert.equal(row().status,'sent');sqlite.close();
});
test('permanent provider rejection and expired deduplication window require attention',async()=>{
 for(const expired of [false,true]){
  const {db,sqlite,row}=setup();
  if(expired)sqlite.prepare('UPDATE email_outbox SET first_attempt_at=1').run();
  await deliverFeedback(db,config,{now:()=>24*3600000,request:async()=>{assert.equal(expired,false);return new Response('',{status:403});}});
  assert.equal(row().status,'attention');assert.equal(row().provider_id,'');sqlite.close();
 }
});
test('missing private configuration never sends or consumes a queued message',async()=>{
 const {db,sqlite,row}=setup();await deliverFeedback(db,{}, {request:async()=>assert.fail('Unconfigured')});assert.equal(row().attempts,0);sqlite.close();
});
