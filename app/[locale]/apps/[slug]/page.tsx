import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/fed3/config';
import { publishedCatalog } from '@/lib/cms/catalog';
import { AppDetailsView } from '@/components/alternatives/AppDetailsView';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{locale:string;slug:string}>}) {
 const {locale,slug}=await params;
 if(!isLocale(locale))return {};
 const app=(await publishedCatalog()).find(a=>a.id===slug);if(!app)return {};
 return {title:app.name+' | Fed3',description:app.description[locale],icons:{icon:'/fed3-logo.svg'},alternates:{languages:{ar:'/ar/apps/'+app.id+'/',en:'/en/apps/'+app.id+'/'}}};
}
export default async function AppDetails({params}:{params:Promise<{locale:string;slug:string}>}) {
 const {locale,slug}=await params;if(!isLocale(locale))notFound();
 const catalog=await publishedCatalog();const app=catalog.find(a=>a.id===slug);if(!app)notFound();
 return <AppDetailsView app={app} locale={locale} catalog={catalog}/>;
}
