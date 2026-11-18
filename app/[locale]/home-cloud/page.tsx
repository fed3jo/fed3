import { notFound } from 'next/navigation';
import { HomeCloudPage } from '@/components/cloud/HomeCloudPage';
import { isLocale } from '@/lib/fed3/config';
import { messages } from '@/lib/fed3/messages';

export function generateStaticParams() {
  return [{ locale: 'ar' }, { locale: 'en' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: `${messages[locale].nav['home-cloud']} | Fed3`,
    description: locale === 'ar'
      ? 'شوفوا وين بتنحفظ ملفاتكم، وقارنوا المواصفات، ونزّلوا Nextcloud خطوة بخطوة.'
      : 'See where files are stored, compare hardware and install Nextcloud step by step.',
    icons: { icon: '/fed3-logo.svg' },
    alternates: { languages: { ar: '/ar/home-cloud/', en: '/en/home-cloud/' } },
  };
}

export default async function Cloud({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <HomeCloudPage locale={locale} />;
}
