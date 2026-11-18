import { z } from 'zod';
import type { Locale } from '@/lib/fed3/config';

const copy=z.object({ar:z.string().trim().min(1).max(1000),en:z.string().trim().min(1).max(1000)}).strict();
const id=z.string().regex(/^[a-z][a-z0-9-]{0,69}$/);
export const questionSchema=z.object({id,groupId:id,label:copy,help:z.object({ar:z.string().max(1000),en:z.string().max(1000)}).strict(),type:z.enum(['text','textarea','email','number','single','multi']),required:z.boolean(),options:z.array(z.object({id,label:copy,score:z.number().int().min(0).max(2).nullable()}).strict()).max(20)}).strict();
export const formSchema=z.object({id:z.literal('local-cloud'),title:copy,description:copy,active:z.boolean(),groups:z.array(z.object({id,title:copy}).strict()).min(1).max(8),questions:z.array(questionSchema).min(1).max(40)}).strict().superRefine((form,ctx)=>{
  if(new Set(form.groups.map(g=>g.id)).size!==form.groups.length||new Set(form.questions.map(q=>q.id)).size!==form.questions.length)ctx.addIssue({code:'custom',message:'معرّفات الأقسام والأسئلة لازم تكون فريدة.'});
  if(form.groups.some(g=>!form.questions.some(q=>q.groupId===g.id)))ctx.addIssue({code:'custom',message:'كل قسم يحتاج سؤالًا واحدًا على الأقل.'});
  for(const q of form.questions){
    if(!form.groups.some(g=>g.id===q.groupId))ctx.addIssue({code:'custom',message:`قسم السؤال ${q.id} غير موجود.`});
    if(['single','multi'].includes(q.type)&&(q.options.length<2||new Set(q.options.map(o=>o.id)).size!==q.options.length))ctx.addIssue({code:'custom',message:`أكمل خيارات السؤال ${q.id} بمعرّفات فريدة.`});
    if(q.type!=='single'&&q.options.some(o=>o.score!==null))ctx.addIssue({code:'custom',message:'درجات الجاهزية متاحة لأسئلة الاختيار الواحد فقط.'});
    if(q.type==='single'&&q.options.some(o=>o.score!==null)&&q.options.some(o=>o.score===null))ctx.addIssue({code:'custom',message:'أكمل درجات كل خيارات السؤال أو اتركها كلها فارغة.'});
  }
});
export type FormDefinition=z.infer<typeof formSchema>;
export type Question=z.infer<typeof questionSchema>;
export type FormRecord={id:string;draft:FormDefinition;published_version:number|null;version:number};
export type PublicForm={definition:FormDefinition;version:number;token:string};
export type Answers=Record<string,string|string[]>;
export type Analysis={score:number|null;earned:number;possible:number;band:'prepare'|'review'|'ready'|'unscored';recommendations:string[]};
export function validateAnswers(form:FormDefinition,input:unknown,locale:Locale='ar'):Answers{
  const t=(ar:string,en:string)=>locale==='ar'?ar:en;
  const raw=z.record(z.string(),z.union([z.string().max(2000),z.array(z.string().max(70)).max(20)])).parse(input);
  const answers:Answers={};
  for(const key of Object.keys(raw))if(!form.questions.some(q=>q.id===key))throw new Error(t('في إجابة لسؤال غير موجود. حدّث الفورم.','An answer belongs to a question that no longer exists. Refresh the form.'));
  for(const q of form.questions){
    const v=raw[q.id];const empty=v===undefined||(typeof v==='string'?!v.trim():v.length===0);
    if(empty){if(q.required)throw new Error(t(`أكمل «${q.label.ar}»`,`Answer “${q.label.en}” to continue.`));continue;}
    if(q.type==='multi'){
      if(!Array.isArray(v)||new Set(v).size!==v.length||v.some(x=>!q.options.some(o=>o.id===x)))throw new Error(t(`راجع اختيارات «${q.label.ar}»`,`Check your selections for “${q.label.en}”.`));
      answers[q.id]=[...v].sort();
    }else{
      if(typeof v!=='string')throw new Error(t('نوع إجابة غير صالح.','This answer has an invalid format.'));const value=v.trim();
      if(q.type!=='textarea'&&value.length>240)throw new Error(t('الإجابة أطول من المسموح.','This answer is too long.'));
      if(q.type==='single'&&!q.options.some(o=>o.id===value))throw new Error(t('اختيار غير موجود.','Choose one of the listed options.'));
      if(q.type==='email'&&!z.email().safeParse(value).success)throw new Error(t('البريد الإلكتروني غير صالح.','Enter a valid email address.'));
      if(q.type==='number'&&(!/^\d{1,8}$/.test(value)))throw new Error(t('اكتب عددًا صحيحًا موجبًا أو صفرًا.','Enter a whole number between 0 and 99,999,999.'));
      answers[q.id]=value;
    }
  }
  return answers;
}
export function analyzeAnswers(form:FormDefinition,answers:Answers):Analysis{
  let earned=0,possible=0;const recommendations:string[]=[];
  for(const q of form.questions){if(q.type!=='single'||!q.options.length||q.options.some(o=>o.score===null))continue;const selected=q.options.find(o=>o.id===answers[q.id]);if(!selected)continue;const max=Math.max(...q.options.map(o=>o.score??0));earned+=selected.score??0;possible+=max;if((selected.score??0)<max)recommendations.push(q.id);}
  const score=possible?Math.round(earned/possible*100):null;
  return {score,earned,possible,band:score===null?'unscored':score<40?'prepare':score<75?'review':'ready',recommendations};
}
export const analysisLabels={prepare:{ar:'تحتاجوا تجهيزًا قبل التجربة',en:'Preparation needed before a trial'},review:{ar:'في جوانب تحتاج مراجعة',en:'Some areas need review'},ready:{ar:'جاهزية أولية للمراجعة التقنية',en:'Initial readiness for a technical review'},unscored:{ar:'وصلت الإجابات بدون درجة جاهزية',en:'Answers received without a readiness score'}};
