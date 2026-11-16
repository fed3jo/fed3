import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Staff } from './model';

export function cmsConfigured() { return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY); }
export function serviceClient() {
  if (!cmsConfigured()) throw new Error('CMS_NOT_CONFIGURED');
  return createClient(process.env.SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession:false, autoRefreshToken:false } });
}
export async function authClient() {
  if (!cmsConfigured()) throw new Error('CMS_NOT_CONFIGURED');
  const jar=await cookies();
  return createServerClient(process.env.SUPABASE_URL!,process.env.SUPABASE_PUBLISHABLE_KEY!, {
    cookieOptions: { httpOnly:true, secure:process.env.NODE_ENV==='production', sameSite:'lax', path:'/', maxAge:8*60*60 },
    cookies: { getAll:()=>jar.getAll(), setAll: values => {
      // Route handlers can persist refreshed cookies. Read-only server previews
      // may validate a refreshed user but cannot set a response cookie.
      try { for (const {name,value,options} of values) jar.set(name,value,options); } catch { /* The next admin API request persists the refresh. */ }
    } },
  });
}
export class CmsError extends Error { constructor(public status:number, message:string) { super(message); } }
export async function requireStaff(manager=false) {
  if (!cmsConfigured()) throw new CmsError(503,'لوحة الإدارة بانتظار ربط Supabase.');
  const auth=await authClient();
  const {data:{user},error}=await auth.auth.getUser();
  if(error||!user) throw new CmsError(401,'سجّل الدخول للمتابعة.');
  const db=serviceClient();
  const {data,error:staffError}=await db.from('cms_staff').select('*').eq('user_id',user.id).eq('active',true).maybeSingle();
  if(staffError) throw new CmsError(503,'تعذّر قراءة الصلاحيات. تأكد من تطبيق مخطط القاعدة.');
  const member=data as Staff|null;
  if(!member||(manager&&member.role!=='manager')) throw new CmsError(403,'ما عندك صلاحية لهالإجراء.');
  return {auth,db,user,member};
}
export function sameOrigin(request:Request) {
  const incoming=new URL(request.url);
  // A standalone server or Vercel may reconstruct request.url with an internal
  // hostname. Compare the browser origin with the HTTP Host, never a client-
  // supplied forwarded-host header. Pin CMS_SITE_ORIGIN when hosting behind a proxy.
  const forwarded=request.headers.get('x-forwarded-proto');
  const protocol=forwarded==='https'||forwarded==='http'?`${forwarded}:`:incoming.protocol;
  const expected=process.env.CMS_SITE_ORIGIN||`${protocol}//${request.headers.get('host')||incoming.host}`;
  if(request.headers.get('origin')!==expected) throw new CmsError(403,'طلب من مصدر غير مسموح.');
}
export async function readJson(request:Request,limit=1024*1024) {
  const length=Number(request.headers.get('content-length')||0);
  if(length>limit) throw new CmsError(413,'حجم الطلب أكبر من المسموح.');
  const reader=request.body?.getReader(); if(!reader) throw new CmsError(400,'طلب فارغ.');
  let bytes=0; const chunks:Uint8Array[]=[];
  while(true) { const {value,done}=await reader.read(); if(done)break; bytes+=value.length; if(bytes>limit){await reader.cancel();throw new CmsError(413,'حجم الطلب أكبر من المسموح.');} chunks.push(value); }
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new CmsError(400,'صيغة بيانات غير صالحة.');}
}
export function apiResponse(data:unknown,status=200) { return Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}}); }
export function apiError(error:unknown) {
  if(error instanceof CmsError)return apiResponse({error:error.message},error.status);
  if(error&&typeof error==='object'&&'code' in error) {
    if('message' in error && error.message==='last_manager')return apiResponse({error:'لازم يبقى مدير نشط واحد على الأقل.'},400);
    if(error.code==='40001')return apiResponse({error:'في تعديل أحدث. أعد تحميل المحتوى قبل الحفظ.'},409);
    if(error.code==='42501')return apiResponse({error:'صلاحياتك لا تسمح بهذا الإجراء.'},403);
  }
  console.error('CMS request failed',error instanceof Error ? error.name : 'database_error');
  return apiResponse({error:'تعذّر إكمال الطلب. جرّب من جديد أو راجع إعداد Supabase.'},500);
}
