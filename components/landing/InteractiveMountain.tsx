'use client';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import type { Locale } from '@/lib/fed3/config';
import { ParticleMountainPreview } from './ParticleMountainPreview';
import type { TerrainInput } from './terrain-model';
import { hasConstrainedConnection } from '@/lib/fed3/network';
import styles from './terrain.module.css';

const TerrainCanvas = dynamic(() => import('./TerrainCanvas'), { ssr: false });

export function InteractiveMountain({ locale }: { locale: Locale }) {
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<TerrainInput>({ x: 0, y: 0, clientX: 0, clientY: 0, hover: false, scroll: 0, impulse: 0 });
  const [rendered, setRendered] = useState(false), [unavailable, setUnavailable] = useState(false);
  const [active, setActive] = useState(true), [reduced, setReduced] = useState(true);
  const [scrolling, setScrolling] = useState(false);
  const scrollingRef = useRef(false);
  const [enabled, setEnabled] = useState(false), [deferred, setDeferred] = useState(false);
  const ar = locale === 'ar';
  const onReady = useCallback(() => setRendered(true), []);
  const onUnavailable = useCallback(() => { setUnavailable(true); setRendered(false); }, []);
  useEffect(() => {
    if (hasConstrainedConnection()) { setDeferred(true); return; }
    let idle: number | undefined, timer: ReturnType<typeof setTimeout> | undefined;
    const enable = () => setEnabled(true);
    const schedule = () => {
      if ('requestIdleCallback' in window) idle = window.requestIdleCallback(enable, { timeout: 2000 });
      else timer = setTimeout(enable, 200);
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });
    return () => {
      window.removeEventListener('load', schedule);
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) clearTimeout(timer);
    };
  }, []);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const motion = () => setReduced(media.matches); motion(); media.addEventListener('change', motion);
    let visible = true;
    const sync = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(root.current!); document.addEventListener('visibilitychange', sync);
    let previous = scrollY;
    let height = root.current?.offsetHeight || innerHeight;
    let scrollTimer: ReturnType<typeof setTimeout> | undefined;
    const resizeObserver = new ResizeObserver(([entry]) => { height = entry.contentRect.height || innerHeight; });
    resizeObserver.observe(root.current!);
    const scroll = () => {
      if (Math.abs(scrollY - previous) > 1) {
        input.current.hover = false;
        if (!scrollingRef.current) { scrollingRef.current = true; setScrolling(true); }
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => { scrollingRef.current = false; setScrolling(false); }, 160);
      }
      // Reuse the observed height instead of reading layout during every scroll event.
      input.current.scroll = Math.min(1, scrollY / height);
      input.current.impulse = Math.min(1, Math.abs(scrollY - previous) / 35); previous = scrollY;
    };
    window.addEventListener('scroll', scroll, { passive: true }); scroll();
    return () => {
      clearTimeout(scrollTimer); resizeObserver.disconnect();
      media.removeEventListener('change', motion); observer.disconnect();
      document.removeEventListener('visibilitychange', sync); window.removeEventListener('scroll', scroll);
    };
  }, []);
  function move(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    input.current.x = (event.clientX - bounds.left) / bounds.width * 2 - 1;
    input.current.y = (event.clientY - bounds.top) / bounds.height * 2 - 1;
    input.current.clientX = event.clientX; input.current.clientY = event.clientY; input.current.hover = !scrollingRef.current;
  }
  function leave() { input.current.hover = false; input.current.x = 0; input.current.y = 0; }
  const label = ar ? 'جبل Fed3 ثلاثي الأبعاد من كرات كحلية وبرتقالية، وعلم: بياناتك. قرارك!' : 'An interactive Fed3 mountain of navy and orange spheres, with a summit flag: Your data. Your decision!';
  return <div ref={root} className={styles.root} data-terrain data-shape="spheres" data-scrolling={scrolling} data-renderer={rendered ? 'webgl' : 'fallback'} data-motion={reduced ? 'reduced' : 'animated'} data-active={active}>
    {!rendered && <ParticleMountainPreview locale={locale} label={label} />}
    <div className={styles.canvas} role={rendered ? 'img' : undefined} aria-label={rendered ? label : undefined} aria-hidden={!rendered}>
      {enabled && !unavailable && <TerrainCanvas locale={locale} active={active && !scrolling} reduced={reduced} input={input} onReady={onReady} onUnavailable={onUnavailable} />}
    </div>
    <div className={styles.horizon} aria-hidden="true" />
    <svg className={styles.wind} viewBox="0 0 1440 400" preserveAspectRatio="none" fill="none" aria-hidden="true"><defs><linearGradient id="terrain-wind"><stop stopColor="#f2efe9" stopOpacity="0"/><stop offset=".45" stopColor="#f2efe9" stopOpacity=".55"/><stop offset="1" stopColor="#f2efe9" stopOpacity="0"/></linearGradient></defs><g><path d="M-100 210C260 40 340 300 790 170S1200 100 1550 40"/><path d="M-80 310C300 160 680 390 1000 240S1340 210 1520 120"/></g></svg>
    <div className={styles.pointerArea} onPointerMove={move} onPointerDown={move} onPointerUp={event => { if (event.pointerType === 'touch') leave(); }} onPointerLeave={leave} aria-hidden="true" />
    {deferred && !enabled && <button type="button" className={styles.enable3d} onClick={() => setEnabled(true)}>{ar ? 'تفعيل الجبل ثلاثي الأبعاد' : 'Enable interactive 3D'}</button>}
  </div>;
}
