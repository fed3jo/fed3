'use client';

import { Component, type ErrorInfo, type ReactNode, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Locale } from '@/lib/fed3/config';
import styles from './launcher.module.css';

const ExposedGame = dynamic(() => import('./exposed/ExposedGame'), { ssr: false, loading: () => <div className={styles.loading} role="status"><span /><div>مكشوف / EXPOSED<small>جارٍ تجهيز المدينة · Loading the city</small></div></div> });
class GameBoundary extends Component<{ children: ReactNode; close: () => void; locale: Locale }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo) { /* Game errors stay inside this boundary. */ }
  render() { return this.state.error ? <div className={styles.error} role="alertdialog" aria-modal="true" aria-labelledby="game-error-title" dir={this.props.locale === 'ar' ? 'rtl' : 'ltr'}><p className={styles.errorCode}>FED3 / EXPOSED</p><h2 id="game-error-title">{this.props.locale === 'ar' ? 'تعذّر تجهيز المدينة' : 'The city could not load'}</h2><p>{this.props.locale === 'ar' ? 'ارجع للصفحة وجرّب تفتح اللعبة مرة ثانية. إذا استمرت المشكلة، جرّب متصفحًا يدعم WebGL.' : 'Return to the page and open the game again. If the problem continues, try a browser with WebGL support.'}</p><button autoFocus onClick={this.props.close}>{this.props.locale === 'ar' ? 'العودة للبدائل' : 'Back to alternatives'}</button></div> : this.props.children; }
}
function CityArtwork({ ar }: { ar: boolean }) {
  const skyline = [{ x: 18, y: 182, w: 65, h: 154 }, { x: 90, y: 140, w: 74, h: 196 }, { x: 172, y: 209, w: 45, h: 127 }, { x: 223, y: 107, w: 72, h: 229 }, { x: 305, y: 157, w: 52, h: 179 }, { x: 365, y: 198, w: 42, h: 138 }, { x: 418, y: 163, w: 57, h: 173 }, { x: 485, y: 92, w: 68, h: 244 }, { x: 565, y: 191, w: 45, h: 145 }, { x: 617, y: 132, w: 74, h: 204 }, { x: 702, y: 183, w: 68, h: 153 }];
  return <svg viewBox="0 0 800 640" role="img" aria-label={ar ? 'رسم لشارع مدينة ليلًا وأجهزة مراقبة فوق الطريق إلى مقر Fed3.' : 'An illustration of a city street at night, with surveillance drones above the route to Fed3.'} className={styles.city}>
    <defs>
      <linearGradient id="exposed-sky" x2="0" y2="1"><stop stopColor="#102b4c" /><stop offset=".6" stopColor="#46617a" /><stop offset="1" stopColor="#ac9180" /></linearGradient>
      <linearGradient id="exposed-road" x2="0" y2="1"><stop stopColor="#4b5e6b" /><stop offset="1" stopColor="#071628" /></linearGradient>
      <linearGradient id="exposed-front" x2="1" y2="1"><stop stopColor="#223a50" /><stop offset="1" stopColor="#091d33" /></linearGradient>
      <linearGradient id="exposed-scan" x2="0" y2="1"><stop stopColor="#ff8a35" stopOpacity=".28" /><stop offset="1" stopColor="#ff8a35" stopOpacity="0" /></linearGradient>
      <radialGradient id="exposed-haze"><stop stopColor="#e2ad7c" stopOpacity=".34" /><stop offset="1" stopColor="#e2ad7c" stopOpacity="0" /></radialGradient>
      <radialGradient id="exposed-vignette"><stop offset=".45" stopColor="#07172a" stopOpacity="0" /><stop offset="1" stopColor="#07172a" stopOpacity=".8" /></radialGradient>
      <pattern id="exposed-windows" width="24" height="29" patternUnits="userSpaceOnUse"><rect x="6" y="7" width="9" height="13" fill="#d5bb8a" opacity=".38" /><path d="M10.5 7v13M6 13.5h9" stroke="#22384b" strokeWidth="1.5" /></pattern>
      <pattern id="exposed-front-windows" width="49" height="61" patternUnits="userSpaceOnUse"><rect x="11" y="11" width="24" height="37" fill="#0a1e30" /><rect x="12" y="12" width="22" height="19" fill="#9baca7" opacity=".24" /><path d="M23 12v35M12 31h22" stroke="#506475" strokeWidth="2" /><path d="M9 49h28" stroke="#7691a0" strokeWidth="2" opacity=".35" /></pattern>
    </defs>
    <rect width="800" height="640" fill="url(#exposed-sky)" />
    <ellipse cx="440" cy="319" rx="380" ry="170" fill="url(#exposed-haze)" />
    <circle cx="649" cy="102" r="26" fill="#dce8e6" opacity=".67" /><circle cx="641" cy="95" r="26" fill="#203c56" />
    <g opacity=".58">{skyline.map((b, i) => <g key={b.x}><rect x={b.x} y={b.y} width={b.w} height={b.h} fill={i % 2 ? '#263e51' : '#314a5c'} /><rect x={b.x} y={b.y} width={b.w} height={b.h} fill="url(#exposed-windows)" /></g>)}</g>
    <path d="M344 335h100L696 640H71Z" fill="url(#exposed-road)" /><path d="M345 335 71 640H0V335Zm99 0 252 305h104V335Z" fill="#344758" />
    <path d="m342 336-202 304M448 336l198 304" stroke="#7b8b91" strokeWidth="2" opacity=".5" /><path d="M395 347v16m-3 17-2 24m-1 23-4 33m-4 30-8 53m-4 34-9 63" stroke="#e5d7ac" strokeWidth="4" opacity=".32" />
    <g opacity=".12" stroke="#ffae68" strokeWidth="2"><path d="m310 407-78 195m287-203 80 207m-146-173 17 133M263 457l-61 127" /></g>
    <path d="M0 75 244 177v270L0 563Z" fill="url(#exposed-front)" /><path d="M0 75 244 177v270L0 563Z" fill="url(#exposed-front-windows)" /><path d="m244 177 35-21v274l-35 17Z" fill="#11283b" />
    <path d="m0 361 244-30v21L0 395Z" fill="#f16e00" opacity=".75" /><path d="m0 398 227-43v46L0 468Z" fill="#071a2d" /><path d="m47 390 133-25v17L47 411Z" fill="#e8ddc4" opacity=".65" />
    <path d="M800 27 567 159v312l233 142Z" fill="#172f44" /><path d="M800 27 567 159v312l233 142Z" fill="url(#exposed-front-windows)" /><path d="m567 159-29-15v310l29 17Z" fill="#0d263b" />
    <path d="m800 390-233-40v24l233 54Z" fill="#435e73" /><path d="m800 449-224-70v49l224 92Z" fill="#0a1e32" /><path d="m615 390 105 33v21l-105-37Z" fill="#ed7d35" opacity=".85" />
    <g stroke="#506777" strokeWidth="3" fill="none"><path d="M220 464V278l52-11 22 11" /><path d="M586 489V280l-54-9-19 11" /></g><path d="m270 275 20 2-4 5h-17Zm246 4 20-3 1 7h-19Z" fill="#ffe0a9" />
    <path d="m275 282-47 184h104Z" fill="#ffba75" opacity=".035" /><path d="m525 283-48 194h105Z" fill="#ffba75" opacity=".035" />
    <g transform="translate(362 300)"><rect width="75" height="45" rx="2" fill="#08234c" stroke="#718c99" /><text x="37" y="23" fontFamily="sans-serif" fontSize="21" fontWeight="700" textAnchor="middle" fill="#fff7e8">Fed3<tspan fill="#f16e00">.</tspan></text><path d="M21 33h31m-6-4 6 4-6 4" fill="none" stroke="#f68c44" strokeWidth="2" /></g>
    <g className={styles.drone}><path d="m409 182-74 185h166Z" fill="url(#exposed-scan)" /><path d="M374 176h70m-55 1 11 13h20l12-13" fill="#0b1a2a" stroke="#8b9eaa" strokeWidth="2" /><ellipse cx="375" cy="175" rx="20" ry="4" fill="#102c45" stroke="#90a5b3" /><ellipse cx="445" cy="175" rx="20" ry="4" fill="#102c45" stroke="#90a5b3" /><circle cx="409" cy="188" r="4" fill="#ff8141" /></g>
    <g stroke="#ff9e60" strokeWidth="1.5" fill="none" opacity=".65"><path d="M324 383v-13h13m90 0h13v13m0 58v13h-13m-90 0h-13v-13" /><path d="M377 361v-8m0 110v8" /></g>
    <g transform="translate(375 405)" fill="#061424"><circle cy="-21" r="8" /><path d="m-6-12 14-2 7 30-17 2-8-15Z" /><path d="m-1 15-10 22-8 3 10-29m16 5 9 13 15 4-2 6-20-5-11-17M6-8l19 11 10-8 4 5-14 12L9 4m-14-12-16 8-9 16-5-4 9-20 18-11" /></g>
    <path d="m459 503 25 1-13 13m12-13-47 36-13 37" stroke="#f58e4e" strokeWidth="2" strokeDasharray="7 7" fill="none" opacity=".8" /><rect width="800" height="640" fill="url(#exposed-vignette)" />
    <path d="M34 50V34h16m700 0h16v16M34 590v16h16m700 0h16v-16" stroke="#adc0ca" strokeWidth="1" fill="none" opacity=".45" />
    <text x="56" y="57" fill="#cad4d9" fontFamily="monospace" fontSize="10" letterSpacing="2">EXPOSED / CITY SECTOR 01</text><circle cx="677" cy="51" r="3" fill="#f68c44" /><text x="689" y="55" fill="#f2b48a" fontFamily="monospace" fontSize="9" letterSpacing="1">TRACKING</text>
  </svg>;
}
export function GameLauncher({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false), [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const launchButton = useRef<HTMLButtonElement>(null);
  const ar = locale === 'ar';
  const close = () => { setOpen(false); requestAnimationFrame(() => launchButton.current?.focus({ preventScroll: true })); };
  return <>
    <section id="game" tabIndex={-1} className={styles.teaser} aria-labelledby="game-heading" data-game-teaser>
      <div className={styles.art}><CityArtwork ar={ar} /><div className={styles.artLabel}><span /><span>{ar ? 'مدينة تحت المراقبة' : 'A city under surveillance'}</span><span className={styles.coordinates}>31°57′ N / 35°56′ E</span></div></div>
      <div className={styles.copy}><p className={styles.eyebrow}><span />03 / {ar ? 'تجربة تفاعلية ثلاثية الأبعاد' : 'An interactive 3D experience'}</p><h2 id="game-heading">{ar ? 'مكشوف' : 'Exposed'}<span>.</span></h2><p className={styles.statement}>{ar ? 'المدينة بتعرف وين إنت.' : 'The city knows where you are.'}</p><p className={styles.lead}>{ar ? 'معك ملفات الفريق، وقدّامك طريق للمقر. اقطع المدينة، تجنّب الدرونات، واكتشف كيف التطبيقات اللي بتسهّل طريقك ممكن تكشفه لغيرك.' : 'You have the team’s files and a route to their headquarters. Cross the city, evade the drones, and discover how the apps guiding you can give away your route.'}</p><div className={styles.tags}><span>{ar ? 'مدينة 3D' : '3D city'}</span><span>{ar ? 'لمس + كمبيوتر' : 'Touch + desktop'}</span><span>{ar ? 'طولي أو عرضي' : 'Portrait or landscape'}</span></div><button ref={launchButton} className={styles.start} disabled={!ready} onClick={() => setOpen(true)} data-game-launch><span>{ar ? 'ادخل المدينة' : 'Enter the city'}</span><svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true"><path d="M5 19 19 5M6 5h13v13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></button><p className={styles.note}>{ar ? 'محاكاة ببيانات خيالية. اللعبة ما بتطلب موقعك ولا ملفاتك. تقدّمك بينحفظ بهالمتصفح.' : 'A simulation with fictional data. The game does not ask for your location or files. Progress is saved in this browser.'} <a href={`/${locale}/privacy/`}>{ar ? 'كيف بنحفظ تقدّمك؟' : 'How is progress stored?'}</a></p></div>
    </section>
    {open && <GameBoundary close={close} locale={locale}><ExposedGame locale={locale} onClose={close} /></GameBoundary>}
  </>;
}
