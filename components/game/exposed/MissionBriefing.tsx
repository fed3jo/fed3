'use client';

import { useEffect, useRef, useState } from 'react';
import MissionVisual, { type VisualKind } from './MissionVisual';
import styles from './exposed.module.css';

const copy = {
  ar: [
    ['ملفاتك وملفات الفريق:', 'وصلها لمقر Fed3.'],
    ['تجنّب الرصد:', 'اختبئ أو غيّر مسارك.'],
    ['نبضة EMP:', 'بتعطّل الدرون مؤقتًا حتى تهرب.'],
  ],
  en: [
    ['Your files and team data:', 'Deliver them to Fed3 HQ.'],
    ['Avoid detection:', 'Take cover or change your route.'],
    ['EMP pulse:', 'Temporarily disables drones so you can escape.'],
  ],
};
const visuals: VisualKind[] = ['delivery', 'stealth', 'pulse'];

export default function MissionBriefing({ ar, calm, resume, onType, onStart }: { ar: boolean; calm: boolean; resume: boolean; onType: () => void; onStart: () => void }) {
  const lines = copy[ar ? 'ar' : 'en'], total = lines.reduce((sum, [title, text]) => sum + title.length + text.length, 0);
  const [shown, setShown] = useState(0);
  const startButton = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const reveal = () => { if (timer.current) clearInterval(timer.current); setShown(total); startButton.current?.focus({ preventScroll: true }); };
  const complete = calm || shown >= total;
  useEffect(() => {
    setShown(0);
    if (calm) return;
    let count = 0;
    timer.current = setInterval(() => {
      count++; setShown(count);
      if (count % 3 === 0) onType();
      if (count >= total && timer.current) clearInterval(timer.current);
    }, 28);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [ar, calm, total, onType]);
  let offset = 0;
  return <div className={styles.briefingOverlay} data-briefing data-typing={!complete} role="dialog" aria-modal="true" aria-label={ar ? 'برقية المهمة' : 'Mission briefing'} onKeyDown={e => {
    if (e.code === 'Space' && !complete) { e.preventDefault(); e.stopPropagation(); reveal(); }
  }}>
    <section className={styles.briefingCard}>
      <div className={styles.briefingBody}>
        {lines.map(([title, text], i) => {
          const length = title.length + text.length, visible = complete ? length : Math.max(0, Math.min(length, shown - offset)); offset += length;
          return <div className={styles.briefingRow} key={title} data-revealed={visible > 0}>
            <MissionVisual kind={visuals[i]} label={`${title} ${text}`} />
            <p className={styles.briefingText} aria-label={`${title} ${text}`}><strong><mark>{title.slice(0, visible)}</mark>{visible > title.length && ` ${text.slice(0, visible - title.length)}`}{!complete && visible > 0 && visible < length && <span className={styles.typingCursor} aria-hidden="true" />}</strong></p>
          </div>;
        })}
      </div>
      <div className={styles.briefingFooter}>
        <button ref={startButton} className={styles.briefingStart} onClick={onStart} data-briefing-start autoFocus>{resume ? (ar ? 'متابعة المهمة' : 'Resume mission') : (ar ? 'ابدأ المهمة' : 'Start mission')}</button>
        {!complete && <button className={styles.revealText} onClick={reveal} data-briefing-reveal>{ar ? 'إظهار النص' : 'Show all'}</button>}
      </div>
    </section>
  </div>;
}
