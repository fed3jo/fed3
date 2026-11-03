import { useEffect, useId, useRef } from 'react';
import type { Locale } from '@/lib/fed3/config';
import styles from './intro.module.css';

const round = (n: number) => Math.round(n * 100) / 100;
const strips = Array.from({ length: 28 }, (_, i) => ({ x: 739 + i * 235 / 28, width: 235 / 28 + 1.2, u: i / 27 }));
function clothTransform(u: number, x: number, time: number) {
  const strength = Math.pow(u, 1.25);
  const phase = u * Math.PI * 2.15 - time * 2.3;
  const gust = 4.5 + Math.sin(time * .65) * 1.1;
  const y = strength * (Math.sin(phase) * gust + Math.sin(phase * 1.8 - time * .4) * 1.4);
  const slope = strength * Math.cos(phase) * 3;
  return 'translate(0 ' + round(y) + ') translate(' + round(x) + ' 0) skewY(' + round(slope) + ') translate(' + round(-x) + ' 0)';
}

export function SovereigntyMountain({ locale }: { locale: Locale }) {
  const id = useId().replaceAll(':', '');
  const cloth = useRef<SVGGElement>(null);
  const ar = locale === 'ar';
  const motto = ar ? 'بياناتك.قرارك!' : 'Your data. Your decision!';
  useEffect(() => {
    const node = cloth.current;
    if (!node) return;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const pieces = Array.from(node.querySelectorAll<SVGGElement>('[data-cloth-strip]'));
    let visible = true, frame = 0, last = 0;
    const tick = (now: number) => {
      frame = 0;
      if (media.matches || !visible || document.hidden) return;
      if (now - last >= 32) {
        const time = now / 1000;
        pieces.forEach((piece, i) => piece.setAttribute('transform', clothTransform(strips[i].u, strips[i].x, time)));
        last = now;
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (!media.matches && visible && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(node.closest('[data-mountain]')!);
    media.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    sync();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); media.removeEventListener('change', sync); document.removeEventListener('visibilitychange', sync); };
  }, []);
  return <div className={styles.scene} data-mountain>
    <div className={styles.mountain} role="img" aria-label={ar ? 'جبل السيادة الرقمية بلون Digital Navy وعلم على قمّته: بياناتك.قرارك!' : 'A Digital Navy sovereignty mountain. Its summit flag reads: Your data. Your decision!'}>
      <div className={styles.mountainBody} aria-hidden="true" />
      <svg className={styles.mountainDrawing} viewBox="0 0 1672 941" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={id + '-flag'} x1="739" y1="133" x2="974" y2="203" gradientUnits="userSpaceOnUse"><stop stopColor="#f16e00" /><stop offset=".4" stopColor="#ff9140" /><stop offset=".75" stopColor="#f16e00" /><stop offset="1" stopColor="#f57b18" /></linearGradient>
          <g id={id + '-flag-art'}>
            <rect x="739" y="133" width="235" height="70" fill={'url(#' + id + '-flag)'} />
            <path d="M740 201H974" stroke="#062759" strokeOpacity=".14" strokeWidth="2" />
            <text x="856" y="178" fill="#062759" textAnchor="middle" direction={ar ? 'rtl' : 'ltr'} fontFamily="Plex, Arial, sans-serif" fontSize={ar ? '31' : '19'} fontWeight="500">{motto}</text>
          </g>
          {strips.map((strip, i) => <clipPath key={i} id={id + '-strip-' + i}><rect x={strip.x} y="110" width={strip.width} height="120" /></clipPath>)}
        </defs>
        <g className={styles.flagArrival} data-flag aria-label={motto}>
          <path d="M736 225V120" stroke="#11141a" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M735 222V121" stroke="#f2efe9" strokeOpacity=".65" strokeWidth="1.1" />
          <circle cx="736" cy="119" r="4" fill="#f16e00" />
          <g ref={cloth} className={styles.flagCloth}>
            {strips.map((strip, i) => <g key={i} data-cloth-strip transform={clothTransform(strip.u, strip.x, 0)}>
              <g clipPath={'url(#' + id + '-strip-' + i + ')'}><use href={'#' + id + '-flag-art'} /></g>
            </g>)}
          </g>
        </g>
      </svg>
    </div>
    <div className={styles.foregroundMist} aria-hidden="true" />
    <svg className={styles.windField} viewBox="0 0 1600 600" preserveAspectRatio="none" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id + '-wind'}><stop stopColor="#f2efe9" stopOpacity="0" /><stop offset=".25" stopColor="#fffdf8" stopOpacity=".6" /><stop offset=".7" stopColor="#fffdf8" stopOpacity=".6" /><stop offset="1" stopColor="#f2efe9" stopOpacity="0" /></linearGradient>
        <linearGradient id={id + '-warm'}><stop stopColor="#f16e00" stopOpacity="0" /><stop offset=".5" stopColor="#f16e00" stopOpacity=".25" /><stop offset="1" stopColor="#f16e00" stopOpacity="0" /></linearGradient>
      </defs>
      <g className={styles.windDrift}>
        <path className={styles.windHaze} d="M-120 275C130 130 387 378 680 274S1162 126 1720 228" stroke={'url(#' + id + '-wind)'} strokeWidth="16" />
        <path d="M-120 267C130 122 387 370 680 266S1162 118 1720 220" stroke={'url(#' + id + '-wind)'} strokeWidth="1.1" />
        <path d="M-80 365C250 210 420 468 825 355S1272 277 1700 176" stroke={'url(#' + id + '-wind)'} strokeWidth=".8" />
        <path d="M-100 386C200 454 392 293 654 384S1126 435 1680 325" stroke={'url(#' + id + '-warm)'} strokeWidth=".8" />
      </g>
    </svg>
  </div>;
}
