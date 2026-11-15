'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import type { Locale } from '@/lib/fed3/config';
import type { Criterion } from '@/lib/fed3/alternatives';
import styles from './comparison.module.css';

export function ComparisonAutoAdvance({ locale, readingArea, criterion, duration, paused, expanded, onPause, onNext }: {
  locale: Locale;
  readingArea: RefObject<HTMLDivElement | null>;
  criterion: Criterion;
  duration: number;
  paused: boolean;
  expanded: boolean;
  onPause: () => void;
  onNext: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(true);
  const [progress, setProgress] = useState(0);
  const elapsed = useRef(0);
  const next = useRef(onNext);
  const running = visible && foreground && !paused && !expanded;

  useEffect(() => { next.current = onNext; }, [onNext]);

  useEffect(() => {
    const facts = readingArea.current?.querySelector(`[data-comparison-row="${criterion}"] [data-comparison-current]`)?.parentElement;
    if (!facts) return;
    const topic = readingArea.current?.querySelector<HTMLElement>(`[data-comparison-topic="${criterion}"]`);
    const nav = topic?.parentElement;
    if (topic && nav) {
      const buttonBounds = topic.getBoundingClientRect();
      const navBounds = nav.getBoundingClientRect();
      nav.scrollBy({ left: buttonBounds.left + buttonBounds.width / 2 - navBounds.left - navBounds.width / 2 });
    }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.intersectionRatio >= 0.6), { threshold: [0, 0.6] });
    observer.observe(facts);
    const visibility = () => setForeground(!document.hidden);
    visibility();
    document.addEventListener('visibilitychange', visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [readingArea, criterion]);

  useEffect(() => {
    if (!running) return;
    const started = Date.now();
    const remaining = Math.max(0, duration - elapsed.current);
    const timer = window.setTimeout(() => next.current(), remaining);
    const indicator = window.setInterval(() => setProgress(Math.min(1, (elapsed.current + Date.now() - started) / duration)), 100);
    return () => {
      elapsed.current += Date.now() - started;
      window.clearTimeout(timer);
      window.clearInterval(indicator);
    };
  }, [running, duration]);

  const ar = locale === 'ar';
  return <div className={styles.autoAdvance} data-comparison-auto data-running={running} data-reading-duration={duration}>
    <span className={styles.readingTrack} aria-hidden="true"><span style={{ width: `${progress * 100}%` }} /></span>
    <button type="button" aria-pressed={paused} onClick={onPause} aria-label={paused ? (ar ? 'تشغيل التنقل التلقائي' : 'Start automatic navigation') : (ar ? 'إيقاف التنقل التلقائي' : 'Pause automatic navigation')}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">{paused ? <path d="M3 1.5 10 6l-7 4.5z" /> : <path d="M2 1h3v10H2zm5 0h3v10H7z" />}</svg>
      {paused ? (ar ? 'تشغيل التنقل' : 'Start auto') : (ar ? 'تنقّل تلقائي' : 'Auto advance')}
    </button>
  </div>;
}
