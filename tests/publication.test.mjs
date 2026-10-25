import crypto from 'node:crypto';
import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {verify,build,packageRoot} from '../verify.mjs';
import {PUBLIC_PACKAGE_FILES,publicRepositoryFiles} from '../public-package.mjs';
let candidate;
const files=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);
before(()=>{candidate=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'rayls-publication-')),'candidate');build(packageRoot,candidate,verify());});
test('Public reproduction files exactly match the source allowlist; internal material excluded',()=>{
 const actual=files(path.join(candidate,'reproduce')).map(p=>path.relative(path.join(candidate,'reproduce'),p).split(path.sep).join('/')).sort();
 assert.deepEqual(actual,publicRepositoryFiles(packageRoot));assert.equal(actual.filter(p=>p.startsWith('evidence/')).length,76);
 assert(!actual.some(p=>/VIDEO_RUNBOOKS|V1_RECORDING_READY|LIVE_DEMO|HANDOFF|EVALUATOR_FEEDBACK|Zone\.Identifier|\.env(?:$|\.)/i.test(p)));
 assert(PUBLIC_PACKAGE_FILES.includes('tests/publication.test.mjs'));
 assert(!fs.existsSync(path.join(candidate,'v1-panel.html')));
});
test('Every public HTML and Markdown file is free of production placeholders and private navigation',()=>{
 const banned=/LOCAL DRAFT|Recording slots only|No video URLs have been invented|awaiting owner recording|Unpublished local candidate|START RECORDING|STOP RECORDING|V1_RECORDING_READY\.md|VIDEO_RUNBOOKS\.md|LIVE_DEMO_ISOLATION\.md|on-camera|off-camera/i;
 for(const p of files(candidate).filter(p=>/\.(html|md)$/.test(p)))assert(!banned.test(fs.readFileSync(p,'utf8')),'Public production material: '+path.relative(candidate,p));
 const html=fs.readFileSync(path.join(candidate,'index.html'),'utf8');
 assert(!/<video\b|<iframe\b|id="videos"|href="#videos"/i.test(html),'Video gallery must be omitted without real links');
 assert(html.includes('held-out test of amount inference'));
 assert(html.includes('Attribution and AI assistance'));
});
test('All generated HTML and public Markdown links resolve locally, including fragments',()=>{
 for(const p of files(candidate).filter(p=>/\.(html|md)$/.test(p))){
  const text=fs.readFileSync(p,'utf8');
  const links=p.endsWith('.html')?[...text.matchAll(/(?:href|src)="([^"]+)"/g)].map(m=>m[1]):[...text.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)].map(m=>m[1]);
  for(const link of links){if(/^(?:https?:|mailto:)/.test(link))continue;const [rel,fragment]=link.split('#'),target=rel?path.resolve(path.dirname(p),rel):p;assert(fs.existsSync(target),'Broken link: '+p+' '+link);if(fragment&&target.endsWith('.html'))assert(fs.readFileSync(target,'utf8').includes('id="'+fragment+'"'),'Broken fragment '+link);}
 }
});
test('Published presentation preserves scientific results, status distinctions and dated provenance',()=>{
 const r=verify(path.join(candidate,'reproduce'));assert.equal(r.heldout.length,8);assert.equal(r.statistics.correct,3);assert.equal(r.statistics.accuracy,0.375);assert.equal(r.statistics.constantClassBaseline,0.5);assert.equal(r.statistics.oneSidedP,65/70);assert.equal(r.statistics.twoSidedP,1);
 assert.deepEqual(r.totals,{cumulativeEvents:160,cumulativeBatches:40,randomizedEvents:128,randomizedBatches:32,earlierEvents:32,earlierBatches:8,settled:16});
 assert(r.transactionAudit.rows.every(a=>a.sourceReceiptStatus===null&&a.destinationReceiptStatus===null&&a.beforeAfterBalances===null));
 assert.equal(r.transactionAudit.rows[0].sourceReferenceStatus,null);assert.equal(r.transactionAudit.rows[0].legacySourceStatus,1);
 const html=fs.readFileSync(path.join(candidate,'index.html'),'utf8');
 for(const text of ['0.928571','1.000000','TEMPORAL_ONLY','Eight held-out observations','source-to-runtime','not deployment versions','2026-10-25T17:22:52.883Z'])assert(html.includes(text),'Missing scientific/provenance statement '+text);
 assert(fs.readFileSync(path.join(candidate,'reproduce','ATTRIBUTION.md'),'utf8').includes('AI assistance was used'));
});
test('Selected public artifacts contain no private-key headers or credential-assignment signatures',()=>{
 const signatures=[/^\s*-----BEGIN [A-Z ]*PRIVATE KEY-----/m,/"seedHex"\s*:/,/(?:^|\n)\s*(?:PRIVATE_KEY|SECRET_KEY|PASSWORD)\s*=\s*["']?[A-Za-z0-9+/]{12}/,/\bghp_[A-Za-z0-9]{30,}\b/,/\bgithub_pat_[A-Za-z0-9_]{30,}\b/];
 for(const p of files(candidate)){const text=fs.readFileSync(p,'utf8');assert(!signatures.some(re=>re.test(text)),'Sensitive signature in '+path.relative(candidate,p));}
});

test('Readable document views preserve raw Markdown bytes and prefer HTML navigation',()=>{
 const names=PUBLIC_PACKAGE_FILES.filter(n=>n.endsWith('.md')),index=fs.readFileSync(path.join(candidate,'index.html'),'utf8');
 assert.equal(names.length,9);assert(!/href="reproduce\/[^"]+\.md"/.test(index),'Primary website navigation should use readable views');
 for(const name of names){
  const source=fs.readFileSync(path.join(packageRoot,name)),raw=fs.readFileSync(path.join(candidate,'reproduce',name));
  assert.deepEqual(raw,source,'Markdown bytes changed: '+name);
  const view=fs.readFileSync(path.join(candidate,'docs',name.replace(/\.md$/,'.html')),'utf8');
  assert(view.includes('name="viewport"'));assert(view.includes('font:18px/1.7'));assert(view.includes('overflow-x:auto'));
  assert(view.includes('href="../reproduce/'+name+'" download'),'Missing raw download '+name);
 }
 for(const name of ['FINAL_REPORT','EVIDENCE_INDEX','CURRENT_VS_HISTORICAL_RUNTIME_MATRIX','ATTRIBUTION'])assert(index.includes('href="docs/'+name+'.html"'),'Missing readable navigation '+name);
 const report=fs.readFileSync(path.join(candidate,'docs','FINAL_REPORT.html'),'utf8');
 for(const phrase of ['3/8','37.5%','65/70','p=1.000000','TEMPORAL_ONLY','no independent external timestamp','AI assistance was used'])assert(report.toLowerCase().includes(phrase.toLowerCase()),'Missing rendered claim/caveat '+phrase);
 const evidence=fs.readFileSync(path.join(candidate,'docs','EVIDENCE_INDEX.html'),'utf8');
 for(const id of ['E01','E18-Tnn','U01','R01'])assert(evidence.includes(id));
 const attribution=fs.readFileSync(path.join(candidate,'docs','ATTRIBUTION.html'),'utf8');assert(attribution.includes('AI assistance was used'));
});
test('Document renderer retains tables, code, links and escapes untrusted markup',async()=>{
 const {renderMarkdown,inlineMarkdown}=await import('../document-views.mjs');
 const tick=String.fromCharCode(96);
 const sample='# Test\n\n| ID | Result |\n|---|---|\n| E01 | 3/8 & 37.5% |\n\n- **Caveat**\n\n~~~sh\nnode verify.mjs --show summary\n~~~\n\n[Report](FINAL_REPORT.md) '+tick+'TEMPORAL_ONLY'+tick+' <script>alert(1)</script>';
 const html=renderMarkdown(sample);
 for(const text of ['<h1>Test</h1>','<table>','<td>E01</td>','3/8 &amp; 37.5%','<strong>Caveat</strong>','<pre><code class="language-sh">node verify.mjs --show summary','href="FINAL_REPORT.html"','<code>TEMPORAL_ONLY</code>','&lt;script&gt;'])assert(html.includes(text),'Renderer lost '+text);
 assert(!html.includes('<script>'));
 assert.throws(()=>inlineMarkdown('[unsafe](javascript:alert)'),/Unsafe document link/);
 assert.throws(()=>renderMarkdown('~~~sh\nunclosed'),/Unclosed/);
});

test('Approved Apache-2.0 text and scope are included without relicensing evidence',()=>{
 const expected='cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30';
 const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
 const official=fs.readFileSync(path.join(packageRoot,'LICENSE'));
 assert.equal(official.length,11358);assert.equal(digest(official),expected);
 for(const p of ['LICENSE','reproduce/LICENSE'])assert.equal(digest(fs.readFileSync(path.join(candidate,p))),expected);
 const scope=fs.readFileSync(path.join(packageRoot,'LICENSE_SCOPE.txt'),'utf8');
 for(const phrase of ['Covered original works','Excluded from blanket relicensing','Preserved research evidence','Third-party','AI-assistance disclosure','supersedes only those earlier licensing-status statements'])assert(scope.includes(phrase),'Missing scope '+phrase);
 assert.equal(fs.readFileSync(path.join(candidate,'reproduce/LICENSE_SCOPE.txt'),'utf8'),scope);
 assert.equal(fs.readFileSync(path.join(candidate,'LICENSE_SCOPE.txt'),'utf8'),scope);
 const index=fs.readFileSync(path.join(candidate,'index.html'),'utf8');assert(index.includes('href="licensing.html"'));
 assert(fs.readFileSync(path.join(candidate,'licensing.html'),'utf8').includes('Excluded from blanket relicensing'));
});
test('Preserved attribution stays intact with a separate visible licensing update',()=>{
 const original=fs.readFileSync(path.join(packageRoot,'ATTRIBUTION.md'));
 assert.deepEqual(fs.readFileSync(path.join(candidate,'reproduce','ATTRIBUTION.md')),original);
 const html=fs.readFileSync(path.join(candidate,'docs','ATTRIBUTION.html'),'utf8');
 assert(html.includes('AI assistance was used'));
 assert(html.includes('Licensing update:'));assert(html.includes('href="../licensing.html"'));
 assert(html.includes('No separate license for that new material is specified in this package.'),'Preserved original prose was removed');
 assert.equal(verify(path.join(candidate,'reproduce')).manifestFiles,76);
});
