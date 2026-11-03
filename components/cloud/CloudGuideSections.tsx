import Image from 'next/image';
import type { Locale } from '@/lib/fed3/config';
import { cloudGuideCopy, homeCloudGuideUrl, snapGuideUrl } from '@/lib/fed3/cloud-guide';
import { cloudSources } from '@/lib/fed3/cloud';
import { DirectionalArrow } from '@/components/alternatives/DirectionalArrow';
import { FeatureIcon } from '@/components/shared/FeatureIcon';
import styles from './guide.module.css';

export function CloudGuideHero({ locale }: { locale: Locale }) {
  const c = cloudGuideCopy[locale];
  return <section className={styles.hero} aria-labelledby="cloud-heading" data-cloud-guide-hero>
    <div className={styles.heroTop}><div><p className={styles.eyebrow}><span/>{c.kicker}</p><h1 id="cloud-heading">{c.title}<br/><span>{c.accent}</span></h1></div><div className={styles.heroIntro}><p>{c.lead}</p><div className={styles.actions}><a href="#cloud-flow" className={styles.primary}>{c.start}<DirectionalArrow/></a><a href={homeCloudGuideUrl} target="_blank" rel="noopener noreferrer" className={styles.guideLink}>{c.read}<span aria-hidden="true">↗</span></a></div></div></div>
    <figure className={styles.heroScene}><div className={styles.sceneMeta}><span>{c.guideLabel}</span><bdi>01 → 02 → 03</bdi></div><Image src="/cloud/home-cloud-journey-v1.webp" width={1672} height={941} sizes="(max-width: 800px) 100vw, 90vw" alt={c.imageAlt} priority/><figcaption className={styles.sceneSteps} dir="ltr">{c.journey.map(([n,title,body]) => <div key={n} dir={locale === 'ar' ? 'rtl' : 'ltr'}><bdi>{n}</bdi><h2>{title}</h2><p>{body}</p></div>)}</figcaption></figure>
    <nav className={styles.pathNav} aria-label={locale === 'ar' ? 'اختَر نقطة البداية' : 'Choose a starting point'}>{c.paths.map((label,i) => <a key={label} href={['#cloud-overview','#cloud-steps','#cloud-daily'][i]}><bdi>0{i+1}</bdi>{label}<DirectionalArrow/></a>)}</nav>
  </section>;
}

export function CloudRequirements({ locale }: { locale: Locale }) {
  const c = cloudGuideCopy[locale];
  return <section className={styles.requirements} aria-labelledby="cloud-requirements-heading" data-cloud-requirements>
    <div className={styles.sectionHead}><div><p className={styles.eyebrow}>{c.hardwareKicker}</p><h2 id="cloud-requirements-heading">{c.hardwareTitle}</h2></div><p>{c.hardwareLead}</p></div>
    <div className={styles.hardwareGrid}><div className={styles.tableWrap}><table><caption className="sr-only">{c.hardwareTitle}</caption><thead><tr>{c.hardwareColumns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead><tbody>{c.hardwareRows.map(([label,min,recommended]) => <tr key={label}><th scope="row">{label}</th><td><bdi>{min}</bdi></td><td><bdi>{recommended}</bdi></td></tr>)}</tbody></table><p className={styles.systemNote}>{c.systemNote}</p><a className={styles.textLink} href={cloudSources.requirements} target="_blank" rel="noopener noreferrer">{c.requirementsLink}<span aria-hidden="true">↗</span></a></div><div className={styles.preparation}>{c.preparation.map(([title,body],i) => <article key={title}><FeatureIcon name={['backup','control','people'][i]} size={23}/><div><h3>{title}</h3><p>{body}</p></div></article>)}</div></div>
  </section>;
}

export function CloudDailyGuide({ locale }: { locale: Locale }) {
  const c = cloudGuideCopy[locale];
  return <section id="cloud-daily" tabIndex={-1} className={styles.daily} aria-labelledby="cloud-daily-heading" data-cloud-daily>
    <div className={styles.sectionHead}><div><p className={styles.eyebrow}>{c.dailyKicker}</p><h2 id="cloud-daily-heading">{c.dailyTitle}</h2></div><p>{c.dailyLead}</p></div>
    <div className={styles.dailyGrid}><div className={styles.dailyArt}><Image src="/cloud/home-cloud-daily-v1.webp" width={1448} height={1086} sizes="(max-width: 800px) 90vw, 43vw" alt={c.dailyAlt}/><a className={styles.textLink} href={cloudSources.daily} target="_blank" rel="noopener noreferrer">{c.dailyLink}<span aria-hidden="true">↗</span></a></div><div className={styles.dailySteps}>{c.daily.map(([title,body],i) => <details key={title} open={i === 0}><summary><bdi>0{i+1}</bdi><span>{title}</span><i aria-hidden="true">+</i></summary><p>{body}</p></details>)}</div></div>
  </section>;
}

export function CloudServices({ locale }: { locale: Locale }) {
  const c = cloudGuideCopy[locale];
  return <section className={styles.services} aria-labelledby="cloud-services-heading"><div className={styles.sectionHead}><div><p className={styles.eyebrow}>NEXTCLOUD / HOME-CLOUD</p><h2 id="cloud-services-heading">{c.servicesTitle}</h2></div><p>{c.servicesLead}</p></div><div className={styles.servicesGrid}>{c.services.map(([icon,title,body]) => <article key={title}><FeatureIcon name={icon} size={29}/><h3>{title}</h3><p>{body}</p></article>)}</div></section>;
}

export function CloudHelp({ locale }: { locale: Locale }) {
  const c = cloudGuideCopy[locale];
  return <section className={styles.help} aria-labelledby="cloud-help-heading"><div className={styles.sectionHead}><div><p className={styles.eyebrow}>{locale === 'ar' ? 'المساعدة / قبل ما تغيّر الإعدادات' : 'HELP / BEFORE CHANGING SETTINGS'}</p><h2 id="cloud-help-heading">{c.helpTitle}</h2></div></div><div className={styles.helpGrid}>{c.help.map(([title,body]) => <details key={title}><summary>{title}<span aria-hidden="true">+</span></summary><p>{body}</p></details>)}</div></section>;
}

export function CloudGuideSources({ locale }: { locale: Locale }) {
  const c = cloudGuideCopy[locale];
  const links = [[homeCloudGuideUrl,c.guideName],[snapGuideUrl,c.snapLink],[cloudSources.requirements,c.requirementsLink],[cloudSources.daily,c.usersLink],[cloudSources.backup,locale === 'ar' ? 'النسخ الاحتياطي والاستعادة' : 'Backup and recovery']];
  return <aside className={styles.sources} aria-label={c.sourceLabel}><div><p className={styles.eyebrow}>{c.sourceLabel}</p><p>{c.sourceText}</p></div><div>{links.map(([href,label]) => <a key={href} href={href} target="_blank" rel="noopener noreferrer">{label}<span aria-hidden="true">↗</span></a>)}</div></aside>;
}
