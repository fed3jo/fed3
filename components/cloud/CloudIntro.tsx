import type { Locale } from '@/lib/fed3/config';
import { messages } from '@/lib/fed3/messages';
import { homeCloudGuideUrl } from '@/lib/fed3/cloud-guide';
import { InitiativeIntro } from '@/components/landing/InitiativeIntro';
import identity from '@/components/landing/identity.module.css';
import styles from './redesign.module.css';

export function CloudIntro({ locale, explore, reduceMotion }: { locale: Locale; explore: () => void; reduceMotion: boolean }) {
  const ar = locale === 'ar';
  return <div data-cloud-guide-hero><InitiativeIntro locale={locale} messages={messages[locale]} ready explore={explore} variant="cloud" reduceMotion={reduceMotion} identity={
    <div className={identity.identity}>
      <p className={identity.eyebrow}>{ar ? 'المحطة الثانية / مساحة لملفاتكم' : 'STATION TWO / A SPACE FOR YOUR FILES'}</p>
      <h1 id="identity-heading"><span className={identity.navy}>{ar ? 'السحابة' : 'Your local'}</span>{' '}<span className={identity.orange}>{ar ? 'المحلية' : 'cloud'}</span></h1>
      <p className={identity.description}>{ar ? <>جهاز عندكم، يصير مساحة لملفات الفريق مع Nextcloud. <mark className={identity.focusPhrase}>خزّنوا وشاركوا من مكان بتديروه.</mark> ابدأوا بجهاز مناسب، وصلاحيات واضحة، ونسخة احتياطية مستقلة.</> : <>Turn suitable hardware into a shared space with Nextcloud. <mark className={identity.focusPhrase}>Store and share from a place you manage.</mark> Start with clear permissions and a separate backup.</>}</p>
      <a className={styles.heroGuide} href={homeCloudGuideUrl} target="_blank" rel="noopener noreferrer">{ar ? 'الدليل المصوّر' : 'Illustrated guide'} <span aria-hidden="true">↗</span></a>
    </div>
  } /></div>;
}
