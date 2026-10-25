import fs from 'node:fs';
import path from 'node:path';
// Exact source-package file list. Historical evidence membership comes only from manifest.json.
export const PUBLIC_PACKAGE_FILES=[
 'LICENSE','LICENSE_SCOPE.txt','document-views.mjs','verify.mjs','audit.mjs','presentation.mjs','public-package.mjs','host-versions.mjs',
 'runtime-host-snapshot.json','CURRENT_VS_HISTORICAL_RUNTIME_MATRIX.md',
 'TRANSACTION_AUDIT_GUIDE.md','PACKAGE_CONTENTS.md','package.json','ground-truth.csv',
 'manifest.json','manifest.sha256','README.md','FINAL_REPORT.md','REPRODUCIBILITY.md',
 'EVIDENCE_INDEX.md','SOURCE_PROVENANCE.md','ATTRIBUTION.md',
 'tests/research.test.mjs','tests/audit.test.mjs','tests/publication.test.mjs',
 'ci/offline-verification.yml'
];
export function publicRepositoryFiles(root){
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
 const files=[...PUBLIC_PACKAGE_FILES,...manifest.files.map(f=>'evidence/'+f.name)].sort();
 if(new Set(files).size!==files.length)throw Error('Duplicate public package entry');
 for(const file of files){
  if(file.includes('..')||path.isAbsolute(file)||/^(?:EVALUATOR_FEEDBACK|experiments|source|analysis|recordings)(?:\/|$)/i.test(file)||/(?:\.env(?:$|\.)|Zone\.Identifier|VIDEO_RUNBOOKS|V1_RECORDING_READY|LIVE_DEMO_ISOLATION|HANDOFF|CREATED_FILES)/i.test(file))throw Error('Private/unnecessary public package entry');
 }
 return files;
}
export function copyPublicPackage(root,dest){
 fs.mkdirSync(dest);
 for(const file of publicRepositoryFiles(root)){
  const src=path.join(root,file),target=path.join(dest,file);
  if(fs.lstatSync(src).isSymbolicLink())throw Error('Public package symlink forbidden');
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.copyFileSync(src,target,fs.constants.COPYFILE_EXCL);
 }
}
