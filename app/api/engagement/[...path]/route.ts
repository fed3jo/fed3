import { createHash,randomUUID } from 'node:crypto';
import { z } from 'zod';
import { apiError,apiResponse,CmsError,cmsConfigured,readJson,sameOrigin,serviceClient } from '@/lib/cms/server';
import { appSchema } from '@/lib/cms/model';
import { analyzeAnswers,formSchema,validateAnswers } from '@/lib/engagement/model';
import { signTicket } from '@/lib/engagement/tokens';
import { limit,rpc,ticket } from '@/lib/engagement/server';
export const runtime='nodejs';
export const dynamic='force-dynamic';
type Context={params:Promise<{path:string[]}>};
const token=z.string().max(1500);
export async function GET(request:Request,context:Context){
  try{
    if((await context.params).path.join('/')!=='form')throw new CmsError(404,'المسار غير موجود.');
    if(!cmsConfigured())return apiResponse({form:null});
    await limit(request,'form-read',60);
    const db=serviceClient();const {data:form,error}=await db.from('eng_forms').select('published_version').eq('id','local-cloud').maybeSingle();if(error)throw error;
    if(!form?.published_version)return apiResponse({form:null});
    const {data:version,error:versionError}=await db.from('eng_form_versions').select('definition').eq('form_id','local-cloud').eq('version',form.published_version).single();if(versionError)throw versionError;
    const definition=formSchema.parse(version.definition);if(!definition.active)return apiResponse({form:null});
    const issued=Date.now();return apiResponse({form:{definition,version:form.published_version,token:signTicket({id:randomUUID(),kind:'form',version:form.published_version,issued,exp:issued+2*60*60*1000},process.env.SUPABASE_SERVICE_ROLE_KEY!)}});
  }catch(e){return apiError(e);}
}
export async function POST(request:Request,context:Context){
  try{
    sameOrigin(request);if(!cmsConfigured())throw new CmsError(503,'الخدمة غير مهيأة.');
    const path=(await context.params).path.join('/'),raw=await readJson(request,256*1024);
    if(path==='download'){
      await limit(request,'download',60);
      const input=z.object({id:z.uuid(),app:z.string().max(80),platform:z.string().max(80)}).strict().parse(raw);
      const {data,error}=await serviceClient().from('cms_apps').select('published').eq('id',input.app).eq('archived',false).single();if(error||!data?.published)throw new CmsError(404,'التطبيق غير منشور.');
      const app=appSchema.parse(data.published);if(input.platform!=='general'&&!app.downloads.some(d=>d.platform===input.platform))throw new CmsError(400,'نظام غير موجود ضمن روابط التطبيق.');
      return apiResponse(await rpc('eng_event',{p_id:input.id,p_kind:'download',p_app:input.app,p_platform:input.platform}));
    }
    if(path==='game/start'){
      await limit(request,'game-start',10);
      const input=z.object({id:z.uuid(),initialStage:z.number().int().min(0).max(3)}).strict().parse(raw);
      const result=await rpc('eng_event',{p_id:input.id,p_kind:'game_start',p_stage:input.initialStage});
      // Reissuing a start never extends the original database expiry.
      const {data,error}=await serviceClient().from('eng_attempts').select('expires_at,started_at').eq('id',input.id).single();if(error)throw error;
      return apiResponse({...result,token:signTicket({id:input.id,kind:'game',issued:Date.parse(data.started_at),exp:Date.parse(data.expires_at)},process.env.SUPABASE_SERVICE_ROLE_KEY!)});
    }
    if(path==='game/progress'||path==='game/complete'){
      await limit(request,'game-event',100);
      const input=z.object({token,stage:z.number().int().min(1).max(3).optional()}).strict().parse(raw);const session=ticket(input.token,'game');
      if(path.endsWith('progress')&&!input.stage)throw new CmsError(400,'المرحلة مطلوبة.');
      return apiResponse(await rpc('eng_event',{p_id:session.id,p_kind:path.endsWith('progress')?'progress':'game_complete',p_stage:input.stage??0}));
    }
    if(path==='form/submit'){
      await limit(request,'form-submit',5,3600);
      const input=z.object({token,locale:z.enum(['ar','en']),answers:z.unknown(),consent:z.literal(true),website:z.string().max(200)}).strict().parse(raw);
      if(input.website)throw new CmsError(400,'تعذّر إرسال النموذج.');const session=ticket(input.token,'form');
      if(Date.now()-session.issued<3000)throw new CmsError(429,'راجع إجاباتك قبل الإرسال.');
      const {data,error}=await serviceClient().from('eng_form_versions').select('definition').eq('form_id','local-cloud').eq('version',session.version!).single();if(error)throw error;
      const definition=formSchema.parse(data.definition);let answers;try{answers=validateAnswers(definition,input.answers);}catch(e){throw new CmsError(422,e instanceof Error?e.message:'راجع الإجابات.');}
      const analysis=analyzeAnswers(definition,answers);const hash=createHash('sha256').update(JSON.stringify({version:session.version,answers,locale:input.locale})).digest('hex');
      return apiResponse(await rpc('eng_submit',{p_id:session.id,p_version:session.version,p_locale:input.locale,p_answers:answers,p_analysis:analysis,p_hash:hash}));
    }
    throw new CmsError(404,'المسار غير موجود.');
  }catch(e){if(e instanceof z.ZodError)return apiResponse({error:'راجع البيانات والحقول المطلوبة.'},400);return apiError(e);}
}
