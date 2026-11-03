import Link from 'next/link';
import { notFound } from 'next/navigation';
import { alternatives, categories, reviewDate } from '@/lib/fed3/alternatives';
import { fed3, isLocale } from '@/lib/fed3/config';
import { AlternativesHeader } from '@/components/alternatives/AlternativesHeader';
import { AppLogo } from '@/components/alternatives/AppLogo';
import { DirectionalArrow, DownloadIcon } from '@/components/alternatives/DirectionalArrow';
import styles from '@/components/alternatives/alternatives.module.css';
import { AppUseVisual } from '@/components/alternatives/AppUseVisual';
import { ComparisonExplorer } from '@/components/alternatives/ComparisonExplorer';
import { AppFacts } from '@/components/alternatives/AppFacts';

export function generateStaticParams() {
  return ['ar', 'en'].flatMap(locale => alternatives.map(app => ({ locale, slug: app.id })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const app = alternatives.find(item => item.id === slug);
  if (!isLocale(locale) || !app) return {};
  return { title: `${app.name} | Fed3`, description: app.description[locale], icons: { icon: '/fed3-logo.svg' }, alternates: { languages: { ar: `/ar/apps/${app.id}/`, en: `/en/apps/${app.id}/` } } };
}

export default async function AppDetails({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const app = alternatives.find(item => item.id === slug);
  if (!isLocale(locale) || !app) notFound();
  const other = locale === 'ar' ? 'en' : 'ar';
  const c = locale === 'ar' ? {
    directory: 'دليل البدائل', replacement: 'بديل لـ', download: 'تنزيل التطبيق', official: 'الموقع الرسمي',
    downloadNote: 'يفتح الزر صفحة التنزيل الرسمية لتختار نسخة جهازك. التنزيل والتثبيت يتمان لدى الناشر.',
    cloudNote: 'اختر تطبيق جهازك للمزامنة. إعداد خادم خاص يحتاج تجهيزًا منفصلًا؛ راجع Home-Cloud قبل البدء.',
    gain: 'ما الذي تكسبه؟', tradeoff: 'ما الذي تحتاج معرفته؟', facts: 'تعرّف على التطبيق',
    start: 'خطوتك الأولى', steps: 'دليل بداية مبسّط', compare: 'قارن قبل أن تختار', compareAction: 'افتح المقارنة الكاملة',
    sources: 'المصادر الرسمية', reviewed: 'مراجعة المصادر', home: 'العودة إلى الرئيسية', back: 'العودة لدليل البدائل', cloud: 'تعرّف على Home-Cloud',
  } : {
    directory: 'Alternatives', replacement: 'Alternative to', download: 'Download app', official: 'Official website',
    downloadNote: 'The button opens the official download page so you can choose your device. The publisher handles downloading and installation.',
    cloudNote: 'Choose your device’s sync client. Running your own server needs separate setup; review Home-Cloud before starting.',
    gain: 'What do you gain?', tradeoff: 'What should you know?', facts: 'Get to know the app',
    start: 'Your first step', steps: 'Getting started', compare: 'Compare before choosing', compareAction: 'Open full comparison',
    sources: 'Official sources', reviewed: 'Sources reviewed', home: 'Back to home', back: 'Back to alternatives', cloud: 'Discover Home-Cloud',
  };
  return <div className={styles.page}>
    <AlternativesHeader locale={locale} languageHref={`/${other}/apps/${app.id}/`} />
    <main className={styles.appDetail}>
      <nav className={styles.breadcrumb} aria-label={locale === 'ar' ? 'مسار الصفحة' : 'Breadcrumb'}><Link href={`${fed3.routes[locale].alternatives}#catalog`}>{c.directory}</Link><DirectionalArrow /><span dir="ltr">{app.name}</span></nav>
      <section className={styles.detailHeroIntro}>
        <div><p className={styles.eyebrow}>{locale === 'ar' ? 'خيارك التالي' : 'YOUR NEXT OPTION'} / {categories[app.category][locale]}</p><div className={styles.appTitle}><span className={styles.largeLogo}><AppLogo name={app.name} size={66} /></span><div><h1 dir="ltr">{app.name}</h1><p className={styles.replaces}>{c.replacement}<AppLogo name={app.current} size={18} /><bdi>{app.current}</bdi></p></div></div><p className={styles.appDescription}>{app.description[locale]}</p><a className={styles.textLink} href="#app-facts">{locale === 'ar' ? 'شوف إذا بناسبك' : 'See if it fits your needs'}<DirectionalArrow /></a></div>
        <AppUseVisual app={app} locale={locale} />
      </section>
      <nav className={styles.detailNav} aria-label={locale === 'ar' ? 'أقسام التطبيق' : 'App sections'}>{[['app-facts', c.facts], ['app-comparison', c.compare], ['app-start', c.steps], ['app-sources', c.sources]].map(([id, label], i) => <a key={id} href={`#${id}`}><small>0{i + 1}</small>{label}</a>)}</nav>
      <div className={styles.takeaways}><div><span className={styles.takeawayLabel}>{c.gain}</span><p>{app.gain[locale]}</p></div><div><span className={styles.takeawayLabel}>{c.tradeoff}</span><p>{app.tradeoff[locale]}</p></div></div>
      <AppFacts app={app} locale={locale} />
      <section id="app-comparison" className={styles.detailComparison}><p className={styles.eyebrow}>{c.compare}</p><h2>{locale === 'ar' ? 'شو بيتغيّر معك؟' : 'What changes for you?'}</h2><ComparisonExplorer app={app} rows={app.rows} locale={locale} /></section>
      <section id="app-start" className={styles.detailStart}><aside className={styles.installPanel}><span className={styles.installLabel}><DownloadIcon />{c.start}</span><h2>{locale === 'ar' ? 'جرّب على مهلك.' : 'Try it at your pace.'}</h2><p>{app.firstStep[locale]}</p><a data-download className={styles.primary} href={app.download} target="_blank" rel="noopener noreferrer"><span>{c.download} <bdi>{app.name}</bdi></span><DownloadIcon /></a><a className={styles.publisherLink} href={app.official} target="_blank" rel="noopener noreferrer">{c.official} ↗</a><p className={styles.guideNote}>{app.id === 'nextcloud' ? c.cloudNote : c.downloadNote}</p>{app.id === 'nextcloud' && <Link className={styles.textLink} href={fed3.routes[locale]['home-cloud']}>{c.cloud}<DirectionalArrow /></Link>}</aside><div className={styles.detailSteps}><p className={styles.eyebrow}>{c.steps}</p><ol>{app.steps.map((step, index) => <li key={index}><span aria-hidden="true">0{index + 1}</span><div><small>{locale === 'ar' ? `الخطوة ${index + 1}` : `STEP ${index + 1}`}</small><p>{step[locale]}</p></div></li>)}</ol></div></section>
      <section className={styles.appCompareCallout}><div><p className={styles.eyebrow}>{c.compare}</p><div className={styles.detailPair}><span><AppLogo name={app.current} size={30} /><bdi>{app.current}</bdi></span><DirectionalArrow /><span><AppLogo name={app.name} size={30} /><bdi>{app.name}</bdi></span></div></div><Link className={styles.primary} href={`${fed3.routes[locale].alternatives}?app=${app.id}#comparison`}>{c.compareAction}<DirectionalArrow /></Link></section>
      <section id="app-sources" className={styles.appSources}><h2>{c.sources}</h2><p>{c.reviewed}: <time dateTime="2026-10-24">{reviewDate[locale]}</time></p><ol>{app.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.name[locale]} ↗</a></li>)}</ol></section>
    </main>
    <footer className={`${styles.footer} ${styles.appFooter}`}><Link href={`${fed3.routes[locale].alternatives}#catalog`}>{c.back}<DirectionalArrow /></Link><Link href={fed3.routes[locale].home}>{c.home}<DirectionalArrow /></Link></footer>
  </div>;
}
