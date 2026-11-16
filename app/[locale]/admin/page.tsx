import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/fed3/config';
import { cmsConfigured } from '@/lib/cms/server';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
export default async function AdminPage({params}:{params:Promise<{locale:string}>}) {
  if(!isLocale((await params).locale))notFound();
  return <AdminDashboard configured={cmsConfigured()}/>;
}
