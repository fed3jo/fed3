import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/fed3/config';
import { InfoPage } from '@/components/info/InfoPage';
import { infoCopy, type InfoSection } from '@/lib/fed3/public-info';
import { messages } from '@/lib/fed3/messages';
import { CommunitiesPage } from '@/components/communities/CommunitiesPage';

export const dynamic='force-dynamic';
const sections = ['communities', 'about', 'privacy', 'contact'] as const;
type Section = typeof sections[number];
export function generateStaticParams() { return ['ar', 'en'].flatMap(locale => sections.map(section => ({ locale, section }))); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string; section: string }> }) {
  const { locale, section } = await params;
  if (!isLocale(locale) || !sections.includes(section as Section)) return {};
  if (section === 'communities') return {
    title: `${messages[locale].nav.communities} | Fed3`,
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
  if (section === 'communities') return <CommunitiesPage locale={locale} />;
  return <InfoPage locale={locale} section={section as InfoSection} />;
}
