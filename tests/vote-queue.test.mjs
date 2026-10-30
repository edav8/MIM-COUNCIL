import test from 'node:test';
import assert from 'node:assert/strict';
import { createVoteQueue, rankIdeas } from '../lib/vote-queue.ts';
const tick = () => new Promise(resolve => setImmediate(resolve));
function setup() {
  const states = new Map([['a', {count:4,voted:false}], ['b',{count:2,voted:true}]]);
  const requests=[], failures=[], pending=new Set();
  const queue=createVoteQueue({
    read:id=>states.get(id), render:(id,state)=>states.set(id,state),
    save:(id,voted)=>new Promise((resolve,reject)=>requests.push({id,voted,resolve,reject})),
    pending:(id,saving)=>saving?pending.add(id):pending.delete(id), failed:id=>failures.push(id),
  });
  return {queue,states,requests,failures,pending};
}
test('a like appears before a slow server responds; response reconciles shared count',async()=>{
 const x=setup();x.queue.toggle('a');
 assert.deepEqual(x.states.get('a'),{count:5,voted:true});assert.equal(x.pending.has('a'),true);
 x.requests[0].resolve({count:8,voted:true});await tick();
 assert.deepEqual(x.states.get('a'),{count:8,voted:true});assert.equal(x.queue.isPending(),false);
});
test('rapid like and undo render immediately and save in order',async()=>{
 const x=setup();x.queue.toggle('a');x.queue.toggle('a');
 assert.deepEqual(x.states.get('a'),{count:4,voted:false});assert.equal(x.requests.length,1);
 x.requests[0].resolve({count:5,voted:true});await tick();
 assert.deepEqual(x.states.get('a'),{count:4,voted:false});assert.equal(x.requests[1].voted,false);
 x.requests[1].resolve({count:4,voted:false});await tick();assert.equal(x.queue.isPending(),false);
});
test('repeated taps coalesce to final desired state without duplicate votes',async()=>{
 const x=setup();x.queue.toggle('a');x.queue.toggle('a');x.queue.toggle('a');
 assert.deepEqual(x.states.get('a'),{count:5,voted:true});
 x.requests[0].resolve({count:5,voted:true});await tick();assert.equal(x.requests.length,1);
});
test('separate ideas can save concurrently and arrive in reverse order',async()=>{
 const x=setup();x.queue.toggle('a');x.queue.toggle('b');
 assert.equal(x.requests.length,2);x.requests[1].resolve({count:1,voted:false});await tick();
 assert.equal(x.pending.has('a'),true);x.requests[0].resolve({count:5,voted:true});await tick();
 assert.deepEqual([...x.states.values()],[{count:5,voted:true},{count:1,voted:false}]);
});
test('failure restores confirmed count, reports error, and allows retry',async()=>{
 const x=setup();x.queue.toggle('a');x.requests[0].reject(new Error('offline'));await tick();
 assert.deepEqual(x.states.get('a'),{count:4,voted:false});assert.deepEqual(x.failures,['a']);
 assert.equal(x.pending.size,0);x.queue.toggle('a');assert.equal(x.requests.length,2);
 x.requests[1].resolve({count:5,voted:true});await tick();assert.equal(x.states.get('a').voted,true);
});
test('failed undo restores the successfully saved like',async()=>{
 const x=setup();x.queue.toggle('a');x.queue.toggle('a');x.requests[0].resolve({count:5,voted:true});await tick();
 x.requests[1].reject(new Error('offline'));await tick();assert.deepEqual(x.states.get('a'),{count:5,voted:true});
});
test('most wanted sorts by actual counts, handles zero and ties stably without mutation',()=>{
 const original=[{id:'a'},{id:'b'},{id:'c'},{id:'d'}];
 assert.deepEqual(rankIdeas(original,{b:9,c:9,a:1}).map(x=>x.id),['b','c','a','d']);
 assert.deepEqual(original.map(x=>x.id),['a','b','c','d']);
});
