import type { Locale } from '@/lib/fed3/config';
import { messages } from '@/lib/fed3/messages';
import { homeCloudGuideUrl } from '@/lib/fed3/cloud-guide';
import { InitiativeIntro } from '@/components/landing/InitiativeIntro';
import identity from '@/components/landing/identity.module.css';
import styles from './redesign.module.css';

export function CloudIntro({ locale, explore, reduceMotion }: { locale: Locale; explore: () => void; reduceMotion: boolean }) {
  const ar = locale === 'ar';
  return <div data-cloud-guide-hero><InitiativeIntro locale={locale} messages={messages[locale]} ready explore={explore} variant="cloud" reduceMotion={reduceMotion}
    secondaryAction={{ href: '#cloud-readiness', label: ar ? 'قيّموا جاهزية مؤسستكم' : 'Check your organization’s readiness' }} identity={
    <div className={identity.identity}>
      <h1 id="identity-heading"><span className={identity.navy}>{ar ? 'السحابة' : 'Your local'}</span>{' '}<span className={identity.orange}>{ar ? 'المحلية' : 'cloud'}</span></h1>
      <p className={identity.description}>{ar ? <>مساحة مشتركة لملفات فريقكم، بتشتغل عبر <bdi>Nextcloud</bdi> على جهاز عندكم. <mark className={identity.focusPhrase}>الملفات بتنحفظ على جهاز المؤسسة</mark>، والفريق بوصل إلها من الموبايل أو الكمبيوتر حسب صلاحياته.</> : <>A shared workspace that runs Nextcloud on a device you manage. <mark className={identity.focusPhrase}>Files are stored on your organization’s device.</mark> Your team can open them from a phone or computer according to their permissions.</>}</p>
      <a className={styles.heroGuide} href={homeCloudGuideUrl} target="_blank" rel="noopener noreferrer">{ar ? 'الدليل المصوّر' : 'Illustrated guide'} <span aria-hidden="true">↗</span></a>
    </div>
  } /></div>;
}
