'use client';
import type { Locale } from '@/lib/fed3/config';
import styles from './identity.module.css';

export function InitiativeIdentity({ locale, ready }: { locale: Locale; ready: boolean }) {
  const ar = locale === 'ar';
  return <div className={styles.identity} aria-labelledby="identity-heading" data-initiative-identity data-ready={ready}>
    <p className={styles.eyebrow}>{ar ? 'مبادرة السيادة الرقمية / عمّان' : 'DIGITAL SOVEREIGNTY INITIATIVE / AMMAN'}</p>
    <h1 id="identity-heading">{ar ? 'افهم خياراتك الرقمية' : 'Understand your digital choices'}</h1>
    <p className={styles.description}>{ar ? 'نحن متطوعون من برنامج اليافعين في مؤسسة رواد التنمية. نساعدك تجرّب بدائل رقمية، وتفهم وين بتروح ملفاتك، وتشارك اللي تعلّمته مع مجتمعك.' : 'We are volunteers from the youth program at Ruwwad Al Tanmeya. We help you try digital alternatives, understand where your files go, and share what you learn with your community.'}</p>
  </div>;
}
