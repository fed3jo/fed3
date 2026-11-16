import 'server-only';
import { createHmac } from 'node:crypto';
import { CmsError,serviceClient } from '@/lib/cms/server';
import { verifyTicket } from './tokens';
export function ticket(token:string,kind:'game'|'form'){
  try{return verifyTicket(token,kind,process.env.SUPABASE_SERVICE_ROLE_KEY!);}catch{throw new CmsError(400,'انتهت صلاحية المحاولة. حدّث الصفحة وجرّب من جديد.');}
}
// A rotating security key, never an analytics identifier. No raw IP or UA is stored.
export async function limit(request:Request,route:string,max:number,seconds=60){
  const ip=process.env.VERCEL?request.headers.get('x-vercel-forwarded-for')||request.headers.get('x-forwarded-for')||'unavailable':'local';
  const key=createHmac('sha256',process.env.SUPABASE_SERVICE_ROLE_KEY!).update(`rate:${new Date().toISOString().slice(0,10)}:${route}:${ip}`).digest('hex');
  const {data,error}=await serviceClient().rpc('eng_limit',{p_key:key,p_max:max,p_seconds:seconds});if(error)throw error;
  if(!data)throw new CmsError(429,'وصلت طلبات كثيرة. انتظر قليلًا قبل إعادة المحاولة.');
}
export async function rpc(name:string,args:Record<string,unknown>){const {data,error}=await serviceClient().rpc(name,args);if(error){if(['invalid_completion','invalid_progress','attempt_expired','form_closed','submission_conflict','event_conflict'].some(m=>error.message.includes(m)))throw new CmsError(422,'تعذّر اعتماد الحدث. تأكد من ترتيب الخطوات وصلاحية النموذج.');throw error;}return data;}
