import { createClient } from '@supabase/supabase-js';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { backupSchema } from '../lib/cms/model';
import { verifyBackupFiles } from '../lib/cms/backup';

async function main(){
  const {SUPABASE_URL:url,SUPABASE_SERVICE_ROLE_KEY:key}=process.env;
  if(!url||!key)throw Error('أضف متغيرات Supabase إلى .env.local أولًا.');
  const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:staff,error:staffError}=await db.from('cms_staff').select('user_id').ilike('email',process.env.CMS_MANAGER_EMAIL||'Fed3JoR@proton.me').eq('role','manager').eq('active',true).single();
  if(staffError)throw Error('لم نجد مديرًا نشطًا للبريد المحدد.');
  const {data,error}=await db.rpc('cms_snapshot',{p_actor:staff.user_id});if(error)throw error;
  const backup=backupSchema.parse(data);
  const parent=resolve('backups');await mkdir(parent,{recursive:true});const root=await mkdtemp(join(parent,'fed3-'));
  const files=new Map<string,Uint8Array>();
  await verifyBackupFiles(backup,async path=>{const {data:blob,error}=await db.storage.from('cms-media').download(path);if(error||!blob)throw Error(`تعذّر تنزيل ملف: ${path}`);const bytes=new Uint8Array(await blob.arrayBuffer());files.set(path,bytes);return bytes;});
  for(const [path,bytes]of files){const target=resolve(root,'media',path);await mkdir(dirname(target),{recursive:true});await writeFile(target,bytes);}
  const audit:unknown[]=[];
  for(let offset=0;;offset+=1000){const {data:rows,error}=await db.from('cms_audit').select('*').order('id').range(offset,offset+999);if(error)throw error;audit.push(...rows);if(rows.length<1000)break;}
  await writeFile(join(root,'audit.json'),JSON.stringify(audit,null,2));
  await writeFile(join(root,'content.json'),JSON.stringify(backup,null,2));
  console.log(`اكتملت نسخة ${backup.apps.length} تطبيق و${backup.media.length} ملف، مع التحقق من SHA-256: ${root}`);
}
main().catch(()=>{console.error('فشل النسخ. تحقق من الاتصال والصلاحيات والمساحة. لم تُعلن النسخة مكتملة.');process.exitCode=1;});
