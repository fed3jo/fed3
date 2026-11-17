import type { Locale } from '@/lib/fed3/config';
import { cloudGuideCopy, homeCloudGuideUrl, snapGuideUrl } from '@/lib/fed3/cloud-guide';
import { cloudSources } from '@/lib/fed3/cloud';
import { FeatureIcon } from '@/components/shared/FeatureIcon';
import styles from './guide.module.css';
import redesign from './redesign.module.css';
import { CloudScreenshot } from './CloudScreenshot';

export function CloudRequirements({ locale }: { locale: Locale }) {
  const c = cloudGuideCopy[locale];
  return <section className={`${styles.requirements} ${redesign.requirements}`} aria-labelledby="cloud-requirements-heading" data-cloud-requirements>
    <div className={styles.sectionHead}><div><p className={styles.eyebrow}>{c.hardwareKicker}</p><h2 id="cloud-requirements-heading">{c.hardwareTitle}</h2></div><p>{locale === 'ar' ? <>عمر الجهاز مش المقياس. <mark>افحصوا حالته قبل الاعتماد عليه.</mark> الأرقام التالية لتجربة صغيرة من الدليل.</> : <>Age isn't the measure. <mark>Check the hardware before relying on it.</mark> These figures are for the guide's small trial.</>}</p></div>
    <div className={redesign.specs}>{[['2 GB','RAM',locale === 'ar' ? 'ذاكرة للتجربة' : 'Trial memory'],['64-bit','CPU',locale === 'ar' ? 'معالج متوافق' : 'Compatible processor'],['128 GB','STORAGE',locale === 'ar' ? 'مساحة البداية، ويفضل SSD' : 'Trial storage, preferably SSD']].map(([value,label,description]) => <div key={label}><span>{label}</span><strong dir="ltr">{value}</strong><p>{description}</p></div>)}</div>
    <div className={styles.hardwareGrid}><div className={styles.tableWrap}><details className={redesign.hardwareDetails}><summary>{locale === 'ar' ? 'قارنوا البداية بالخيار الموصى به في الدليل' : "Compare the trial with the guide's recommendation"}<span aria-hidden="true">+</span></summary><p className={styles.systemNote}>{c.hardwareLead}</p><table><caption className="sr-only">{c.hardwareTitle}</caption><thead><tr>{c.hardwareColumns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead><tbody>{c.hardwareRows.map(([label,min,recommended]) => <tr key={label}><th scope="row">{label}</th><td><bdi>{min}</bdi></td><td><bdi>{recommended}</bdi></td></tr>)}</tbody></table><p className={styles.systemNote}>{c.systemNote}</p></details><a className={styles.textLink} href={cloudSources.requirements} target="_blank" rel="noopener noreferrer">{c.requirementsLink}<span aria-hidden="true">↗</span></a></div><div className={styles.preparation}>{c.preparation.map(([title,body],i) => <article key={title}><FeatureIcon name={['backup','control','people'][i]} size={23}/><div><h3>{title}</h3><p>{body}</p></div></article>)}</div></div>
  </section>;
}

export function CloudDailyGuide({ locale }: { locale: Locale }) {
  const c = cloudGuideCopy[locale];
  return <section id="cloud-daily" tabIndex={-1} className={`${styles.daily} ${redesign.daily}`} aria-labelledby="cloud-daily-heading" data-cloud-daily>
    <div className={styles.sectionHead}><div><p className={styles.eyebrow}>{c.dailyKicker}</p><h2 id="cloud-daily-heading">{c.dailyTitle}</h2></div><p>{c.dailyLead}</p></div>
    <div className={styles.dailyGrid}><div className={styles.dailyArt}><CloudScreenshot id="upload" locale={locale}/><a className={styles.textLink} href={cloudSources.daily} target="_blank" rel="noopener noreferrer">{c.dailyLink}<span aria-hidden="true">↗</span></a></div><div className={styles.dailySteps}>{c.daily.map(([title,body],i) => <details key={title} open={i === 0}><summary><bdi>0{i+1}</bdi><span>{title}</span><i aria-hidden="true">+</i></summary><p>{body}</p></details>)}</div></div>
  </section>;
}

export function CloudHelp({ locale }: { locale: Locale }) {
  const c = cloudGuideCopy[locale];
  return <section className={`${styles.help} ${redesign.help}`} aria-labelledby="cloud-help-heading"><details className={redesign.helpPanel}><summary><FeatureIcon name="features" size={23}/><h2 id="cloud-help-heading">{c.helpTitle}</h2><span aria-hidden="true">+</span></summary><div className={styles.helpGrid}>{c.help.map(([title,body]) => <details key={title}><summary>{title}<span aria-hidden="true">+</span></summary><p>{body}</p></details>)}</div></details></section>;
}

export function CloudGuideSources({ locale }: { locale: Locale }) {
  const c = cloudGuideCopy[locale];
  const links = [[homeCloudGuideUrl,c.guideName],[snapGuideUrl,c.snapLink],[cloudSources.requirements,c.requirementsLink],[cloudSources.daily,c.usersLink],[cloudSources.backup,locale === 'ar' ? 'النسخ الاحتياطي والاستعادة' : 'Backup and recovery']];
  return <aside className={styles.sources} aria-label={c.sourceLabel}><div><p className={styles.eyebrow}>{c.sourceLabel}</p><details className={redesign.sourceNote}><summary>{locale === 'ar' ? 'عن الدليل والروابط الخارجية' : 'About the guide and external links'}</summary><p>{c.sourceText}</p></details></div><div>{links.map(([href,label]) => <a key={href} href={href} target="_blank" rel="noopener noreferrer">{label}<span aria-hidden="true">↗</span></a>)}</div></aside>;
}
