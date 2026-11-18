import { notFound } from 'next/navigation';
import { AlternativesPage } from '@/components/alternatives/AlternativesPage';
import { CatalogProvider } from '@/components/alternatives/CatalogContext';
import { publishedCatalog } from '@/lib/cms/catalog';
import { isLocale } from '@/lib/fed3/config';
import { messages } from '@/lib/fed3/messages';

export const dynamic = 'force-static';
export const revalidate = 60;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: `${messages[locale].nav.alternatives} | Fed3`,
    description: locale === 'ar' ? 'بدائل رقمية ومقارنات موثقة للخصوصية والبيانات وخطوات البداية.' : 'Digital alternatives with sourced privacy and data comparisons and practical first steps.',
    icons: { icon: '/fed3-logo.svg' },
    alternates: { languages: { ar: '/ar/alternatives/', en: '/en/alternatives/' } },
  };
}

export default async function Alternatives({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const items = await publishedCatalog();
  const ar = locale === 'ar';
  if (!items.length) return <main style={{ padding: '10%' }}>
    <h1>{ar ? 'دليل البدائل' : 'Alternatives directory'}</h1>
    <p>{ar ? 'لا يوجد محتوى منشور حاليًا.' : 'No published content is available.'}</p>
    <a href={`/${locale}/`}>{ar ? 'العودة للرئيسية' : 'Back to home'}</a>
  </main>;
  return <CatalogProvider items={items}><AlternativesPage locale={locale} /></CatalogProvider>;
}
