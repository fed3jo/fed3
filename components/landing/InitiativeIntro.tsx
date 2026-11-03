'use client';
import { useEffect, useRef } from 'react';
import type { Locale, Station } from '@/lib/fed3/config';
import type { Messages } from '@/lib/fed3/messages';
import { InteractiveMountain } from './InteractiveMountain';
import { InitiativeIdentity } from './InitiativeIdentity';
import styles from './intro.module.css';

export function InitiativeIntro({ locale, messages, ready, explore }: { locale: Locale; messages: Messages; ready: boolean; explore: (station?: Station) => void }) {
  const root = useRef<HTMLElement>(null);
  const ar = locale === 'ar';
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => { element.dataset.active = String(entry.isIntersecting); });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <section ref={root} className={styles.intro} data-ready={ready} aria-labelledby="identity-heading">
    <InitiativeIdentity locale={locale} ready={ready} />
    <InteractiveMountain locale={locale} />
    <div className={styles.exploreWrap}><button className={styles.explore} onClick={() => explore('alternatives')}><span>{ar ? 'ابدأ رحلتك' : 'Start your journey'}</span><span aria-hidden="true">↓</span></button><span className={styles.scrollHint}>{messages.scroll}</span></div>
    <div className={styles.bottom}>
      <div className={styles.location}><i />{ar ? 'من عمّان، الأردن' : 'FROM AMMAN, JORDAN'}</div>
      <p>{ar ? 'مبادرة من متطوعي برنامج اليافعين في مؤسسة رواد التنمية.' : 'An initiative by youth-program volunteers at Ruwwad Al Tanmeya.'}</p>
      <span className={styles.edition} dir="ltr">01 / 03 · FED3</span>
    </div>
  </section>;
}
