import { createHash } from 'node:crypto';
import { backupSchema, type ContentBackup } from './model';
import { mediaSignature } from './media';

export async function verifyBackupFiles(backup:ContentBackup,read:(path:string)=>Promise<Uint8Array>) {
  for(const asset of backup.media) {
    const bytes=await read(asset.path);
    if(bytes.length!==asset.bytes||createHash('sha256').update(bytes).digest('hex')!==asset.sha256||!mediaSignature(bytes,asset.mime))throw new Error(`الملف مفقود أو تغيّر: ${asset.path}`);
  }
}
export function remapBackup(backup:ContentBackup,changes:Map<string,{path:string;url:string}>):ContentBackup {
  const urls=new Map(backup.media.map(m=>[m.url,changes.get(m.id)?.url??m.url]));
  function walk(value:unknown):unknown {
    if(typeof value==='string')return urls.get(value)??value;
    if(Array.isArray(value))return value.map(walk);
    if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,walk(item)]));
    return value;
  }
  const next=walk(backup) as ContentBackup;
  next.media=next.media.map(m=>({...m,path:changes.get(m.id)?.path??m.path}));
  return backupSchema.parse(next);
}
