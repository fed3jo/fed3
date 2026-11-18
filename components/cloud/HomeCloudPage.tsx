'use client';
import Link from 'next/link';
import { useEffect, useState, type MouseEvent } from 'react';
import { fed3, type Locale } from '@/lib/fed3/config';
import { cloudCopy, cloudNav } from '@/lib/fed3/cloud';
import { AlternativesHeader } from '@/components/alternatives/AlternativesHeader';
import { SmoothScrolling } from '@/components/alternatives/SmoothScrolling';
import { DirectionalArrow } from '@/components/alternatives/DirectionalArrow';
import { FeatureIcon } from '@/components/shared/FeatureIcon';
import { ReadinessSurvey } from './ReadinessSurvey';
import { JourneyNavigation } from '@/components/shared/JourneyNavigation';
import { SiteLinks } from '@/components/shared/SiteLinks';
import { CloudRequirements, CloudDailyGuide, CloudHelp, CloudGuideSources } from './CloudGuideSections';
import { CloudIntro } from './CloudIntro';
import { CloudOverview } from './CloudOverview';
import { CloudFileJourney } from './CloudFileJourney';
import { CloudTrialGuide } from './CloudTrialGuide';
import journey from './file-journey.module.css';
import redesign from './redesign.module.css';
import shared from '@/components/alternatives/alternatives.module.css';
import styles from './cloud.module.css';

export function HomeCloudPage({ locale }: { locale: Locale }) {
  const c = cloudCopy[locale];
  const ar = locale === 'ar';
  const [ready, setReady] = useState(false);
  const [reduce, setReduce] = useState(true);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let saved = false;
    try { saved = localStorage.getItem('fed3-reduced-motion') === 'true'; } catch { /* Optional preference. */ }
    const update = () => setReduce(media.matches || saved);
    update(); setReady(true); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const goTo = (target: HTMLElement) => {
    history.pushState(null, '', `#${target.id}`);
    const top = Math.max(0, target.getBoundingClientRect().top + scrollY - 120);
    if (window.fed3Lenis && !reduce) window.fed3Lenis.scrollTo(top, { duration: 1.15 });
    else window.scrollTo({ top, behavior: reduce ? 'instant' : 'smooth' });
    target.focus({ preventScroll: true });
  };
  const anchorClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const hash = (event.target as Element).closest('a[href^="#"]')?.getAttribute('href');
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (!target) return;
    event.preventDefault();
    goTo(target);
  };
  return <div className={`${shared.page} ${styles.page} ${redesign.page}`} onClick={anchorClick}>
    <SmoothScrolling enabled={ready && !reduce} />
    <a className={shared.skip} href="#cloud-main">{ar ? 'انتقل إلى المحتوى' : 'Skip to content'}</a>
    <AlternativesHeader locale={locale} languageHref={`/${ar ? 'en' : 'ar'}/home-cloud/`} inDirectory navItems={cloudNav(locale)} navigationId="cloud-navigation" currentStation="home-cloud" homeStyle />
    <main id="cloud-main" tabIndex={-1}>
      <CloudIntro locale={locale} reduceMotion={reduce} explore={() => {
        const overview = document.getElementById('cloud-overview');
        if (overview) goTo(overview);
      }} />
      <div className={redesign.content}>
      <CloudOverview locale={locale} />
      <CloudFileJourney locale={locale} />
      <CloudRequirements locale={locale} />
      <section id="cloud-steps" tabIndex={-1} className={journey.prep} aria-labelledby="cloud-steps-heading">
        <h2 id="cloud-steps-heading">{ar ? 'قبل ما تبلّشوا' : 'Before you start'}</h2>
        <ul>
          <li><FeatureIcon name="control" size={23} />{ar ? 'جهاز مخصّص وشبكة ثابتة' : 'A dedicated device and stable network'}</li>
          <li><FeatureIcon name="people" size={23} />{ar ? 'شخص يتابع الحسابات والتحديثات' : 'Someone to manage accounts and updates'}</li>
          <li><FeatureIcon name="backup" size={23} />{ar ? 'قرص منفصل ونسخة جرّبتوا تستعيدوها' : 'A separate drive and a tested backup'}</li>
        </ul>
        <a href="#cloud-trial">{ar ? 'روحوا لخطوات تنزيل Nextcloud' : 'Go to the Nextcloud installation steps'} <span aria-hidden="true">↓</span></a>
      </section>
      <section id="cloud-readiness" tabIndex={-1} className={`${styles.readiness} ${redesign.readiness}`} aria-labelledby="cloud-readiness-heading">
        <div className={styles.sectionHead}><h2 id="cloud-readiness-heading">{c.readinessTitle}</h2><p>{c.readinessLead}</p></div>
        <ReadinessSurvey locale={locale} />
      </section>
      <CloudTrialGuide locale={locale} />
      <details className={journey.more}><summary>{ar ? 'مزيد عن الاستخدام اليومي' : 'More about everyday use'}</summary><CloudDailyGuide locale={locale} /></details>
      <section className={styles.care}><div><h2>{c.care}</h2></div><div>{c.routines.map(([title,text],i) => <article key={title}><span><FeatureIcon name={['backup','features','check'][i]} size={24} /></span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
      <section className={styles.faq}><h2>{c.faq}</h2><div>{c.faqs.map(([question,answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
      <CloudHelp locale={locale} />
      <CloudGuideSources locale={locale} />
      <JourneyNavigation locale={locale} current="home-cloud" currentHref="#cloud-overview" />
      </div>
    </main>
    <footer className={styles.footer}><Link href={fed3.routes[locale].home} className={styles.footerBrand} dir="ltr">Fed3<span>.</span></Link><p>{c.footer}</p><nav><Link href={fed3.routes[locale].home}>{c.returnHome}<DirectionalArrow /></Link><Link href={fed3.routes[locale].alternatives}>{c.alternatives}<DirectionalArrow /></Link></nav></footer>
    <SiteLinks locale={locale} />
  </div>;
}
