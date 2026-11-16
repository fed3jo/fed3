import { createClient } from '@supabase/supabase-js';
import { readFile, realpath } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { resolve, join, relative, isAbsolute } from 'node:path';
import { backupSchema, publishIssues } from '../lib/cms/model';
import { verifyBackupFiles, remapBackup } from '../lib/cms/backup';

async function main(){
  const folder=process.argv[2];if(!folder)throw Error('مرّر مسار مجلد النسخة.');
  const root=await realpath(resolve(folder));
  const backup=backupSchema.parse(JSON.parse(await readFile(join(root,'content.json'),'utf8')));
  const files=new Map<string,Uint8Array>();
  await verifyBackupFiles(backup,async path=>{const target=await realpath(resolve(root,'media',path));const rel=relative(root,target);if(rel.startsWith('..')||isAbsolute(rel))throw Error('مسار خارج مجلد النسخة');const bytes=await readFile(target);files.set(path,bytes);return bytes;});
  for(const app of backup.apps)if(app.published&&publishIssues(app.published).length)throw Error('محتوى منشور غير صالح');
  if(!process.argv.includes('--apply')){console.log(`النسخة سليمة: ${backup.apps.length} تطبيق و${backup.media.length} ملف. لم يتغير شيء. أضف --apply للاستعادة بعد مراجعة مشروع الوجهة.`);return;}
  const {SUPABASE_URL:url,SUPABASE_SERVICE_ROLE_KEY:key}=process.env;
  if(!url||!key)throw Error('متغيرات الوجهة غير متاحة');
  const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:staff,error:staffError}=await db.from('cms_staff').select('user_id').ilike('email',process.env.CMS_MANAGER_EMAIL||'Fed3JoR@proton.me').eq('role','manager').eq('active',true).single();if(staffError)throw Error('مدير الوجهة غير موجود');
  const {data:before,error:beforeError}=await db.rpc('cms_snapshot',{p_actor:staff.user_id});if(beforeError)throw beforeError;
  const expected=backupSchema.parse(before).version;
  const prefix=`restores/${randomUUID()}`,uploaded:string[]=[],changes=new Map<string,{path:string;url:string}>();
  try{
    for(const asset of backup.media){const path=`${prefix}/${asset.id}.${asset.path.split('.').pop()}`;const {error}=await db.storage.from('cms-media').upload(path,files.get(asset.path)!,{contentType:asset.mime,upsert:false});if(error)throw error;uploaded.push(path);const {data}=db.storage.from('cms-media').getPublicUrl(path);changes.set(asset.id,{path,url:data.publicUrl});}
    const restored=remapBackup(backup,changes);
    await verifyBackupFiles(restored,async path=>{const {data:blob,error}=await db.storage.from('cms-media').download(path);if(error||!blob)throw Error('تعذّر فحص الملف بعد رفعه');return new Uint8Array(await blob.arrayBuffer());});
    const {error}=await db.rpc('cms_apply',{p_actor:staff.user_id,p_action:'restore',p_body:restored,p_expected:expected});if(error)throw error;
    const {data:after,error:afterError}=await db.rpc('cms_snapshot',{p_actor:staff.user_id});if(afterError)throw afterError;
    const verified=backupSchema.parse(after);
    for(const original of restored.apps){const item=verified.apps.find(a=>a.id===original.id);if(!item||JSON.stringify(item.draft)!==JSON.stringify(original.draft)||JSON.stringify(item.published)!==JSON.stringify(original.published)||item.archived!==original.archived)throw Error('التحقق من المحتوى لم ينجح');}
    console.log(`اكتملت الاستعادة وتحقّقنا من ${restored.apps.length} تطبيق. سجل التعديلات والصلاحيات الحالية محفوظان. احتفظ بنسخة audit.json الأصلية كأرشيف.`);
  }catch(error){
    // Never delete staged files after the content transaction has committed.
    const {data:now}=await db.from('cms_meta').select('version').eq('id',1).single();
    if(now?.version===expected)for(let i=0;i<uploaded.length;i+=1000)await db.storage.from('cms-media').remove(uploaded.slice(i,i+1000));
    throw error;
  }
}
main().catch(()=>{console.error('لم تكتمل الاستعادة أو التحقق. راجع الإعدادات والنسخة وسجل القاعدة؛ لا تكرر التطبيق قبل فحص الحالة.');process.exitCode=1;});
