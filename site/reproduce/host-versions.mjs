import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
export function currentHostVersions(){
 const git=spawnSync('git',['--version'],{encoding:'utf8',timeout:10000});
 const npm=process.platform==='win32'?null:spawnSync('npm',['--version'],{encoding:'utf8',timeout:10000});
 // Windows npm availability was separately checked in PowerShell; no shell or Docker invoked here.
 return {scope:'CURRENT_COMMAND_HOST_ONLY_NOT_HISTORICAL',node:process.version,git:git.status===0?git.stdout.trim():'NOT_AVAILABLE',npm:npm?.status===0?npm.stdout.trim():process.platform==='win32'?'NOT_QUERIED_BY_NODE (PowerShell capture: npm unavailable on PATH)':'NOT_AVAILABLE',platform:process.platform,architecture:process.arch,docker:'NOT_QUERIED_BY_POLICY',compose:'NOT_QUERIED_BY_POLICY',historicalDeploymentVersions:'NOT_ESTABLISHED_BY_CURRENT_HOST'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const v=currentHostVersions();console.log(['CURRENT COMMAND HOST — not historical deployment versions','Node: '+v.node,'Git: '+v.git,'npm: '+v.npm,'Docker / Compose: NOT QUERIED (local-only restriction)','Historical contract/relayer build identities: UNVERIFIED'].join('\n'));}
