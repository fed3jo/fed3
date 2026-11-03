'use client';
import Link from 'next/link';
import { useEffect, useState, type MouseEvent } from 'react';
import { fed3, type Locale } from '@/lib/fed3/config';
import { cloudCopy, cloudNav, cloudSources } from '@/lib/fed3/cloud';
import { AlternativesHeader } from '@/components/alternatives/AlternativesHeader';
import { SmoothScrolling } from '@/components/alternatives/SmoothScrolling';
import { DirectionalArrow } from '@/components/alternatives/DirectionalArrow';
import { FeatureIcon } from '@/components/shared/FeatureIcon';
import { ReadinessSurvey } from './ReadinessSurvey';
import { JourneyNavigation } from '@/components/shared/JourneyNavigation';
import { CloudGuideHero, CloudRequirements, CloudDailyGuide, CloudServices, CloudHelp, CloudGuideSources } from './CloudGuideSections';
import shared from '@/components/alternatives/alternatives.module.css';
import styles from './cloud.module.css';

export function HomeCloudPage({ locale }: { locale: Locale }) {
  const c = cloudCopy[locale];
  const [mode, setMode] = useState(0);
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
  const anchorClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as Element).closest('a[href^="#"]');
    const hash = anchor?.getAttribute('href');
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (!target) return;
    event.preventDefault(); history.pushState(null, '', hash);
    const top = Math.max(0, target.getBoundingClientRect().top + scrollY - 120);
    if (window.fed3Lenis && !reduce) window.fed3Lenis.scrollTo(top, { duration: 1.15 });
    else window.scrollTo({ top, behavior: reduce ? 'instant' : 'smooth' });
    target.focus({ preventScroll: true });
  };
  const stepLinks = [cloudSources.users, cloudSources.requirements, cloudSources.snap, cloudSources.users, cloudSources.backup, cloudSources.clients];
  return <div className={`${shared.page} ${styles.page}`} onClick={anchorClick}>
    <SmoothScrolling enabled={ready && !reduce} />
    <a className={shared.skip} href="#cloud-main">{locale === 'ar' ? 'انتقل إلى المحتوى' : 'Skip to content'}</a>
    <AlternativesHeader locale={locale} languageHref={`/${locale === 'ar' ? 'en' : 'ar'}/home-cloud/`} inDirectory navItems={cloudNav(locale)} navigationId="cloud-navigation" />
    <main id="cloud-main" tabIndex={-1}>
      <CloudGuideHero locale={locale} />
      <div className={styles.promiseStrip}>{c.strip.map((item, i) => <span key={item}><small>0{i + 1}</small><FeatureIcon name={['control','people','backup'][i]} size={20} />{item}</span>)}</div>
      <section id="cloud-overview" tabIndex={-1} className={styles.overview}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>01 / {c.nav[0]}</p><h2>{c.overview}</h2></div><p>{c.overviewLead}</p></div><div className={styles.useCards}>{c.uses.map(([icon,title,text]) => <article key={title}><span><FeatureIcon name={icon} size={30} /></span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
      <CloudServices locale={locale} />
      <section id="cloud-flow" tabIndex={-1} className={styles.flowSection}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>02 / {c.nav[1]}</p><h2>{c.flow}</h2></div><p>{c.flowLead}</p></div><div className={styles.flowBox}><div className={styles.flowTabs} role="group" aria-label={locale === 'ar' ? 'طريقة الوصول' : 'Access method'}>{c.modes.map((label, i) => <button key={label} aria-pressed={mode === i} onClick={() => setMode(i)}>{label}</button>)}</div><div className={styles.flowDiagram} aria-label={locale === 'ar' ? 'مسار الملفات من الجهاز إلى النسخة الاحتياطية' : 'File flow from devices to backup'}>{c.nodes.map(([icon,title,detail], i) => <div key={title} className={styles.flowNode} data-server={i === 2}><span className={styles.nodeIcon}><FeatureIcon name={icon} size={38} /></span><small dir="ltr">0{i + 1}</small><h3>{i === 1 ? c.accessLabels[mode] : title}</h3><p>{detail}</p>{i < 3 && <span className={styles.flowConnector} aria-hidden="true"><DirectionalArrow /></span>}</div>)}</div><p className={styles.modeDescription} role="status"><span />{c.modeDescriptions[mode]}</p></div><aside className={styles.responsibility}><span><FeatureIcon name="encryption" size={25} /></span><div><h3>{c.responsibility}</h3><p>{c.responsibilityText}</p></div></aside></section>
      <CloudRequirements locale={locale} />
      <section id="cloud-steps" tabIndex={-1} className={styles.stepsSection}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>03 / {c.nav[2]}</p><h2>{c.steps}</h2></div><p>{c.stepsLead}</p></div><ol className={styles.setupSteps}>{c.setup.map(([title,text,outcome], i) => <li key={title}><span className={styles.stepNumber}>0{i + 1}</span><div><h3>{title}</h3><p>{text}</p><span className={styles.stepOutcome}><FeatureIcon name="check" size={16} />{outcome}</span></div>{i > 0 && <a href={stepLinks[i]} target="_blank" rel="noopener noreferrer" aria-label={`${c.stepSources}: ${title}`}>↗</a>}</li>)}</ol></section>
      <CloudDailyGuide locale={locale} />
      <section className={styles.care}><div><p className={styles.eyebrow}>Home-Cloud / {locale === 'ar' ? 'التشغيل' : 'OPERATIONS'}</p><h2>{c.care}</h2></div><div>{c.routines.map(([title,text],i) => <article key={title}><span><FeatureIcon name={['backup','features','check'][i]} size={24} /></span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
      <section id="cloud-readiness" tabIndex={-1} className={styles.readiness}><div className={styles.sectionHead}><div><p className={styles.eyebrow}>04 / {c.nav[3]}<span className={styles.soon}>{c.soon}</span></p><h2>{c.readinessTitle}</h2></div><p>{c.readinessLead}</p></div><ReadinessSurvey locale={locale} /></section>
      <section className={styles.faq}><h2>{c.faq}</h2><div>{c.faqs.map(([question,answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
      <CloudHelp locale={locale} />
      <CloudGuideSources locale={locale} />
      <JourneyNavigation locale={locale} current="home-cloud" currentHref="#cloud-overview" />
    </main>
    <footer className={styles.footer}><Link href={fed3.routes[locale].home} className={styles.footerBrand} dir="ltr">Fed3<span>.</span></Link><p>{c.footer}</p><nav><Link href={fed3.routes[locale].home}>{c.returnHome}<DirectionalArrow /></Link><Link href={fed3.routes[locale].alternatives}>{c.alternatives}<DirectionalArrow /></Link></nav></footer>
  </div>;
}
