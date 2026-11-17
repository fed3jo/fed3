import type { Locale } from '@/lib/fed3/config';
import { cloudCopy } from '@/lib/fed3/cloud';
import { cloudGuideCopy } from '@/lib/fed3/cloud-guide';
import { FeatureIcon } from '@/components/shared/FeatureIcon';
import styles from './redesign.module.css';
import { CloudScreenshot } from './CloudScreenshot';

export function CloudOverview({ locale }: { locale: Locale }) {
  const c = cloudCopy[locale];
  const ar = locale === 'ar';
  return <section id="cloud-overview" tabIndex={-1} className={styles.overview} aria-labelledby="cloud-overview-heading">
    <div className={styles.sectionHead}><div><p className={styles.eyebrow}>01 / {c.nav[0]}</p><h2 id="cloud-overview-heading">{ar ? <>مكان واحد.<br/><span>لفريقكم وملفاتكم.</span></> : <>One place.<br/><span>For your team's files.</span></>}</h2></div><p>{ar ? <>مع Nextcloud، ارفعوا وزامنوا وشاركوا. <mark>إنتوا بتحدّدوا مين بوصل.</mark></> : <>Upload, sync and share with Nextcloud. <mark>You decide who gets access.</mark></>}</p></div>
    <div className={styles.bento}>
      <article className={styles.filesCard}><div className={styles.cardHeading}><FeatureIcon name="folder" size={25}/><span>01 / FILES</span></div><h3>{c.uses[0][1]}</h3><p>{c.uses[0][2]}</p><CloudScreenshot id="files" locale={locale} sizes="(max-width: 800px) 88vw, 82vw"/></article>
      <article><div className={styles.cardHeading}><FeatureIcon name="people" size={25}/><span>02 / SHARING</span></div><h3>{c.uses[1][1]}</h3><p>{c.uses[1][2]}</p><CloudScreenshot id="sharing" locale={locale} compact/></article>
      <article className={styles.backupCard}><div className={styles.cardHeading}><FeatureIcon name="backup" size={25}/><span>03 / VERSIONS</span></div><h3>{ar?'ارجعوا لإصدار سابق.':'Return to an earlier version.'}</h3><p>{ar?'إذا كانت الإصدارات مفعّلة، تقدروا ترجعوا لنسخة محفوظة ضمن سياسة الاحتفاظ. هالميزة ما بتغني عن نسخة احتياطية مستقلة.':'When versioning is enabled, restore a saved version within the retention policy. This does not replace an independent backup.'}</p><CloudScreenshot id="versions" locale={locale} compact/></article>
    </div>
    <div className={styles.capabilities}><span dir="ltr">NEXTCLOUD</span>{cloudGuideCopy[locale].services.map(([icon,title,body]) => <details key={title}><summary><FeatureIcon name={icon} size={20}/>{title}<span aria-hidden="true">+</span></summary><p>{body}</p></details>)}<p>{cloudGuideCopy[locale].servicesLead}</p></div>
  </section>;
}
