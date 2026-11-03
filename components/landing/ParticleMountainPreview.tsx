import type { Locale } from '@/lib/fed3/config';
import styles from './terrain.module.css';

export function ParticleMountainPreview({ locale, label }: { locale: Locale; label: string }) {
  return <div className={styles.preview} data-particle-preview>
    <picture>
      <source media="(max-width: 360px)" srcSet={`/hero/particles/narrow-${locale}.webp`} />
      <source media="(max-width: 800px)" srcSet={`/hero/particles/mobile-${locale}.webp`} />
      <source media="(min-width: 1600px)" srcSet={`/hero/particles/wide-${locale}.webp`} />
      <img src={`/hero/particles/desktop-${locale}.webp`} width={1440} height={600} alt={label} loading="eager" fetchPriority="high" />
    </picture>
  </div>;
}
