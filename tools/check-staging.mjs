import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {verify,sha256} from '../verify.mjs';
import {publicRepositoryFiles} from '../public-package.mjs';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).filter(e=>e.name!=='.git').flatMap(e=>{const p=path.join(dir,e.name);assert(!fs.lstatSync(p).isSymbolicLink(),'Symlink forbidden');return e.isDirectory()?walk(p):[p];});
export function compareTrees(a,b){const list=p=>walk(p).map(f=>path.relative(p,f).split(path.sep).join('/')).sort();assert.deepEqual(list(a),list(b),'Website file set changed');for(const n of list(a))assert.equal(sha256(fs.readFileSync(path.join(a,n))),sha256(fs.readFileSync(path.join(b,n))),'Website byte mismatch '+n);}
export function checkWorkflows(){
 const pins=JSON.parse(fs.readFileSync(path.join(root,'tools','action-pins.json'))),verifyText=fs.readFileSync(path.join(root,'.github','workflows','verify.yml'),'utf8'),pages=fs.readFileSync(path.join(root,'.github','workflows','pages.yml'),'utf8');
 for(const text of [verifyText,pages])for(const m of text.matchAll(/uses:\s*actions\/([a-z-]+)@([0-9a-f]+)/g)){assert.equal(m[2],pins[m[1]].sha,'Action pin mismatch');assert.equal(m[2].length,40);}
 for(const text of [verifyText,pages]){assert(!/uses:\s*[^@\n]+@(?![0-9a-f]{40}\b)/.test(text),'Unpinned action');assert(text.includes('persist-credentials: false'));assert(text.includes('tests/publication.test.mjs'));assert(text.includes('mktemp -d'));assert(!text.includes('--out site\n'));assert(!/pull_request_target|secrets\.|enablement:\s*true/.test(text));}
 assert(verifyText.includes('contents: read'));assert(!/pages: write|id-token: write|deploy-pages/.test(verifyText));
 const onBlock=pages.slice(pages.indexOf('on:'),pages.indexOf('permissions:'));
 assert(onBlock.includes('workflow_dispatch:'));assert(!/\bpush:|\bpull_request:|\bschedule:/.test(onBlock),'Pages must be manual only');
 assert(pages.includes("inputs.confirm_publication != 'PUBLISH'"));assert(pages.includes("github.ref != 'refs/heads/main'"));assert(pages.includes('enablement: false'));assert(pages.includes('needs: build'));assert(pages.includes('name: github-pages'));
 const [build,deploy]=pages.split('\n  deploy:');assert(build&&!/pages: write|id-token: write/.test(build));assert(deploy.includes('pages: write')&&deploy.includes('id-token: write'));
 return {actionPins:6,verificationPermissions:'contents:read',pages:'manual dispatch; PUBLISH input; main branch; deployment permissions scoped to deploy job'};
}
export function checkStaging(built=null){
 const release=JSON.parse(fs.readFileSync(path.join(root,'RELEASE_MANIFEST.json')));
 const actual=walk(root).map(p=>path.relative(root,p).split(path.sep).join('/')).sort();
 assert.deepEqual(actual,[...release.files.map(f=>f.path),'RELEASE_MANIFEST.json'].sort(),'Unexpected staging files');
 const signatures=[/^\s*-----BEGIN [A-Z ]*PRIVATE KEY-----/m,/"seedHex"\s*:/,/(?:^|\n)\s*(?:PRIVATE_KEY|SECRET_KEY|PASSWORD)\s*=\s*["']?[A-Za-z0-9+/]{12}/,/\bghp_[A-Za-z0-9]{30,}\b/,/\bgithub_pat_[A-Za-z0-9_]{30,}\b/];
 let links=0,htmlPages=0;
 for(const f of release.files){const p=path.join(root,f.path),b=fs.readFileSync(p),text=b.toString('utf8');assert.equal(sha256(b),f.sha256,'Release hash changed: '+f.path);assert(!signatures.some(re=>re.test(text)),'Sensitive signature: '+f.path);assert(!/EVALUATOR_FEEDBACK|Zone\.Identifier|(?:^|\/)\.env(?:$|\.)|VIDEO_RUNBOOKS|V1_RECORDING_READY|LIVE_DEMO_ISOLATION|\.mp4$|\.webm$/.test(f.path),'Private/unnecessary path');}
 for(const p of walk(path.join(root,'site')).filter(p=>/\.(html|md)$/.test(p))){const text=fs.readFileSync(p,'utf8');if(p.endsWith('.html'))htmlPages++;const targets=p.endsWith('.html')?[...text.matchAll(/(?:href|src)="([^"]+)"/g)].map(m=>m[1]):[...text.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)].map(m=>m[1]);for(const t of targets){if(/^(?:https?:|mailto:)/.test(t))continue;const [name,fragment]=t.split('#'),dest=name?path.resolve(path.dirname(p),name):p;assert(fs.existsSync(dest),'Broken public link '+t);if(fragment&&dest.endsWith('.html'))assert(fs.readFileSync(dest,'utf8').includes('id="'+fragment+'"'));links++;}}
 const officialHash='cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30';
 assert.equal(sha256(fs.readFileSync(path.join(root,'LICENSE'))),officialHash,'Official Apache license text changed');
 for(const p of ['site/LICENSE','site/reproduce/LICENSE'])assert.equal(sha256(fs.readFileSync(path.join(root,p))),officialHash);
 const scope=fs.readFileSync(path.join(root,'LICENSE_SCOPE.txt'),'utf8');
 assert(scope.includes('Excluded from blanket relicensing')&&scope.includes('Third-party')&&scope.includes('AI-assistance disclosure'));
 for(const p of ['site/LICENSE_SCOPE.txt','site/reproduce/LICENSE_SCOPE.txt'])assert.equal(fs.readFileSync(path.join(root,p),'utf8'),scope);
 assert(fs.readFileSync(path.join(root,'site/docs/ATTRIBUTION.html'),'utf8').includes('Licensing update:'));
 const data=verify(root);assert.deepEqual(data,verify(path.join(root,'site','reproduce')));
 for(const n of publicRepositoryFiles(root))assert.equal(sha256(fs.readFileSync(path.join(root,n))),sha256(fs.readFileSync(path.join(root,'site','reproduce',n))),'Canonical standalone source differs '+n);
 if(built)compareTrees(path.join(root,'site'),path.resolve(built));
 return {files:actual.length,htmlPages,localLinksAndFragments:links,releaseHashes:'PASS',source:'publication-candidate-002 with approved original-work licensing',statistics:data.statistics,workflows:checkWorkflows(),rawMarkdown:'All nine original sources byte-identical',remoteCI:'NOT_RUN',hosting:'NOT_ENABLED'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{const args=process.argv.slice(2);assert(args.length===0||(args.length===2&&args[0]==='--built'),'Usage: node tools/check-staging.mjs [--built FRESH_BUILD]');console.log(JSON.stringify(checkStaging(args[1]),null,2));}catch(e){console.error('STAGING CHECK FAILED:',e.message);process.exitCode=1;}}
