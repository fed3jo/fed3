import type { Alternative } from '@/lib/fed3/alternatives';
import type { Locale } from '@/lib/fed3/config';
import { AppLogo } from './AppLogo';
import { StoryIcon } from '@/components/shared/SovereigntyStory';
import styles from './alternatives.module.css';

export function AppUseVisual({ app, locale }: { app: Alternative; locale: Locale }) {
  const ar = locale === 'ar';
  return <div className={styles.useVisual} aria-hidden="true">
    <div className={styles.useOrbit} /><div className={styles.useOrbitSmall} />
    <div className={styles.deviceCard}>
      <div className={styles.deviceToolbar}><i /><i /><i /><span dir="ltr">{app.name}</span></div>
      <div className={styles.deviceBody}><span className={styles.deviceLogo}><AppLogo name={app.name} size={62} /></span>
        <span className={styles.deviceCategory}>{ar ? 'خطوتك نحو خيار آخر' : 'ONE STEP TOWARD ANOTHER OPTION'}</span>
        <div className={styles.deviceSkeleton}><span /><span /><span /></div>
        <span className={styles.devicePill}>{ar ? 'بياناتك. قرارك.' : 'Your data. Your decision.'}<span>↗</span></span>
      </div>
    </div>
    <span className={styles.useTag} data-position="one"><StoryIcon kind="choice" />{ar ? 'خيار تفهمه' : 'An informed choice'}</span>
    <span className={styles.useTag} data-position="two"><StoryIcon kind="people" />{ar ? 'تجربة على مهلك' : 'Try it at your pace'}</span>
    <span className={styles.useVisualCaption}>{ar ? 'ابدأ بالتجربة، وخلي القرار بإيدك.' : 'Try it first. Keep the choice yours.'}</span>
  </div>;
}
