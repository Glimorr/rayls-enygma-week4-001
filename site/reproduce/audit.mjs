import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=(root,n)=>fs.readFileSync(path.join(root,'evidence',n),'utf8');
const json=(root,n)=>JSON.parse(read(root,n));
const hashPattern=/^0x[0-9a-fA-F]{64}$/;
const addressPattern=/^0x[0-9a-fA-F]{40}$/;
export function parseAudit(text,trial){
 const fields={};
 for(const line of text.split(/\r?\n/)){const m=/^([A-Z][A-Z0-9_]*):\s*(.*)$/.exec(line);if(m){assert(!(m[1] in fields),'Duplicate audit field: '+m[1]);fields[m[1]]=m[2];}}
 const id=trial.replace(/^T/,'');
 assert.equal(fields.TRIAL_ID,'W4_M15_T'+id,'Audit trial ID');
 assert.equal(fields.RESULT,'TRIAL '+id+' SETTLEMENT VERIFIED','Audit result');
 assert.equal(fields.PRIVATE_AMOUNT_MATCH,'TRUE');assert.equal(fields.READ_ONLY_AUDIT,'TRUE');
 const pick=(...names)=>{const present=names.filter(n=>fields[n]!==undefined);assert(present.length<=1,'Ambiguous audit aliases');return present.length?{field:present[0],value:fields[present[0]]}:null;};
 const integer=(item,label)=>{if(!item)return null;assert(/^\d+$/.test(item.value),'Invalid '+label);const n=Number(item.value);assert(Number.isSafeInteger(n),'Unsafe integer '+label);return n;};
 const checkedHash=(item,label)=>{assert(item&&hashPattern.test(item.value),'Invalid '+label);return item.value;};
 const sourceTransaction=checkedHash(pick('SOURCE_TX'),'source tx');
 const referenceId=checkedHash(pick('SOURCE_REFERENCE_ID'),'reference ID');
 const destinationMintTransaction=checkedHash(pick('DESTINATION_MINT_TX','MATCHED_MINT_TX'),'mint tx');
 const sourceBlock=integer(pick('SOURCE_BLOCK'),'source block'),destinationMintBlock=integer(pick('DESTINATION_MINT_BLOCK','MATCHED_MINT_BLOCK'),'mint block');
 assert(sourceBlock>0&&destinationMintBlock>0,'Missing block');
 const sourceReferenceStatus=integer(pick('SOURCE_REFERENCE_STATUS'),'source reference status');
 const destinationReferenceStatus=integer(pick('DESTINATION_REFERENCE_STATUS'),'destination reference status');
 const legacySourceStatus=integer(pick('SOURCE_STATUS'),'legacy source status'),legacyDestinationStatus=integer(pick('DESTINATION_STATUS'),'legacy destination status');
 if(sourceReferenceStatus!==null)assert.equal(sourceReferenceStatus,1,'Source reference must be SENT');
 if(destinationReferenceStatus!==null)assert.equal(destinationReferenceStatus,2,'Destination reference must be RECEIVED');
 if(legacySourceStatus!==null)assert.equal(legacySourceStatus,1,'Legacy source status');
 if(legacyDestinationStatus!==null)assert.equal(legacyDestinationStatus,2,'Legacy destination status');
 assert(sourceReferenceStatus!==null||legacySourceStatus!==null,'Missing source status');
 assert(destinationReferenceStatus!==null||legacyDestinationStatus!==null,'Missing destination status');
 const eventAssertion=(countName,booleanName)=>{const count=integer(pick(countName),countName);if(count!==null){assert.equal(count,1,countName);return {savedCount:count,savedVerified:null,sourceField:countName};}assert.equal(fields[booleanName],'true',booleanName);return {savedCount:null,savedVerified:true,sourceField:booleanName};};
 const reference=eventAssertion('REFERENCE_EVENT_COUNT','SOURCE_REFERENCE_VERIFIED'),burn=eventAssertion('BURN_EVENT_COUNT','SOURCE_BURN_VERIFIED'),dispatch=eventAssertion('DISPATCH_EVENT_COUNT','SOURCE_DISPATCH_VERIFIED');
 const mintItem=pick('MATCHING_MINT_COUNT','MATCHING_MINT_RECEIPTS'),mintCount=integer(mintItem,'mint count');assert.equal(mintCount,1,'Exactly one matched mint');
 const mintLogIndex=integer(pick('DESTINATION_MINT_LOG_INDEX'),'mint log index');
 // Receipt status is only populated from a field explicitly named as such.
 const sourceReceiptStatus=integer(pick('SOURCE_RECEIPT_STATUS'),'source receipt status'),destinationReceiptStatus=integer(pick('DESTINATION_RECEIPT_STATUS'),'destination receipt status');
 for(const s of [sourceReceiptStatus,destinationReceiptStatus])if(s!==null)assert.equal(s,1,'Receipt not successful');
 return {trial,referenceId,sourceTransaction,sourceBlock,sourceReceiptStatus,sourceReferenceStatus,legacySourceStatus,destinationMintTransaction,destinationMintBlock,mintLogIndex,destinationReceiptStatus,destinationReferenceStatus,legacyDestinationStatus,referenceAssertion:reference,burnAssertion:burn,dispatchAssertion:dispatch,mintAssertion:{savedCount:mintCount,sourceField:mintItem.field},privateAmountMatchDeclaration:true,rawTransactionReconstruction:'NOT_AVAILABLE',beforeAfterBalances:null,verificationLevel:'STRUCTURED_SAVED_AUDIT_CHECKS'};
}
function value(text,label){const lines=text.split(/\r?\n/),matches=lines.filter(l=>l.startsWith(label+': '));assert.equal(matches.length,1,'Missing/duplicate '+label);return matches[0].slice(label.length+2);}
export function deriveTopology(root){
 const snapshotName='enygma-m16-t16-hubonly.json',s=json(root,snapshotName),p=json(root,'enygma-m15-preregistration.json');
 const token=read(root,'enygma-production-bank-a-onchain-verification.log'),activation=read(root,'enygma-hub-approval-bank-a-activation-audit.log');
 const members=[...new Set(s.events.flatMap(e=>e.anonymitySet.map(Number)))].sort((a,b)=>a-b);
 assert(s.events.length>0&&members.length>0);
 for(const e of s.events){assert.equal(e.hubChainId,s.hubChainId,'Event Hub ID');assert.equal(e.tokenResourceId.toLowerCase(),s.tokenResourceId.toLowerCase(),'Event resource');assert.equal(e.eventContract.toLowerCase(),s.enygmaTeleport.toLowerCase(),'Event contract');assert.deepEqual(e.anonymitySet.map(Number).sort((a,b)=>a-b),members,'Anonymity set');assert.equal(e.participantCount,members.length);assert(members.includes(Number(e.destinationChainId)),'Destination membership');}
 assert.equal(Number(value(activation,'PNH chain')),s.hubChainId,'Activation Hub');
 assert.equal(Number(value(activation,'Bank A chain')),p.constantSourceChainId,'Activation source');
 assert.equal(Number(value(token,'Chain ID')),p.constantSourceChainId,'Token chain');
 assert.equal(Number(value(activation,'Issuer chain')),p.constantSourceChainId,'Issuer');
 assert.equal(value(activation,'Resource ID').toLowerCase(),s.tokenResourceId.toLowerCase());
 assert.equal(value(activation,'Token resource ID').toLowerCase(),s.tokenResourceId.toLowerCase());
 assert.equal(value(activation,'Symbol'),value(token,'Token symbol'));
 assert(members.includes(p.constantSourceChainId)&&members.includes(p.constantDestinationChainId));
 const tokenAddress=value(token,'Token address'),hubRegistry=value(activation,'Hub registry'),sourceRegistry=value(activation,'Bank A registry');
 for(const a of [tokenAddress,hubRegistry,sourceRegistry,s.enygmaTeleport])assert(addressPattern.test(a),'Invalid address');
 const bytecodeHash=value(token,'Runtime bytecode hash');assert(hashPattern.test(bytecodeHash),'Invalid runtime bytecode hash');
 assert.equal(value(token,'Contract bytecode'),'PRESENT');assert.equal(value(token,'Saved address'),'MATCHED');
 assert.equal(value(activation,'Active for Hub'),'true');
 return {scope:'LOCAL_DEVELOPMENT / HISTORICAL_SAVED_EVIDENCE',hubChainId:s.hubChainId,sourceChainId:p.constantSourceChainId,destinationChainId:p.constantDestinationChainId,participants:members,otherParticipants:members.filter(n=>![p.constantSourceChainId,p.constantDestinationChainId].includes(n)),tokenName:value(token,'Token name'),tokenSymbol:value(token,'Token symbol'),tokenAddress,resourceId:s.tokenResourceId,enygmaTeleport:s.enygmaTeleport,hubRegistry,sourceRegistry,tokenRuntimeBytecodeHash:bytecodeHash,tokenRuntimeBytes:Number(value(token,'Bytecode size').split(' ')[0]),routeClassification:'Documented source→Hub→destination route; IDs cross-checked across saved metadata',identityVerification:'OFFLINE_CROSS_ARTIFACT_CONSISTENCY',liveHealth:'NOT_QUERIED',sourceToRuntime:'UNVERIFIED',attribution:'TEMPORAL_ONLY',sources:[snapshotName,'enygma-m15-preregistration.json','enygma-production-bank-a-onchain-verification.log','enygma-hub-approval-bank-a-activation-audit.log']};
}
export function evidenceTable(root,heldout){
 const m=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'))),byName=new Map(m.files.map(f=>[f.name,f]));
 const p=json(root,'enygma-m15-preregistration.json');
 const evidence=n=>{assert(byName.has(n),'Not allowlisted');return {file:'evidence/'+n,sha256:byName.get(n).sha256};};
 const result=[];
 for(let i=1;i<=16;i++){
  const id=String(i).padStart(2,'0'),prefix='enygma-m16-t'+id,auditName=prefix+'-settlement-audit.log',deltaName=prefix+'-hubonly-new-events.csv',snapshotName=prefix+'-hubonly.json';
  const record=parseAudit(read(root,auditName),'T'+id);
  const lines=read(root,deltaName).trim().split(/\r?\n/),header=lines.shift().split(','),events=lines.map(l=>Object.fromEntries(l.split(',').map((v,j)=>[header[j],v])));
  const grouped=new Map();
  for(const e of events){const tx=e.hubTxHash;if(!grouped.has(tx))grouped.set(tx,{transaction:tx,hubBlock:Number(e.hubBlockNumber),hubTimestampUTC:e.hubTimestampUTC,eventCount:0});const b=grouped.get(tx);assert.equal(b.hubBlock,Number(e.hubBlockNumber));b.eventCount++;}
  assert.equal(events.length,8,'Trial must have 8 saved events');assert.equal(grouped.size,2,'Trial must have 2 saved batches');
  const feature=Math.max(...events.filter(e=>Number(e.destinationChainId)===p.constantDestinationChainId).map(e=>Number(e.ciphertextBytes)));
  const h=heldout.find(h=>h.trial===record.trial);
  const refs=[evidence(auditName),evidence(deltaName),evidence(snapshotName)];
  if(h)refs.push(evidence(prefix+'-heldout-prediction-v1.json'),evidence(prefix+'-heldout-hub-blind-v1.json'));
  result.push({...record,sourceChainId:p.constantSourceChainId,destinationChainId:p.constantDestinationChainId,hubBatches:[...grouped.values()],maxDestinationCiphertextBytes:feature,frozenPrediction:h?.predicted??null,actualAmountClass:h?.actual??null,labelAvailability:h?'OWNER_CONTROLLED_UNBLINDING':'TRAINING_LABEL_NOT_RELEASED',correct:h?.correct??null,attribution:'TEMPORAL_ONLY',evidence:refs,command:'node verify.mjs --show audit '+record.trial});
 }
 for(const field of ['referenceId','sourceTransaction','destinationMintTransaction'])assert.equal(new Set(result.map(r=>r[field])).size,16,'Duplicate '+field);
 return {schemaVersion:1,scope:'Creator-produced historical saved audits + independently recomputed offline joins; no raw receipt or calldata reconstruction',missingFieldPolicy:'null means not captured/released; never inferred from a differently named status',labels:{file:'ground-truth.csv',sha256:hash(fs.readFileSync(path.join(root,'ground-truth.csv')))},rows:result};
}
export function tableCSV(table){
 const headers=['trial','referenceId','sourceChainId','sourceTransaction','sourceBlock','sourceReceiptStatus','sourceReferenceStatus','legacySourceStatus','destinationChainId','destinationMintTransaction','destinationMintBlock','mintLogIndex','destinationReceiptStatus','destinationReferenceStatus','legacyDestinationStatus','referenceAssertion','burnAssertion','dispatchAssertion','mintAssertion','hubBatches','maxDestinationCiphertextBytes','frozenPrediction','actualAmountClass','labelAvailability','correct','beforeAfterBalances','verificationLevel','rawTransactionReconstruction','attribution','evidence','command'];
 const quote=v=>'"'+String(v===null||v===undefined?'':typeof v==='object'?JSON.stringify(v):v).replaceAll('"','""')+'"';
 return headers.join(',')+'\n'+table.rows.map(r=>headers.map(h=>quote(r[h])).join(',')).join('\n')+'\n';
}
export function topologyText(t){return ['OFFLINE CHECK: PASS | LOCAL DEVELOPMENT | HISTORICAL EVIDENCE','Hub '+t.hubChainId+' | Bank A '+t.sourceChainId+' | Bank B '+t.destinationChainId,'Other saved participants: '+t.otherParticipants.join(', '),'Token: '+t.tokenSymbol+' | '+t.tokenName,'Token address: '+t.tokenAddress,'EnygmaTeleport: '+t.enygmaTeleport,'IDs cross-checked across saved metadata; route is documented.','Live health: NOT QUERIED | image→source mapping: UNVERIFIED','Trial-to-Hub attribution: TEMPORAL_ONLY'].join('\n');}
export function auditText(r){return [r.trial+' | STRUCTURED SAVED AUDIT: PASS','Source chain '+r.sourceChainId+' block '+r.sourceBlock,'Source TX: '+r.sourceTransaction,'Reference: '+r.referenceId,'Source receipt status: '+(r.sourceReceiptStatus??'NOT CAPTURED')+' | reference: '+(r.sourceReferenceStatus??'legacy field only'),'Destination chain '+r.destinationChainId+' mint block '+r.destinationMintBlock,'Mint TX: '+r.destinationMintTransaction,'Destination receipt status: '+(r.destinationReceiptStatus??'NOT CAPTURED')+' | reference: '+(r.destinationReferenceStatus??'legacy field only'),'Saved burn/dispatch/matching mint assertions: PASS','Hub batches: '+r.hubBatches.length+' | maximum destination bytes: '+r.maxDestinationCiphertextBytes,'Raw receipt reconstruction: NOT AVAILABLE | attribution TEMPORAL_ONLY'].join('\n');}
