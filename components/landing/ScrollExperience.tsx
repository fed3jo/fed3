'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { anchors, fed3, frameUrl, stations, type Locale, type Station } from '@/lib/fed3/config';
import type { Messages } from '@/lib/fed3/messages';
import { useFrameSequence } from '@/hooks/useFrameSequence';
import { readSavedProgress, useScrollSequence } from '@/hooks/useScrollSequence';
import { frameAt, journeyStationAt } from '@/lib/fed3/sequence';
import { GsapCdnProvider, useGsap } from './GsapCdnProvider';
import { SequenceCanvas, type CanvasHandle } from './SequenceCanvas';
import { SequencePreloader } from './SequencePreloader';
import { InitiativeIntro } from './InitiativeIntro';
import { Arrow, InlineText, StationContent } from './StationContent';
import styles from './landing.module.css';

type Mode = 'pending' | 'animated' | 'simple';
function AnchorImage({ blob, frame, alt, unavailable }: { blob?: Blob; frame: number; alt: string; unavailable: string }) {
  const [url, setUrl] = useState<string>();
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!blob) return;
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl); setError(false);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);
  return <div className={styles.anchorImage}>
    {url && !error && <Image src={url} width={1600} height={900} alt={alt} unoptimized onError={() => setError(true)} />}
    {error && <p>{unavailable}</p>}
    <noscript><img src={frameUrl(frame)} width="1600" height="900" alt={alt} loading="lazy" /></noscript>
  </div>;
}

export function ScrollExperience({ locale, messages }: { locale: Locale; messages: Messages }) {
  const [mode, setMode] = useState<Mode>('pending');
  const [mobile, setMobile] = useState(false);
  const [initialProgress, setInitialProgress] = useState(0);
  useEffect(() => {
    setInitialProgress(readSavedProgress() ?? 0);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const small = matchMedia('(max-width: 800px)');
    const choose = () => {
      setMobile(small.matches);
      let simple = false;
      try { simple = sessionStorage.getItem('fed3-mode') === 'simple'; } catch { /* Optional preference. */ }
      setMode(current => reduced.matches || simple ? 'simple' : current === 'pending' ? 'animated' : current);
    };
    choose();
    reduced.addEventListener('change', choose); small.addEventListener('change', choose);
    let resizeTimer: ReturnType<typeof setTimeout>;
    const resize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(choose, 150); };
    window.addEventListener('resize', resize);
    return () => { clearTimeout(resizeTimer); window.removeEventListener('resize', resize); reduced.removeEventListener('change', choose); small.removeEventListener('change', choose); };
  }, []);
  const changeMode = useCallback((next: Mode) => {
    setMode(next);
    try { sessionStorage.setItem('fed3-mode', next); } catch { /* Optional preference. */ }
  }, []);
  useEffect(() => {
    let userSelected: string | null = null;
    try {
      userSelected = localStorage.getItem('fed3-locale');
    } catch { /* storage restricted */ }
    if (!userSelected && typeof navigator !== 'undefined') {
      const browserLang = (navigator.languages?.[0] || navigator.language || '').toLowerCase();
      const detectedLocale: Locale = browserLang.startsWith('ar') ? 'ar' : 'en';
      if (detectedLocale !== locale) {
        window.location.replace(`/${detectedLocale}/`);
      }
    }
  }, [locale]);
  return <GsapCdnProvider enabled={mode === 'animated'}><Experience locale={locale} messages={messages} mode={mode} changeMode={changeMode} mobile={mobile} initialProgress={initialProgress} /></GsapCdnProvider>;
}

function Experience({ locale, messages, mode, changeMode, mobile, initialProgress }: {
  locale: Locale; messages: Messages; mode: Mode; changeMode: (mode: Mode) => void; mobile: boolean; initialProgress: number;
}) {
  const stage = useRef<HTMLElement>(null);
  const canvas = useRef<CanvasHandle>(null);
  const [painted, setPainted] = useState(false);
  const [paintedAnchor, setPaintedAnchor] = useState<number | null>(null);
  const [decodeError, setDecodeError] = useState(false);
  const [notice, setNotice] = useState(false);
  const [menu, setMenu] = useState(false);
  const [entered, setEntered] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const finishOpening = useCallback(() => setEntered(true), []);
  useEffect(() => {
    if (mode === 'simple') setEntered(true);
  }, [mode]);
  useEffect(() => {
    const update = () => { setScrolled(window.scrollY > 60); };
    update(); window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  const { resources, snapshot } = useFrameSequence(mode, mobile);
  const { ready: scriptsReady, error: scriptError } = useGsap();
  const requestedAnimation = mode === 'animated';
  // A failed download exposes all semantic content immediately while the remaining
  // bounded downloads finish. The retry tray remains available until dismissed.
  const settled = snapshot.completed + snapshot.failed.length === 240;
  const animated = requestedAnimation && !snapshot.manifestError && !(settled && snapshot.completed === 0);
  const sequence = useScrollSequence({ enabled: animated && scriptsReady && painted && settled && !decodeError, stage, canvas, locale, mobile, openingComplete: entered });
  const markPainted = useCallback(() => setPainted(true), []);
  const markError = useCallback(() => setDecodeError(true), []);
  const markAnchor = useCallback((frame: number | null) => setPaintedAnchor(frame), []);
  const candidateStation = sequence.ready ? sequence.active : journeyStationAt(initialProgress);
  const visibleStation = candidateStation !== 'intro' ? candidateStation : null;
  const simplify = useCallback(() => {
    const station = sequence.active || 'intro';
    try { sessionStorage.setItem('fed3-simple-station', station); } catch { /* Optional restoration. */ }
    changeMode('simple');
  }, [changeMode, sequence.active]);
  useEffect(() => {
    if (!animated || (!scriptError && !decodeError && !sequence.error)) return;
    setNotice(true); changeMode('simple');
  }, [scriptError, decodeError, sequence.error, animated, changeMode]);
  useEffect(() => {
    if (mode !== 'simple') return;
    let id = '';
    try { id = sessionStorage.getItem('fed3-simple-station') || ''; sessionStorage.removeItem('fed3-simple-station'); } catch { /* Optional restoration. */ }
    if (!stations.includes(id as Station)) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' });
      document.getElementById(`${id}-heading`)?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [mode]);
  useEffect(() => {
    if (!animated) return;
    const focused = document.activeElement;
    const panel = focused?.closest('[data-station]');
    if (panel && panel.getAttribute('data-station') !== visibleStation) stage.current?.focus({ preventScroll: true });
  }, [animated, visibleStation]);
  const navigate = (station: Station) => {
    setMenu(false);
    if (animated && !sequence.ready) {
      try { sessionStorage.setItem('fed3-simple-station', station); } catch { /* Optional restoration. */ }
      changeMode('simple');
    } else if (animated) sequence.navigate(station);
    else document.getElementById(station)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  const savePosition = () => {
    if (animated) sequence.save();
    else {
      let nearest: Station = 'intro', distance = Infinity;
      for (const station of stations) {
        const rect = document.getElementById(station)?.getBoundingClientRect();
        if (rect && Math.abs(rect.top) < distance) { nearest = station; distance = Math.abs(rect.top); }
      }
      try { sessionStorage.setItem('fed3-simple-station', nearest); } catch { /* Optional restoration. */ }
    }
  };
  const other = locale === 'ar' ? 'en' : 'ar';
  const switchLocale = () => {
    if (window.scrollY > 80) {
      savePosition();
    } else {
      try { sessionStorage.removeItem(`fed3-progress-${fed3.assetVersion}`); } catch { /* Storage is optional. */ }
    }
    try { localStorage.setItem('fed3-locale', other); } catch { /* Cookie still works when localStorage is blocked. */ }
    document.cookie = `fed3-locale=${other}; Path=/; Max-Age=31536000; SameSite=Lax`;
  };
  const backTop = () => { if (window.fed3Lenis) window.fed3Lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); };
  const navStations = ['alternatives', 'home-cloud', 'communities'] as const;
  return <div className={styles.experience} data-mode={mode} data-entered={entered}>
    <a href="#main" className={styles.skip} onClick={animated ? event => { event.preventDefault(); simplify(); } : undefined}>{messages.skip}</a>
    <header className={`${styles.header} ${styles.homeHeader} ${styles.headerVisible}`} data-floating={scrolled}>
      <Link className={styles.brand} href={fed3.routes[locale].home} aria-label={messages.brand} onClick={event => { event.preventDefault(); backTop(); }}>
        <Image src="/fed3-logo.svg" width={52} height={34} alt="" priority />
        <span className={styles.wordmark} dir="ltr">Fed3<span className={styles.brandDot}>.</span></span>
        <span className={styles.brandCaption}>{messages.initiative}</span>
      </Link>
      <button className={styles.menuToggle} aria-expanded={menu} aria-controls="main-navigation" onClick={() => setMenu(!menu)} aria-label={messages.menu}><span /><span /></button>
      <nav id="main-navigation" className={`${styles.navigation} ${menu ? styles.menuOpen : ''}`} aria-label={messages.menu}>
        {navStations.map((s, i) => <a key={s} href={`#${s}`} className={styles.navItem} aria-current={sequence.active === s && animated ? 'location' : undefined} onClick={e => { e.preventDefault(); navigate(s); }}>
          <span className={styles.navBadge} aria-hidden="true">0{i + 1}</span>
          <span className={styles.navLabel}><InlineText text={messages.nav[s]} /></span>
        </a>)}
        {animated && <button className={styles.mobileSimplify} onClick={simplify}>{messages.simplified}</button>}
      </nav>
      <div className={styles.headerActions}>
      <Link href={fed3.routes[other].home} scroll={false} className={styles.language} lang={other} dir={other === 'ar' ? 'rtl' : 'ltr'} aria-label={messages.languageLabel} onClick={switchLocale}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.3" /><path d="M3.7 12h16.6M12 3.7c4 4.3 4 12.3 0 16.6-4-4.3-4-12.3 0-16.6Z" /></svg>{messages.language}
      </Link>
      </div>
    </header>
    <main id="main">
      <InitiativeIntro locale={locale} messages={messages} ready={entered} explore={station => navigate(station ?? 'alternatives')} />
      {notice && <p className={styles.notice} role="status">{messages.scriptError}</p>}
      <section ref={stage} className={`${styles.stage} ${animated ? styles.animatedStage : styles.staticStage}`} tabIndex={-1} aria-label={messages.stage}>
        <div className={styles.stageTitle}><div><span>{locale === 'ar' ? 'رحلة من ثلاث محطات' : 'A JOURNEY IN THREE CHAPTERS'}</span><p>{locale === 'ar' ? 'اختَر أداتك، تحكّم بمساحتك، وشارك المعرفة.' : 'Choose your tools, control your space, share what you learn.'}</p></div><span dir="ltr">0{visibleStation === 'home-cloud' ? 2 : visibleStation === 'communities' || visibleStation === 'closing' ? 3 : 1} <i /> 03</span></div>
        {animated && <div className={styles.visual}><SequenceCanvas ref={canvas} resources={resources} revision={snapshot.revision} mobile={mobile} initialFrame={frameAt(initialProgress)} label={messages.stage} onPaint={markPainted} onError={markError} onAnchor={markAnchor} /></div>}
        <div className={styles.panels}>
          {stations.filter(station => station !== 'intro').map((station) => <section key={station} id={station} data-station={station}
            className={`${styles.panel} ${animated ? styles.overlayPanel : styles.flowPanel}`}
            hidden={animated && visibleStation !== station} aria-labelledby={`${station}-heading`}>
            {!animated && <AnchorImage blob={resources.getBlob(anchors[stations.indexOf(station)])} frame={anchors[stations.indexOf(station)]} alt={messages.stations[station].image} unavailable={messages.unavailable} />}
            <StationContent station={station} locale={locale} messages={messages} onExplore={() => navigate('alternatives')} onLeave={savePosition} />
          </section>)}
        </div>
        {animated && <div className={styles.stageBottom}>
          <span className={styles.scrollHint}><span className={styles.mouse} aria-hidden="true" />{locale === 'ar' ? 'تابع التمرير للمحطة التالية' : 'Keep scrolling to the next chapter'}<Arrow down /></span>
          <nav className={styles.stationNav} aria-label={messages.journey}>
            {navStations.map((s, i) => <a key={s} href={`#${s}`} className={sequence.active === s || (s === 'communities' && sequence.active === 'closing') ? styles.currentStation : ''} onClick={e => { e.preventDefault(); navigate(s); }} aria-label={messages.nav[s]} aria-current={sequence.active === s || (s === 'communities' && sequence.active === 'closing') ? 'step' : undefined}><bdi>0{i + 1}</bdi><span>{locale === 'ar' ? ['اختَر أداتك', 'امتلك مساحتك', 'شارك المعرفة'][i] : ['Choose your tools', 'Own your space', 'Share knowledge'][i]}</span></a>)}
          </nav>
          <button className={styles.simpleToggle} onClick={simplify}>{messages.simplified}</button>
          <div className={styles.journeyLine} aria-hidden="true"><span /></div>
        </div>}
      </section>
    </main>
    <footer className={styles.footer}>
      <div className={styles.footerInvitation}><span>{locale === 'ar' ? 'ابدأ من هون' : 'MAKE IT YOURS'}</span><h2>{locale === 'ar' ? 'خلّي القرار بإيدك.' : 'Keep the choice yours.'}</h2><Link href={fed3.routes[locale].alternatives}>{messages.stations.alternatives.action}<span aria-hidden="true">↗</span></Link></div>
      <div className={styles.footerMain}><div><Link href={fed3.routes[locale].home} className={styles.footerBrand}><Image src="/fed3-logo.svg" width={53} height={34} alt="" /><bdi dir="ltr">Fed3</bdi></Link><p>{messages.initiative}</p></div><p className={styles.footerStatement}>{messages.footer}</p></div>
      <div className={styles.socialLinks}><span>{locale === 'ar' ? 'منصاتنا' : 'FIND OUR COMMUNITY'}</span>{['Instagram', 'Signal', 'Proton Mail'].map(name => <Link key={name} href={fed3.routes[locale].contact}><span dir="ltr">{name}</span><small>{locale === 'ar' ? 'قريبًا' : 'Coming soon'}</small><span aria-hidden="true">↗</span></Link>)}</div>
      <div className={styles.footerBottom}><small><bdi>© {new Date().getFullYear()} Fed3.</bdi> {locale === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</small><nav aria-label={messages.menu}><Link href={fed3.routes[locale].about} onClick={savePosition}>{messages.nav.about}</Link><Link href={fed3.routes[locale].privacy} onClick={savePosition}>{messages.privacy}</Link><Link href={fed3.routes[locale].contact} onClick={savePosition}>{messages.contact}</Link></nav><button onClick={backTop}>{messages.top}<span aria-hidden="true">↑</span></button></div>
    </footer>
    {requestedAnimation && <SequencePreloader snapshot={snapshot} ready={(settled && (!animated || (scriptsReady && !decodeError))) || sequence.ready} messages={messages} retry={resources.retry} simplify={simplify} onComplete={finishOpening} />}
  </div>;
}
