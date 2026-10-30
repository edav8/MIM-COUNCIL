import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {openD1Store} from '../lib/clubs/d1-store.ts';
import {takeClubsLimit,readClubsInput} from '../lib/clubs/route-helpers.ts';
function database(){
 const native=new DatabaseSync(':memory:');native.exec(readFileSync(new URL('../drizzle/0005_clubs_assistant.sql',import.meta.url),'utf8'));
 const wrap=(sql,args=[])=>({bind(...values){return wrap(sql,values);},async run(){const s=native.prepare(sql);if(/RETURNING|SELECT/i.test(sql))return {results:s.all(...args),meta:{changes:0}};const r=s.run(...args);return {results:[],meta:{changes:r.changes}};}});
 return {native,prepare:sql=>wrap(sql),async batch(queries){native.exec('BEGIN IMMEDIATE');try{const result=[];for(const q of queries)result.push(await q.run());native.exec('COMMIT');return result;}catch(e){native.exec('ROLLBACK');throw e;}}};
}
const claim=(owner='one',now=1000)=>({id:'request-1',fingerprint:'hash',owner,now,leaseUntil:now+30000,retryBefore:100000});
test('metadata adapter leases, conflicts, stale ownership and accepted replay',async()=>{
 const db=database(),store=openD1Store(db);
 assert.deepEqual(await store.claim(claim()),{state:'claimed',firstAttemptAt:1000});
 assert.equal((await store.claim(claim('two'))).state,'inflight');
 assert.equal((await store.claim({...claim('two'),fingerprint:'other'})).state,'conflict');
 assert.equal((await store.claim(claim('two',32000))).state,'claimed');
 assert.equal(await store.finish({...claim(),state:'accepted',providerId:'receipt'}),false);
 assert.equal(await store.finish({...claim('two'),state:'accepted',providerId:'receipt'}),true);
 assert.deepEqual(await store.claim(claim('three',90000)),{state:'accepted',providerId:'receipt'});
 assert.equal((await store.claim(claim('three',200000))).state,'accepted');
 assert.equal(db.native.prepare('SELECT firstAttemptAt,retryBefore FROM clubs_handoffs').get().retryBefore,100000);
});
test('expired uncertain sends cannot claim again; payload fields are not stored',async()=>{
 const db=database(),s=openD1Store(db);await s.claim({...claim(),payload:{summary:'private'},providerBody:{text:'private'}});
 await s.finish({...claim(),state:'uncertain',providerId:null});
 assert.equal((await s.claim(claim('two',100001))).state,'expired');
 assert.equal(JSON.stringify(db.native.prepare('SELECT * FROM clubs_handoffs').all()).includes('private'),false);
});
test('contact client boundary is exact and denied requests do not drain global limit',async()=>{
 const db=database();for(let i=0;i<5;i++)assert.equal(await takeClubsLimit(db,'contact','192.0.2.1','secret',1000),true);
 assert.equal(await takeClubsLimit(db,'contact','192.0.2.1','secret',1000),false);
 assert.equal(db.native.prepare("SELECT count FROM clubs_limits WHERE key='contact:global:0'").get().count,5);
 const rows=JSON.stringify(db.native.prepare('SELECT * FROM clubs_limits').all());assert.equal(rows.includes('192.0.2.1'),false);
 assert.equal(await takeClubsLimit(db,'contact','192.0.2.1','secret',3600001),true);
});
test('global boundary exact across clients; no trusted identity fails closed',async()=>{
 const db=database();for(let i=0;i<100;i++)assert.equal(await takeClubsLimit(db,'contact',`192.0.2.${i}`,'secret',1000),true);
 assert.equal(await takeClubsLimit(db,'contact','198.51.100.1','secret',1000),false);
 assert.equal(db.native.prepare("SELECT count FROM clubs_limits WHERE key='contact:global:0'").get().count,100);
 assert.equal(await takeClubsLimit(db,'ask',null,'secret',1000),false);
});
function req(body,extra={}){return new Request('https://mim28.com/api/clubs/contact',{method:'POST',headers:{origin:'https://mim28.com','content-type':'application/json',...extra},body});}
test('input reader enforces origin, JSON and byte limit without trusting length header',async()=>{
 assert.deepEqual(await readClubsInput(req('{"a":1}')),{a:1});
 await assert.rejects(readClubsInput(req('{}',{origin:'https://evil.example'})),{status:403});
 await assert.rejects(readClubsInput(req('{}',{'content-type':'text/plain'})),{status:415});
 await assert.rejects(readClubsInput(req('"'+'é'.repeat(100)+'"'),100),{status:413});
 await assert.rejects(readClubsInput(req('{bad}')),{status:400});
});
