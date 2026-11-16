import { z } from 'zod';
import { apiError,apiResponse,CmsError,readJson,requireStaff,sameOrigin } from '@/lib/cms/server';
import { formSchema } from '@/lib/engagement/model';
export const dynamic='force-dynamic';
export const runtime='nodejs';
const date=z.iso.date();
export async function GET(request:Request){
 try{
  const url=new URL(request.url),action=url.searchParams.get('action')||'report';
  const {db,member}=await requireStaff(action==='responses'||action==='response');
  if(action==='form'){
    const [form,versions]=await Promise.all([db.from('eng_forms').select('*').eq('id','local-cloud').single(),db.from('eng_form_versions').select('*').eq('form_id','local-cloud').order('version',{ascending:false})]);
    if(form.error)throw form.error;if(versions.error)throw versions.error;return apiResponse({form:form.data,versions:versions.data});
  }
  if(action==='response'){
    const id=z.uuid().parse(url.searchParams.get('id'));const {data,error}=await db.from('eng_responses').select('*').eq('id',id).single();if(error)throw error;
    const {data:version,error:versionError}=await db.from('eng_form_versions').select('definition').eq('form_id',data.form_id).eq('version',data.form_version).single();if(versionError)throw versionError;
    return apiResponse({response:data,definition:version.definition});
  }
  const from=date.parse(url.searchParams.get('from')),to=date.parse(url.searchParams.get('to'));
  if(from>to||(Date.parse(to)-Date.parse(from))/86400000>366)throw new CmsError(400,'اختَر فترة حتى سنة واحدة.');
  if(action==='responses'){
    const page=z.coerce.number().int().min(0).max(100000).parse(url.searchParams.get('page')||0),version=url.searchParams.get('version'),status=url.searchParams.get('status');
    // Calendar dates are Amman dates (UTC+03); no browser timezone conversion.
    let query=db.from('eng_responses').select('id,form_version,created_at,status,analysis,locale',{count:'exact'}).gte('created_at',`${from}T00:00:00+03:00`).lt('created_at',new Date(Date.parse(`${to}T00:00:00+03:00`)+86400000).toISOString()).order('created_at',{ascending:false}).range(page*20,page*20+19);
    if(version)query=query.eq('form_version',z.coerce.number().int().positive().parse(version));if(status)query=query.eq('status',z.enum(['received','reviewing','contacted','closed','erased']).parse(status));
    const {data,error,count}=await query;if(error)throw error;return apiResponse({responses:data,count,page});
  }
  if(action!=='report')throw new CmsError(404,'المسار غير موجود.');
  const {data,error}=await db.rpc('eng_report',{p_from:from,p_to:to});if(error)throw error;return apiResponse({...data,manager:member.role==='manager'});
 }catch(e){if(e instanceof z.ZodError)return apiResponse({error:'الفترة أو الفلاتر غير صالحة.'},400);return apiError(e);}
}
export async function POST(request:Request){
 try{
  sameOrigin(request);const raw=await readJson(request,512*1024);
  const input=z.object({action:z.enum(['save','publish','response','erase']),version:z.number().int().positive().optional(),body:z.unknown()}).strict().parse(raw);
  const {db,user}=await requireStaff(input.action!=='save');
  const body=input.action==='save'?formSchema.parse(input.body):input.action==='erase'?z.object({id:z.uuid(),confirmation:z.literal('حذف الإجابات')}).strict().parse(input.body):input.action==='response'?z.object({id:z.uuid(),status:z.enum(['received','reviewing','contacted','closed']),note:z.string().max(2000)}).strict().parse(input.body):{};
  if(!['response','erase'].includes(input.action)&&!input.version)throw new CmsError(400,'نسخة النموذج مطلوبة.');
  const {data,error}=await db.rpc('eng_form_edit',{p_actor:user.id,p_action:input.action,p_body:body,p_expected:input.version??null});if(error)throw error;return apiResponse({record:data});
 }catch(e){if(e instanceof z.ZodError)return apiResponse({error:e.issues.slice(0,4).map(i=>i.message).join('، ')},400);return apiError(e);}
}
