import type { Locale } from '@/lib/fed3/config';
import { FeatureIcon } from '@/components/shared/FeatureIcon';
import { CloudScreenshot } from './CloudScreenshot';
import styles from './redesign.module.css';

export function CloudOverview({ locale }: { locale: Locale }) {
  const ar = locale === 'ar';
  const features = ar ? [
    ['folder', 'ملفات بمكان واحد', 'ارفعوا المستندات والصور، وحدّدوا المجلدات اللي بدكم تزامنوها بين الأجهزة.'],
    ['people', 'وصول حسب الصلاحية', 'لكل شخص حسابه. شاركوا مجلدًا مع فريق معيّن، وحدّدوا مين بقدر يشوف أو يعدّل.'],
    ['backup', 'نسخة منفصلة للاستعادة', 'المزامنة بتنقل التعديلات والحذف بين الأجهزة. جهّزوا نسخة احتياطية مستقلة وجرّبوا استعادتها.'],
  ] : [
    ['folder', 'Files in one place', 'Upload documents and photos, then choose which folders to sync across devices.'],
    ['people', 'Access by permission', 'Give each person an account. Share a folder with a team and decide who can view or edit it.'],
    ['backup', 'A separate recovery copy', 'Sync carries edits and deletions across devices. Keep a separate backup and test that you can restore it.'],
  ];

  return <section id="cloud-overview" tabIndex={-1} className={styles.overview} aria-labelledby="cloud-overview-heading">
    <div className={styles.sectionHead}>
      <h2 id="cloud-overview-heading">{ar ? 'شو بتقدّم السحابة المحلية؟' : 'What can you do with a local cloud?'}</h2>
      <p>{ar ? 'مثلًا، فريق بمركز مجتمعي بقدر يشارك مجلد مواد التدريب من جهاز المركز. المدرّبون بعدّلوا، والمشاركون بشوفوا الملفات اللي انشاركت معهم.' : 'A community center could share a training folder from its own computer. Trainers can edit it, and participants can view the files shared with them.'}</p>
    </div>
    <div className={styles.serviceLayout}>
      <div className={styles.serviceFeatures}>{features.map(([icon, title, detail]) => <article key={icon}>
        <span><FeatureIcon name={icon} size={23} /></span>
        <div><h3>{title}</h3><p>{detail}</p></div>
      </article>)}</div>
      <CloudScreenshot id="files" locale={locale} sizes="(max-width: 800px) 88vw, 49vw" />
    </div>
    <div className={styles.sectionActions}>
      <a href="#cloud-flow">{ar ? 'شوفوا مسار الملف' : 'Follow a file'} <span aria-hidden="true">↓</span></a>
      <a href="#cloud-requirements">{ar ? 'قارنوا مواصفات الأجهزة' : 'Compare hardware specs'} <span aria-hidden="true">↓</span></a>
    </div>
  </section>;
}
