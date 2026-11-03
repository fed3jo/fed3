import type { Locale } from '@/lib/fed3/config';
import { narrative } from '@/lib/fed3/narrative';
import styles from './narrative.module.css';

export function StoryIcon({ kind }: { kind: string }) {
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    {kind === 'choice' ? <><path d="M16 27V15M16 20 7 11M16 16l9-9M3 11h8V3M21 3h8v8" /><circle cx="16" cy="27" r="2" /></> : kind === 'data' ? <><ellipse cx="16" cy="8" rx="10" ry="4" /><path d="M6 8v8c0 5 20 5 20 0V8M6 16v8c0 5 20 5 20 0v-8" /><path d="M12 14h3M12 22h3" /></> : <><circle cx="16" cy="10" r="4" /><circle cx="5" cy="16" r="3" /><circle cx="27" cy="16" r="3" /><path d="M9 28v-4a7 7 0 0 1 14 0v4M1 28v-4a4 4 0 0 1 5-4M31 28v-4a4 4 0 0 0-5-4" /></>}
  </svg>;
}

export function SovereigntyStory({ locale }: { locale: Locale }) {
  const c = narrative[locale];
  return <section className={styles.story} aria-label={c.title}>
    <div className={styles.heading}><div><p>{c.eyebrow}</p><h2>{c.title}</h2></div><p>{c.lead}</p></div>
    <div className={styles.lenses}>{c.lenses.map((lens, index) => <article key={lens.key}>
      <div className={styles.top}><span><StoryIcon kind={lens.key} /></span><small dir="ltr">0{index + 1}</small></div>
      <p className={styles.label}>{lens.label}</p><h3>{lens.question}</h3><p className={styles.body}>{lens.text}</p>
    </article>)}</div>
    <p className={styles.closing}><span aria-hidden="true">↳</span>{c.closing}</p>
  </section>;
}
