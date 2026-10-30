import test from 'node:test';
import assert from 'node:assert/strict';
import {matchingIdeas,normalizeIdeaTitle} from '../lib/idea-matches.ts';
const ideas=[{id:'sun',title:'Sunday Football'},{id:'mon',title:'Monday football'},{id:'rugby',title:'Rugby'},{id:'movie',title:'Movie Night'}];
test('case, punctuation and soccer spelling share an exact title',()=>{
 assert.equal(normalizeIdeaTitle(' Sunday FOOTBALL! '),normalizeIdeaTitle('Sunday soccer'));
 assert.equal(normalizeIdeaTitle('Monday Soccar'),normalizeIdeaTitle('Monday football'));
});
test('exact matches rank first; a different day stays a separate title',()=>{
 assert.equal(matchingIdeas('Sunday football',ideas)[0].id,'sun');
 assert.notEqual(normalizeIdeaTitle('Monday football'),normalizeIdeaTitle('Sunday football'));
 assert.ok(matchingIdeas('Monday football',ideas).some(i=>i.id==='sun'));
 assert.deepEqual(matchingIdeas('Puppy yoga',ideas),[]);
});
test('empty and short titles do not create distracting suggestions',()=>{
 assert.deepEqual(matchingIdeas('',ideas),[]);assert.deepEqual(matchingIdeas('a',ideas),[]);
});
