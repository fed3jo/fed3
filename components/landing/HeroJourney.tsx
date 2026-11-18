'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Locale } from '@/lib/fed3/config';
import { hasConstrainedConnection } from '@/lib/fed3/network';
import { heroJourneyVideo, type IntroVideoSource } from '@/lib/fed3/videos';
import styles from './home-intro.module.css';

export function HeroJourney({ locale, clipId, media = heroJourneyVideo, label, reduceMotion = false }: { locale: Locale; clipId: string; media?: IntroVideoSource; label?: string; reduceMotion?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [compact, setCompact] = useState(true);
  const [reduced, setReduced] = useState(true);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const ar = locale === 'ar';
  const source = compact ? media.mobileSrc : media.src;
  const description = label ?? (ar ? 'البدائل الرقمية والسحابة المحلية ومشاركة المعرفة' : 'Digital alternatives, local cloud and sharing knowledge');
  const shouldPlay = inView && pageVisible && !scrolling && !failed && !reduced && !reduceMotion;

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let settleTimer = 0;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreferences = () => {
      setCompact(innerWidth <= 900);
      setReduced(motion.matches || hasConstrainedConnection());
    };
    const syncVisibility = () => setPageVisible(!document.hidden);
    const onScroll = () => {
      video.current?.pause();
      setScrolling(true);
      clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => setScrolling(false), 180);
    };
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting && entry.intersectionRatio >= .2);
    }, { threshold: [0, .2], rootMargin: '-95px 0px 0px 0px' });
    observer.observe(element);
    syncPreferences();
    syncVisibility();
    motion.addEventListener('change', syncPreferences);
    window.addEventListener('resize', syncPreferences);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onScroll, { passive: true });
    window.addEventListener('touchmove', onScroll, { passive: true });
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      clearTimeout(settleTimer);
      observer.disconnect();
      motion.removeEventListener('change', syncPreferences);
      window.removeEventListener('resize', syncPreferences);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onScroll);
      window.removeEventListener('touchmove', onScroll);
      document.removeEventListener('visibilitychange', syncVisibility);
    };
  }, []);

  useEffect(() => {
    if (!shouldPlay) { video.current?.pause(); return; }
    if (!loaded) { setLoaded(true); return; }
    const element = video.current;
    if (element) {
      element.muted = true;
      void element.play().catch(() => { /* Keep the poster if the browser blocks autoplay. */ });
    }
  }, [shouldPlay, loaded, source]);

  return <div className={styles.journeyClip} style={{ '--journey-clip': `url(#${clipId})`, '--journey-mobile-clip': `url(#${clipId}-mobile)` } as CSSProperties}>
    <div ref={root} className={styles.journeyVisual} data-hero-journey data-state={scrolling ? 'scrolling' : playing ? 'playing' : 'paused'}>
      {failed ? <img className={styles.journeyVideo} src={media.poster} width={1280} height={720} alt={description} />
        : <video ref={video} className={styles.journeyVideo} src={loaded ? source : undefined} poster={media.poster} width={1280} height={720} muted loop playsInline preload="none"
          aria-label={description}
          onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { setFailed(true); setPlaying(false); }} />}
    </div>
  </div>;
}
