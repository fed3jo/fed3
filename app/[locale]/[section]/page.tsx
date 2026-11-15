import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/fed3/config';
import { messages } from '@/lib/fed3/messages';
import { InfoPage } from '@/components/info/InfoPage';
import { infoCopy, type InfoSection } from '@/lib/fed3/public-info';
import { AlternativesPage } from '@/components/alternatives/AlternativesPage';
import { HomeCloudPage } from '@/components/cloud/HomeCloudPage';
import { CommunitiesPage } from '@/components/communities/CommunitiesPage';

const sections = ['alternatives', 'home-cloud', 'communities', 'about', 'privacy', 'contact'] as const;
type Section = typeof sections[number];
export function generateStaticParams() { return ['ar', 'en'].flatMap(locale => sections.map(section => ({ locale, section }))); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string; section: string }> }) {
  const { locale, section } = await params;
  if (!isLocale(locale) || !sections.includes(section as Section)) return {};
  const m = messages[locale];
  const title = section in m.nav ? m.nav[section as keyof typeof m.nav] : m[section as 'privacy' | 'contact'];
  if (section === 'alternatives') return { title: `${title} | Fed3`, description: locale === 'ar' ? 'خمسة بدائل رقمية ومقارنات موثقة للخصوصية والبيانات وخطوات البداية.' : 'Five digital alternatives with sourced privacy and data comparisons and practical first steps.', icons: { icon: '/fed3-logo.svg' }, alternates: { languages: { ar: '/ar/alternatives/', en: '/en/alternatives/' } } };
  if (section === 'home-cloud') return { title: `${title} | Fed3`, description: locale === 'ar' ? 'سحابة محلية مستقلة لمؤسستك: افهم مسار ملفاتك وخطوات التجهيز والتدريب والنسخ الاحتياطي، واطلع على معاينة استبيان الجاهزية.' : 'Independent local cloud storage for your organization: data flow, setup, training, backups and a readiness survey preview.', icons: { icon: '/fed3-logo.svg' }, alternates: { languages: { ar: '/ar/home-cloud/', en: '/en/home-cloud/' } } };
  if (section === 'communities') return {
    title: `${title} | Fed3`,
    description: locale === 'ar'
      ? 'تعلّم مع أشخاص تعرفهم، وجرّب البدائل الرقمية والسحابة المحلية، وشارك ما تعلّمته مع محيطك.'
      : 'Try digital alternatives and local cloud storage with people you know, then share what you learn.',
    icons: { icon: '/fed3-logo.svg' },
    alternates: { languages: { ar: '/ar/communities/', en: '/en/communities/' } },
  };
  const info = infoCopy[locale][section as InfoSection];
  return { title: `${info.title} | Fed3`, description: info.description, robots: { index: true, follow: true }, icons: { icon: '/fed3-logo.svg' }, alternates: { languages: { ar: `/ar/${section}/`, en: `/en/${section}/` } } };
}
export default async function Destination({ params }: { params: Promise<{ locale: string; section: string }> }) {
  const { locale, section } = await params;
  if (!isLocale(locale) || !sections.includes(section as Section)) notFound();
  if (section === 'alternatives') return <AlternativesPage locale={locale} />;
  if (section === 'home-cloud') return <HomeCloudPage locale={locale} />;
  if (section === 'communities') return <CommunitiesPage locale={locale} />;
  return <InfoPage locale={locale} section={section as InfoSection} />;
}
