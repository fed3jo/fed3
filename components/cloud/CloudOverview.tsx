import type { Locale } from '@/lib/fed3/config';
import { cloudCopy } from '@/lib/fed3/cloud';
import { cloudGuideCopy } from '@/lib/fed3/cloud-guide';
import { FeatureIcon } from '@/components/shared/FeatureIcon';
import styles from './redesign.module.css';

export function CloudOverview({ locale }: { locale: Locale }) {
  const c = cloudCopy[locale];
  const ar = locale === 'ar';
  return <section id="cloud-overview" tabIndex={-1} className={styles.overview} aria-labelledby="cloud-overview-heading">
    <div className={styles.sectionHead}><div><p className={styles.eyebrow}>01 / {c.nav[0]}</p><h2 id="cloud-overview-heading">{ar ? <>مكان واحد.<br/><span>لفريقكم وملفاتكم.</span></> : <>One place.<br/><span>For your team's files.</span></>}</h2></div><p>{ar ? <>مع Nextcloud، ارفعوا وزامنوا وشاركوا. <mark>إنتوا بتحدّدوا مين بوصل.</mark></> : <>Upload, sync and share with Nextcloud. <mark>You decide who gets access.</mark></>}</p></div>
    <div className={styles.bento}>
      <article className={styles.filesCard}><div className={styles.cardHeading}><FeatureIcon name="folder" size={25}/><span>01 / FILES</span></div><div className={styles.fileWindow} aria-hidden="true"><div className={styles.windowBar}><span/><span/><span/><bdi>Nextcloud / Files</bdi></div><div className={styles.windowBody}><div className={styles.windowSidebar}><i/><i/><i/><i/></div><div className={styles.fileFolders}>{[ar ? 'الشغل اليومي' : 'Daily work', ar ? 'الصور' : 'Photos', ar ? 'المستندات' : 'Documents'].map((label,i) => <div key={label} data-folder={i}><FeatureIcon name="folder" size={47}/><span>{label}</span></div>)}</div></div><div className={styles.windowFoot}><FeatureIcon name="platforms" size={18}/>{ar ? 'من الهاتف والحاسوب' : 'From phone and computer'}</div></div><h3>{c.uses[0][1]}</h3><p>{c.uses[0][2]}</p></article>
      <article className={styles.sharingCard}><div className={styles.cardHeading}><FeatureIcon name="people" size={25}/><span>02 / ACCESS</span></div><div className={styles.permissionDemo} aria-hidden="true"><span className={styles.avatar}>A</span><span>{ar ? 'فريق العمل' : 'Your team'}</span><b>{ar ? 'عرض وتعديل' : 'View & edit'}</b><FeatureIcon name="check" size={19}/></div><h3>{c.uses[1][1]}</h3><p>{c.uses[1][2]}</p></article>
      <article className={styles.backupCard}><div className={styles.cardHeading}><FeatureIcon name="backup" size={25}/><span>03 / RESTORE</span></div><div className={styles.backupDemo} aria-hidden="true"><FeatureIcon name="control" size={33}/><span>··········</span><FeatureIcon name="backup" size={33}/><span className={styles.backupBadge}><FeatureIcon name="check" size={17}/>{ar ? 'نسخة مستقلة' : 'Separate copy'}</span></div><h3>{ar ? <>المزامنة <mark>مش نسخة احتياطية.</mark></> : <>Sync <mark>isn't a backup.</mark></>}</h3><p>{c.uses[2][2]}</p></article>
    </div>
    <div className={styles.capabilities}><span dir="ltr">NEXTCLOUD</span>{cloudGuideCopy[locale].services.map(([icon,title,body]) => <details key={title}><summary><FeatureIcon name={icon} size={20}/>{title}<span aria-hidden="true">+</span></summary><p>{body}</p></details>)}<p>{cloudGuideCopy[locale].servicesLead}</p></div>
  </section>;
}
