'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { Messages } from '@/lib/fed3/messages';
import type { ResourceSnapshot } from '@/lib/fed3/resources';
import styles from './landing.module.css';

export function SequencePreloader({ snapshot, ready, messages, retry, simplify, onComplete }: {
  snapshot: ResourceSnapshot; ready: boolean; messages: Messages; retry: () => void; simplify: () => void; onComplete: () => void;
}) {
  const [stalled, setStalled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setStalled(false);
    if (ready) return;
    const timer = setTimeout(() => setStalled(true), 18_000);
    return () => clearTimeout(timer);
  }, [snapshot.completed, ready, attempt]);
  useEffect(() => {
    if (!ready) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const reveal = setTimeout(() => {
      setLeaving(true);
    }, reduced ? 0 : 550);
    const dismiss = setTimeout(() => { setHidden(true); onComplete(); }, reduced ? 0 : 1450);
    return () => { clearTimeout(reveal); clearTimeout(dismiss); };
  }, [ready, onComplete]);
  useEffect(() => {
    if (hidden) return;
    window.scrollTo(0, 0);
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    window.fed3Lenis?.stop();
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
      window.fed3Lenis?.start();
    };
  }, [hidden]);
  if (hidden) return null;
  const error = snapshot.failed.length > 0 || snapshot.manifestError;
  const settled = snapshot.completed + snapshot.failed.length;
  const percent = Math.floor(settled / 240 * 100);
  return <aside className={`${styles.preloader} ${ready ? styles.loaderReady : ''} ${leaving ? styles.loaderDone : ''}`} aria-label={messages.loading}>
    <div className={styles.loaderMasthead}><span dir="ltr">Fed3.</span><span>{messages.stations.intro.eyebrow}</span></div>
    <div className={styles.loaderIdentity}><Image src="/fed3-logo.svg" width={140} height={90} alt="Fed3" priority /><span dir="ltr">Fed3<span>.</span></span></div>
    <div className={styles.loaderInformation}>
      <div className={styles.loaderTop}><span>{error && !ready ? messages.loadError : stalled ? messages.stall : settled === 240 ? messages.preparing : messages.loading}</span><bdi className={styles.percentage} dir="ltr">{percent}<small>%</small></bdi></div>
      <div className={styles.progressTrack} role="progressbar" aria-label={messages.loading} aria-valuemin={0} aria-valuemax={240} aria-valuenow={settled}><span style={{ transform: `scaleX(${settled / 240})` }} /></div>
      <div className={styles.loaderBottom}><span><bdi dir="ltr">{snapshot.completed} / 240</bdi> {messages.loadingCount}</span><div>
        {(error || stalled) && <button onClick={() => { setAttempt(a => a + 1); retry(); }}>{messages.retry}</button>}
        <button onClick={simplify}>{messages.simplified} ↗</button>
      </div></div>
    </div>
  </aside>;
}
