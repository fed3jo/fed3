'use client';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import type { Locale } from '@/lib/fed3/config';
import { ParticleMountainPreview } from './ParticleMountainPreview';
import type { TerrainInput } from './terrain-model';
import styles from './terrain.module.css';

const TerrainCanvas = dynamic(() => import('./TerrainCanvas'), { ssr: false });

export function InteractiveMountain({ locale }: { locale: Locale }) {
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<TerrainInput>({ x: 0, y: 0, clientX: 0, clientY: 0, hover: false, scroll: 0, impulse: 0 });
  const [rendered, setRendered] = useState(false), [unavailable, setUnavailable] = useState(false);
  const [active, setActive] = useState(true), [reduced, setReduced] = useState(true);
  const ar = locale === 'ar';
  const onReady = useCallback(() => setRendered(true), []);
  const onUnavailable = useCallback(() => { setUnavailable(true); setRendered(false); }, []);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const motion = () => setReduced(media.matches); motion(); media.addEventListener('change', motion);
    let visible = true;
    const sync = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(root.current!); document.addEventListener('visibilitychange', sync);
    let previous = scrollY;
    const scroll = () => {
      input.current.scroll = Math.min(1, scrollY / (root.current?.offsetHeight || innerHeight));
      input.current.impulse = Math.min(1, Math.abs(scrollY - previous) / 35); previous = scrollY;
    };
    window.addEventListener('scroll', scroll, { passive: true }); scroll();
    return () => { media.removeEventListener('change', motion); observer.disconnect(); document.removeEventListener('visibilitychange', sync); window.removeEventListener('scroll', scroll); };
  }, []);
  function move(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    input.current.x = (event.clientX - bounds.left) / bounds.width * 2 - 1;
    input.current.y = (event.clientY - bounds.top) / bounds.height * 2 - 1;
    input.current.clientX = event.clientX; input.current.clientY = event.clientY; input.current.hover = true;
  }
  function leave() { input.current.hover = false; input.current.x = 0; input.current.y = 0; }
  const label = ar ? 'جبل السيادة الرقمية من كرات Digital Navy تتنافر حول المؤشر، وعلم: بياناتك. قرارك!' : 'A Digital Navy mountain of interactive repelling spheres, with a summit flag: Your data. Your decision!';
  return <div ref={root} className={styles.root} data-terrain data-renderer={rendered ? 'webgl' : 'fallback'} data-motion={reduced ? 'reduced' : 'animated'} data-active={active}>
    {!rendered && <ParticleMountainPreview locale={locale} label={label} />}
    <div className={styles.canvas} role={rendered ? 'img' : undefined} aria-label={rendered ? label : undefined} aria-hidden={!rendered}>
      {!unavailable && <TerrainCanvas locale={locale} active={active} reduced={reduced} input={input} onReady={onReady} onUnavailable={onUnavailable} />}
    </div>
    <div className={styles.horizon} aria-hidden="true" />
    <svg className={styles.wind} viewBox="0 0 1440 400" preserveAspectRatio="none" fill="none" aria-hidden="true"><defs><linearGradient id="terrain-wind"><stop stopColor="#f2efe9" stopOpacity="0"/><stop offset=".45" stopColor="#f2efe9" stopOpacity=".55"/><stop offset="1" stopColor="#f2efe9" stopOpacity="0"/></linearGradient></defs><g><path d="M-100 210C260 40 340 300 790 170S1200 100 1550 40"/><path d="M-80 310C300 160 680 390 1000 240S1340 210 1520 120"/></g></svg>
    <div className={styles.pointerArea} onPointerMove={move} onPointerDown={move} onPointerUp={event => { if (event.pointerType === 'touch') leave(); }} onPointerLeave={leave} aria-hidden="true" />
  </div>;
}
