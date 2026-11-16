import { notFound, redirect } from 'next/navigation';
import { isLocale } from '@/lib/fed3/config';
import { CmsError, requireStaff } from '@/lib/cms/server';
import { appSchema } from '@/lib/cms/model';
import { publishedCatalog } from '@/lib/cms/catalog';
import { AppDetailsView } from '@/components/alternatives/AppDetailsView';
export default async function DraftPreview({params}:{params:Promise<{locale:string;slug:string}>}) {
  const {locale,slug}=await params;if(!isLocale(locale))notFound();
  let session;
  try{session=await requireStaff();}catch(error){if(error instanceof CmsError)redirect(`/${locale}/admin/`);throw error;}
  const {data,error}=await session.db.from('cms_apps').select('draft').eq('id',slug).maybeSingle();
  if(error||!data)notFound();
  const draft=appSchema.parse(data.draft);
  // A preview needs all ten axes and their source references to be renderable.
  const safeDraft={...draft,rows:draft.rows.map(r=>({...r,sources:r.sources.filter(n=>n<draft.sources.length)}))};
  const catalog=(await publishedCatalog()).filter(a=>a.id!==slug);
  return <><aside dir="rtl" style={{padding:18,background:'#062759',color:'white',textAlign:'center',fontSize:16}}>معاينة خاصة للمسودة بنفس قالب الموقع. لم يتم نشرها. <a href={`/${locale}/admin/`} style={{textDecoration:'underline'}}>العودة للإدارة</a></aside><AppDetailsView app={safeDraft} locale={locale} catalog={[safeDraft,...catalog]} preview/></>;
}
