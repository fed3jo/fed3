import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/fed3/config';
import { messages } from '@/lib/fed3/messages';
import { ScrollExperience } from '@/components/landing/ScrollExperience';

export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = messages[locale];
  return {
    title: `${copy.stations.intro.heading} | Fed3`, description: copy.stations.intro.description,
    alternates: { languages: { ar: '/ar/', en: '/en/' } }, icons: { icon: '/fed3-logo.svg' },
    openGraph: { title: `${copy.stations.intro.heading} | Fed3`, description: copy.stations.intro.description, locale: locale === 'ar' ? 'ar_JO' : 'en_US', type: 'website' },
  };
}
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <ScrollExperience key={locale} locale={locale} messages={messages[locale]} />;
}
