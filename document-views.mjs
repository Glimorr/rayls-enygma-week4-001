import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {PUBLIC_PACKAGE_FILES} from './public-package.mjs';
export const DOCUMENT_FILES=PUBLIC_PACKAGE_FILES.filter(n=>n.endsWith('.md'));
const escape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const readable=file=>'docs/'+file.replace(/\.md$/,'.html');
export function preferDocumentViews(html){
 return html.replace(/href="reproduce\/([A-Za-z0-9_-]+\.md)"/g,(whole,file)=>DOCUMENT_FILES.includes(file)?'href="'+readable(file)+'"':whole);
}
function hrefFor(destination){
 assert(!/^(?:javascript|data|vbscript):/i.test(destination),'Unsafe document link');
 const [name,fragment]=destination.split('#');
 return (DOCUMENT_FILES.includes(name)?name.replace(/\.md$/,'.html'):/^(?:https?:|mailto:|#)/.test(destination)?destination:'../reproduce/'+name)+(fragment&&!/^(?:https?:|mailto:|#)/.test(destination)?'#'+fragment:'');
}
export function inlineMarkdown(text){
 const token=/\x60([^\x60]+)\x60|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s<>]+)/g;
 let html='',previous=0;
 for(const m of text.matchAll(token)){
  html+=escape(text.slice(previous,m.index));
  if(m[1]!==undefined)html+='<code>'+escape(m[1])+'</code>';
  else if(m[2]!==undefined)html+='<strong>'+inlineMarkdown(m[2])+'</strong>';
  else if(m[3]!==undefined)html+='<a href="'+escape(hrefFor(m[4]))+'">'+inlineMarkdown(m[3])+'</a>';
  else html+='<a href="'+escape(m[5])+'">'+escape(m[5])+'</a>';
  previous=m.index+m[0].length;
 }
 return html+escape(text.slice(previous));
}
function cells(line){return line.trim().replace(/^\|/,'').replace(/\|$/,'').split(/(?<!\\)\|/).map(c=>c.trim().replace(/\\\|/g,'|'));}
const tableRule=line=>/^\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim());
const isHeading=line=>/^#{1,6}\s/.test(line);
const isList=line=>/^\s*(?:[-*]|\d+\.)\s+/.test(line);
const isFence=line=>/^(\x60{3,}|~{3,})/.test(line);
export function renderMarkdown(source){
 const lines=source.replace(/\r\n/g,'\n').split('\n'),output=[];let i=0;
 while(i<lines.length){
  const line=lines[i];
  if(!line.trim()){i++;continue;}
  const fence=/^(\x60{3,}|~{3,})([A-Za-z0-9_-]*)\s*$/.exec(line);
  if(fence){const code=[];i++;while(i<lines.length&&!lines[i].startsWith(fence[1]))code.push(lines[i++]);assert(i<lines.length,'Unclosed Markdown fence');i++;output.push('<pre><code'+(fence[2]?' class="language-'+fence[2]+'"':'')+'>'+escape(code.join('\n'))+'</code></pre>');continue;}
  const h=/^(#{1,6})\s+(.+)$/.exec(line);
  if(h){output.push('<h'+h[1].length+'>'+inlineMarkdown(h[2])+'</h'+h[1].length+'>');i++;continue;}
  if(i+1<lines.length&&line.includes('|')&&tableRule(lines[i+1])){
   const header=cells(line),rows=[];i+=2;
   while(i<lines.length&&lines[i].trim()&&lines[i].includes('|')){const row=cells(lines[i]);assert.equal(row.length,header.length,'Markdown table column mismatch');rows.push(row);i++;}
   output.push('<div class="table-scroll" role="region" aria-label="Document table" tabindex="0"><table><thead><tr>'+header.map(c=>'<th scope="col">'+inlineMarkdown(c)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(c=>'<td>'+inlineMarkdown(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>');continue;
  }
  if(isList(line)){const ordered=/^\s*\d+\./.test(line),tag=ordered?'ol':'ul',items=[];while(i<lines.length&&isList(lines[i])&&(/^\s*\d+\./.test(lines[i])===ordered)){items.push(lines[i++].replace(/^\s*(?:[-*]|\d+\.)\s+/,''));}output.push('<'+tag+'>'+items.map(item=>'<li>'+inlineMarkdown(item)+'</li>').join('')+'</'+tag+'>');continue;}
  // Raw HTML is escaped. Other source text is retained in paragraphs.
  const paragraph=[line];i++;
  while(i<lines.length&&lines[i].trim()&&!isHeading(lines[i])&&!isList(lines[i])&&!isFence(lines[i])&&!(i+1<lines.length&&lines[i].includes('|')&&tableRule(lines[i+1])))paragraph.push(lines[i++]);
  output.push('<p>'+inlineMarkdown(paragraph.join(' '))+'</p>');
 }
 return output.join('\n');
}
const styles='body{margin:0;background:#edf2f1;color:#142d38;font:18px/1.7 system-ui,sans-serif}main{max-width:960px;margin:auto;padding:24px}article{background:#fff;border-radius:12px;padding:clamp(20px,4vw,40px)}h1{font-size:clamp(28px,5vw,42px);line-height:1.2}h2{font-size:26px;line-height:1.3;margin-top:36px}h3{font-size:22px}a{color:#075f70;text-underline-offset:3px}nav{display:flex;flex-wrap:wrap;gap:12px 24px;margin-bottom:20px}.document-meta{font-size:15px;overflow-wrap:anywhere;margin-bottom:20px}p,li,td,th{overflow-wrap:anywhere}code{font:0.9em ui-monospace,monospace;overflow-wrap:anywhere}pre{background:#f1f5f4;border-radius:8px;padding:16px;overflow:auto;line-height:1.6}pre code{white-space:pre;overflow-wrap:normal}.table-scroll{overflow-x:auto;margin:24px 0}table{border-collapse:collapse;width:100%;font-size:16px}th,td{padding:12px;border-bottom:1px solid #bdcfd0;text-align:left;vertical-align:top}th{background:#f1f5f4}li{margin:8px 0}a:focus-visible,.table-scroll:focus-visible{outline:3px solid #075f70;outline-offset:4px}@media(max-width:540px){main{padding:12px}article{padding:20px}body{font-size:18px}table{min-width:560px}}';
export function writeDocumentViews(target,root){
 const dir=path.join(target,'docs');fs.mkdirSync(dir);
 for(const file of DOCUMENT_FILES){
  const bytes=fs.readFileSync(path.join(root,file)),source=bytes.toString('utf8'),sha=crypto.createHash('sha256').update(bytes).digest('hex');
  const title=source.split(/\r?\n/).find(line=>line.startsWith('# '))?.slice(2)||file;
  const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(title)+' · Rayls research</title><style>'+styles+'</style></head><body><main><nav aria-label="Document navigation"><a href="../index.html">Research website</a><a href="FINAL_REPORT.html">Final report</a><a href="EVIDENCE_INDEX.html">Evidence index</a><a href="../reproduce/'+file+'" download>Download original Markdown</a></nav><div class="document-meta">Rendered from <a href="../reproduce/'+file+'">'+file+'</a>. Source SHA-256: <code>'+sha+'</code></div><aside role="note"><strong>Licensing update:</strong> Apache-2.0 now covers the approved original code, documentation and applicable website expression. Preserved evidence and third-party works retain their existing rights. This supersedes earlier licensing-status statements in preserved documents, without changing their text or AI disclosure. <a href="../licensing.html">Read the scope and exclusions</a>.</aside><article>'+renderMarkdown(source)+'</article></main></body></html>';
  fs.writeFileSync(path.join(dir,file.replace(/\.md$/,'.html')),html,{flag:'wx'});
 }
}
