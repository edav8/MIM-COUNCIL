import {readFileSync,writeFileSync,renameSync,copyFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const expected='d09ca3464f34cc141d712b20c1031266a2e4b92b1478184899c2a47b4e47fa77';
const worker=readFileSync('lib/reports/student-life-worker.mjs');
if(createHash('sha256').update(worker).digest('hex')!==expected)throw new Error('Packaged report worker changed; repackage and update the expected fingerprint.');
if(!existsSync('dist/server/index.js'))throw new Error('Build the existing website first.');
renameSync('dist/server/index.js','dist/server/site-main.js');
copyFileSync('lib/reports/student-life-worker.mjs','dist/server/student-life-worker.mjs');
copyFileSync('scripts/report-router.mjs','dist/server/report-router.mjs');
writeFileSync('dist/server/index.js',`import siteWorker from './site-main.js';
import reportWorker from './student-life-worker.mjs';
import {reportTarget} from './report-router.mjs';
export * from './site-main.js';
export default {
  ...siteWorker,
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const target = reportTarget(url.pathname);
    if (target === null) return siteWorker.fetch(request, env, ctx);
    if (target !== url.pathname) { url.pathname = target; request = new Request(url, request); }
    return reportWorker.fetch(request, env, ctx);
  }
};
`);
console.log('Attached the packaged report; existing website routes retain their original handler.');
