import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fed3, isLocale } from '@/lib/fed3/config';
import { companyNames, policyPreviews, privacyCases, privacyFileHref, privacyPolicies, privacyReviewedOn } from '@/lib/fed3/privacy-cases';
import { PrivacyText } from '@/components/landing/PrivacyText';
import styles from '@/components/landing/privacy-detail.module.css';

type Props = { params: Promise<{ locale: string; slug: string }> };
const slugs = [...privacyCases.map(file => file.id), ...privacyPolicies.map(policy => `policy-${policy.company}`)];
export function generateStaticParams() {
  return ['ar', 'en'].flatMap(locale => slugs.map(slug => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const file = privacyCases.find(item => item.id === slug);
  const policy = privacyPolicies.find(item => `policy-${item.company}` === slug);
  const title = file?.copy[locale].title || policy?.copy[locale].title;
  if (!title) return {};
  return {
    title: `${title.replace(/\[\[|\]\]/g, '')} | Fed3`,
    description: file?.copy[locale].summary.replace(/\[\[|\]\]/g, '') || policy?.copy[locale].approach,
    alternates: { languages: { ar: privacyFileHref('ar', slug), en: privacyFileHref('en', slug) } },
    icons: { icon: '/fed3-logo.svg' },
  };
}

export default async function PrivacyFilePage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const file = privacyCases.find(item => item.id === slug);
  const policy = privacyPolicies.find(item => `policy-${item.company}` === slug);
  if (!file && !policy) notFound();
  const ar = locale === 'ar';
  const company = file?.company ?? policy!.company;
  const title = file?.copy[locale].title ?? policy!.copy[locale].title;
  const sources = file?.sources ?? policy!.sources;
  const image = file?.image ?? policyPreviews[company].image;
  const sections = file ? [
    { title: ar ? 'ما حدث' : 'What happened', text: file.copy[locale].summary },
    { title: ar ? 'الحالة والنطاق' : 'Status and scope', text: file.copy[locale].context },
    { title: ar ? 'شو تراجع؟' : 'What to check', text: file.copy[locale].impact },
  ] : [
    { title: ar ? 'كيف تستخدم بياناتك؟' : 'How is your data used?', text: policy!.copy[locale].approach },
    { title: ar ? 'وين الخطر على تحكّمك؟' : 'What affects your control?', text: policy!.copy[locale].concern },
    { title: ar ? 'شو تراجع؟' : 'What to check', text: policy!.copy[locale].control },
  ];
  const example = policy ? privacyCases.find(item => item.id === policyPreviews[company].example) : undefined;

  return <div className={styles.page}>
    <header className={styles.header}>
      <Link href={fed3.routes[locale].home} className={styles.brand} aria-label="Fed3"><Image src="/fed3-logo.svg" width={42} height={30} alt="" /><bdi>Fed3.</bdi></Link>
      <Link href={`${fed3.routes[locale].home}#privacy-files`} className={styles.back}>{ar ? 'ملفات الخصوصية' : 'Privacy files'}<span aria-hidden="true">{ar ? '←' : '→'}</span></Link>
      <Link href={privacyFileHref(ar ? 'en' : 'ar', slug)} className={styles.language} lang={ar ? 'en' : 'ar'}>{ar ? 'English' : 'العربية'}</Link>
    </header>
    <main className={styles.main}>
      <div className={styles.hero}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{companyNames[company][locale]}<span />{policy || file?.kind === 'policy' ? (ar ? 'قراءة في السياسة' : 'Policy explained') : (ar ? 'قضية موثّقة' : 'Documented case')}</p>
          <h1><PrivacyText text={title} /></h1>
          {file && <><p className={styles.status}>{file.copy[locale].status}</p><div className={styles.dateline}><time dateTime={file.dateTime}>{file.copy[locale].date}</time><span>{file.copy[locale].region}</span></div></>}
        </div>
        <figure className={styles.heroImage}><Image src={image} alt={file?.imageAlt[locale] ?? ''} width={800} height={680} unoptimized /><figcaption>{ar ? 'رسم توضيحي' : 'Editorial illustration'}</figcaption></figure>
      </div>
      <div className={styles.reading}>
        {sections.map((section, index) => <section key={section.title} className={styles.fact}><span className={styles.number} aria-hidden="true">0{index + 1}</span><div><h2>{section.title}</h2><p><PrivacyText text={section.text} /></p></div></section>)}
        {policy && <p className={styles.scope}>{policy.copy[locale].scope}</p>}
        {example && <Link className={styles.related} href={privacyFileHref(locale, example.id)}><span>{ar ? 'اقرأ البند بالتحديد' : 'Read the specific provision'}</span><PrivacyText text={example.copy[locale].title} /><span aria-hidden="true">↗</span></Link>}
        <section className={styles.evidence} aria-labelledby="evidence-heading"><h2 id="evidence-heading">{ar ? 'المصادر' : 'Sources'}</h2><div>{sources.map(source => <a key={source.href} href={source.href} target="_blank" rel="noopener noreferrer">{source.label[locale]}<span aria-hidden="true">↗</span></a>)}</div><time dateTime={privacyReviewedOn}>{ar ? 'مراجعة المصادر: 15 نوفمبر 2026' : 'Sources reviewed: November 15, 2026'}</time></section>
        <Link className={styles.alternatives} href={fed3.routes[locale].alternatives}>{ar ? 'استكشف البدائل' : 'Explore alternatives'}<span aria-hidden="true">{ar ? '←' : '→'}</span></Link>
      </div>
    </main>
  </div>;
}
