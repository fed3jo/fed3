import { randomUUID, createHash } from 'node:crypto';
import { z } from 'zod';
import { appSchema, backupSchema, mediaSchema, publishIssues } from '@/lib/cms/model';
import { apiError, apiResponse, authClient, cmsConfigured, CmsError, readJson, requireStaff, sameOrigin } from '@/lib/cms/server';
import { mediaTypes, mediaSignature } from '@/lib/cms/media';
import { seedDocuments } from '@/lib/cms/seed';

export const runtime='nodejs';
export const dynamic='force-dynamic';
type Context={params:Promise<{path:string[]}>};
function parsed<T>(schema:z.ZodType<T>,data:unknown):T {
  const result=schema.safeParse(data); if(!result.success)throw new CmsError(400,result.error.issues.slice(0,5).map(i=>`${i.path.join('.')}: ${i.message}`).join('\n')); return result.data;
}
export async function GET(_request:Request,context:Context) {
  try {
    const path=(await context.params).path.join('/');
    const {db,user,member}=await requireStaff(path==='export');
    if(path==='export') {const {data,error}=await db.rpc('cms_snapshot',{p_actor:user.id});if(error)throw error; return apiResponse(backupSchema.parse(data));}
    if(path!=='state')throw new CmsError(404,'المسار غير موجود.');
    const results=await Promise.all([
      db.from('cms_apps').select('*').order('position').order('id'),
      db.from('cms_media').select('data').order('created_at',{ascending:false}).limit(1000),
      db.from('cms_audit').select('*').order('id',{ascending:false}).limit(100),
      member.role==='manager'? db.from('cms_staff').select('*').order('email'):Promise.resolve({data:[],error:null}),
      db.from('cms_meta').select('version').eq('id',1).single(),
    ]);
    for(const r of results)if(r.error)throw r.error;
    return apiResponse({member,apps:results[0].data,media:results[1].data?.map((m:{data:unknown})=>m.data),audit:results[2].data,staff:results[3].data,version:(results[4].data as {version:number}).version});
  }catch(error){return apiError(error);}
}
export async function POST(request:Request,context:Context) {
  try {
    sameOrigin(request);
    const path=(await context.params).path.join('/');
    if(!cmsConfigured())throw new CmsError(503,'لوحة الإدارة بانتظار ربط Supabase.');
    if(path==='login') {
      const input=parsed(z.object({email:z.email().max(254),password:z.string().min(1).max(256)}).strict(),await readJson(request,4096));
      const auth=await authClient();
      const {error}=await auth.auth.signInWithPassword(input);
      if(error)throw new CmsError(401,'تعذّر تسجيل الدخول. راجع البريد وكلمة المرور.');
      try{const {member}=await requireStaff();return apiResponse({member});}catch(e){await auth.auth.signOut({scope:'local'});throw e;}
    }
    if(path==='logout') {const auth=await authClient();await auth.auth.signOut({scope:'local'});return apiResponse({ok:true});}
    const manager=['publish','archive','unarchive','seed','restore','staff'].includes(path);
    const {db,user}=await requireStaff(manager);
    const apply=async(action:string,body:unknown,expected:number|null=null)=>{const {data,error}=await db.rpc('cms_apply',{p_actor:user.id,p_action:action,p_body:body,p_expected:expected});if(error)throw error;return apiResponse({record:data});};
    const raw=await readJson(request,path==='restore'?3*1024*1024:1024*1024);
    if(path==='save') {const input=parsed(z.object({document:appSchema,version:z.number().int().positive().nullable()}).strict(),raw); return apply('save',input.document,input.version);}
    if(['publish','archive','unarchive'].includes(path)) {
      const input=parsed(z.object({id:z.string().max(80),version:z.number().int().positive()}).strict(),raw);
      if(path==='publish'||path==='unarchive') {
        const {data,error}=await db.from('cms_apps').select('*').eq('id',input.id).single();if(error)throw error;
        const content=path==='publish'?data.draft:data.published;
        if(content){const issues=publishIssues(appSchema.parse(content));if(issues.length)throw new CmsError(422,issues.join('\n'));}
      }
      return apply(path,{id:input.id},input.version);
    }
    if(path==='seed')return apply('seed',{apps:seedDocuments.map(doc=>appSchema.parse(doc))});
    if(path==='staff') {
      const input=parsed(z.object({user_id:z.uuid(),role:z.enum(['manager','editor']),active:z.boolean()}).strict(),raw);
      const {data,error}=await db.auth.admin.getUserById(input.user_id);if(error||!data.user.email)throw new CmsError(400,'لم نجد حساب Auth بهذا المعرّف.');
      return apply('staff',{...input,email:data.user.email});
    }
    if(path==='upload') {
      const input=parsed(z.object({mime:z.enum(Object.keys(mediaTypes) as [keyof typeof mediaTypes,...(keyof typeof mediaTypes)[]]),bytes:z.number().int().positive().max(40*1024*1024)}).strict(),raw);
      if(input.mime.startsWith('image/')&&input.bytes>8*1024*1024)throw new CmsError(400,'الحد الأقصى للصورة 8 MB.');
      const id=randomUUID(),filePath=`${user.id}/${id}/asset.${mediaTypes[input.mime]}`;
      const {data,error}=await db.storage.from('cms-media').createSignedUploadUrl(filePath);if(error)throw error;
      return apiResponse({id,path:filePath,token:data.token,url:process.env.SUPABASE_URL,key:process.env.SUPABASE_PUBLISHABLE_KEY});
    }
    if(path==='media') {
      const input=parsed(mediaSchema.omit({sha256:true,url:true}),raw);
      if(!input.path.startsWith(`${user.id}/${input.id}/asset.`))throw new CmsError(403,'مسار الرفع غير صالح.');
      const {data:blob,error}=await db.storage.from('cms-media').download(input.path);if(error||!blob)throw new CmsError(400,'تعذّر التحقق من الملف المرفوع.');
      const bytes=new Uint8Array(await blob.arrayBuffer());
      if(bytes.length!==input.bytes||bytes.length>40*1024*1024||!mediaSignature(bytes,input.mime))throw new CmsError(400,'محتوى الملف أو حجمه لا يطابق نوعه.');
      if(input.mime.startsWith('image/')&&bytes.length>8*1024*1024)throw new CmsError(400,'الصورة أكبر من 8 MB.');
      const {data}=db.storage.from('cms-media').getPublicUrl(input.path);
      return apply('media',{...input,url:data.publicUrl,sha256:createHash('sha256').update(bytes).digest('hex')});
    }
    if(path==='media-update') {
      const input=parsed(mediaSchema.pick({id:true,name:true,alt:true,license:true,sourceUrl:true}),raw);
      const {data,error}=await db.from('cms_media').select('data').eq('id',input.id).single();if(error)throw error;
      return apply('media',{...mediaSchema.parse(data.data),...input});
    }
    if(path==='restore') {
      const input=parsed(z.object({backup:backupSchema,version:z.number().int().min(0)}).strict(),raw);
      for(const app of input.backup.apps)if(app.published){const issues=publishIssues(app.published);if(issues.length)throw new CmsError(422,`النسخة المنشورة من ${app.id}: ${issues.join('، ')}`);}
      // A JSON content restore may only refer to assets already verified in this project.
      const {data,error}=await db.from('cms_media').select('data');if(error)throw error;
      const known=new Map(data.map(r=>[r.data.id,r.data]));
      for(const asset of input.backup.media) {const found=known.get(asset.id);if(!found||found.sha256!==asset.sha256||found.path!==asset.path||found.url!==asset.url)throw new CmsError(422,'ملفات النسخة غير موجودة أو مختلفة. استخدم استعادة النسخة الكاملة حسب دليل الإدارة.');}
      return apply('restore',input.backup,input.version);
    }
    throw new CmsError(404,'المسار غير موجود.');
  }catch(error){return apiError(error);}
}
