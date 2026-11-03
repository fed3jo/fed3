import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fed3, isLocale } from '@/lib/fed3/config';
import { messages } from '@/lib/fed3/messages';
import { InlineText } from '@/components/landing/StationContent';
import styles from '@/components/landing/landing.module.css';
import { AlternativesPage } from '@/components/alternatives/AlternativesPage';
import { HomeCloudPage } from '@/components/cloud/HomeCloudPage';

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
  return { title: `${title} | Fed3`, robots: { index: false, follow: true } };
}
export default async function Destination({ params }: { params: Promise<{ locale: string; section: string }> }) {
  const { locale, section } = await params;
  if (!isLocale(locale) || !sections.includes(section as Section)) notFound();
  if (section === 'alternatives') return <AlternativesPage locale={locale} />;
  if (section === 'home-cloud') return <HomeCloudPage locale={locale} />;
  const m = messages[locale];
  const title = section in m.nav ? m.nav[section as keyof typeof m.nav] : m[section as 'privacy' | 'contact'];
  const station = section === 'alternatives' || section === 'home-cloud' || section === 'communities' ? m.stations[section] : null;
  return <main className={styles.destination}><Link href={fed3.routes[locale].home} className={styles.brand}><Image src="/fed3-logo.svg" width={56} height={36} alt="" /><bdi dir="ltr">Fed3</bdi></Link><p className={styles.eyebrow}>{m.initiative}</p><h1><InlineText text={title} /></h1>{station && <p>{station.description}</p>}<p>{m.pending}</p><Link className={styles.primary} href={fed3.routes[locale].home}>{m.home} <span aria-hidden="true">↗</span></Link></main>;
}
