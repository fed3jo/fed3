import { cloudSurvey } from '@/lib/fed3/cloud';
import { formSchema } from './model';
const groupIds=['organization','technical','support'];
const scores:Record<string,number[]>={network:[2,1,0],hardware:[2,1,0],technical:[2,0],maintenance:[2,1,0]};
export const initialForm=formSchema.parse({id:'local-cloud',active:true,title:{ar:'استبيان جاهزية السحابة المحلية',en:'Local cloud readiness survey'},description:{ar:'عرّفنا على احتياج مؤسستكم. الإرسال لطلب المراجعة والتواصل، ولا يعني قبولًا أو موعدًا أو التزامًا بالتجهيز. لا ترسلوا كلمات مرور أو ملفات أو معلومات حساسة.',en:'Tell us about your organization’s needs. Submitting requests a review and contact; it does not confirm acceptance, dates or setup. Do not send passwords, files or sensitive information.'},groups:groupIds.map((id,i)=>({id,title:{ar:['عن المؤسسة','الجاهزية التقنية','الدعم والمتابعة'][i],en:['Your organization','Technical readiness','Support and maintenance'][i]}})),questions:cloudSurvey.flatMap((fields,i)=>fields.flatMap(field=>[
  {id:field.id,groupId:groupIds[i],label:field.label,help:{ar:'',en:''},type:field.type==='radio'?'single':field.type==='checkbox'?'multi':field.type,required:!field.optional,options:(field.options??[]).map((label,j)=>({id:`option-${j+1}`,label,score:scores[field.id]?.[j]??null}))},
  ...(field.hasOther?[{id:`${field.id}-other`,groupId:groupIds[i],label:{ar:'إذا اخترتم أخرى، وضّحوا الإجابة (اختياري)',en:'If you chose Other, describe it (optional)'},help:{ar:'',en:''},type:'text',required:false,options:[]}]:[])
]))});
