import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reportTarget} from '../scripts/report-router.mjs';
test('Existing website pages and write endpoints remain owned by the original site',()=>{
 for(const path of ['/','/team','/clubs','/clubs/faq','/reps','/api/board','/api/ideas','/api/votes','/api/presentation-other','/reports/unrelated'])assert.equal(reportTarget(path),null,path);
});
test('Report page and its exact reserved API routes are delegated',()=>{
 for(const path of ['/reports/student-life','/reports/student-life/','/reports/student-life/index.html'])assert.equal(reportTarget(path),'/',path);
 for(const path of ['/api/snapshot','/api/presentation','/api/query-rows','/api/queries/overview','/api/deployment-assets/html','/_data/charts/abcdefgh'])assert.equal(reportTarget(path),path);
});
