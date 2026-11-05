'use client';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/lib/fed3/config';
import type { StationVideoSource } from '@/lib/fed3/videos';
import { hasConstrainedConnection } from '@/lib/fed3/network';
import styles from './video-stations.module.css';

export function StationVideo({ source, locale, title }: { source: StationVideoSource; locale: Locale; title: string }) {
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const inStation = useRef(false);
  const [active, setActive] = useState(false);
  const [playbackSrc, setPlaybackSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const ar = locale === 'ar';

  useEffect(() => {
    const station = root.current?.closest('section');
    if (!source.src || !station) return;
    const sync = () => setActive(inStation.current && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inStation.current = entry.isIntersecting && entry.intersectionRatio >= .15;
      sync();
    }, { threshold: [0, .15], rootMargin: '-90px 0px 0px 0px' });
    observer.observe(station);
    document.addEventListener('visibilitychange', sync);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); };
  }, [source.src]);

  useEffect(() => {
    const element = video.current;
    if (!active || manuallyPaused || failed) { element?.pause(); return; }
    if (!playbackSrc) {
      setPlaybackSrc(source.mobileSrc && (innerWidth <= 800 || hasConstrainedConnection()) ? source.mobileSrc : source.src);
      return;
    }
    if (element) {
      element.muted = true;
      void element.play().catch((error: DOMException) => {
        if (error.name === 'NotAllowedError') setBlocked(true);
      });
    }
  }, [active, manuallyPaused, failed, playbackSrc, source.src, source.mobileSrc]);

  const resume = () => {
    setManuallyPaused(false);
    setBlocked(false);
    void video.current?.play().catch(() => setBlocked(true));
  };
  const pause = () => { setManuallyPaused(true); video.current?.pause(); };

  return <div ref={root} className={styles.media} data-station-video data-active={active}>
    {source.src ? <>
      {playbackSrc ? <video ref={video} src={playbackSrc} poster={source.poster} muted loop playsInline preload="none" aria-label={title} onError={() => { setPlaybackSrc(null); setFailed(true); }}>
        {source.captions?.map(track => <track key={track.language} kind="captions" src={track.src} srcLang={track.language} label={track.label} default={track.language === locale} />)}
        <a href={source.src}>{ar ? 'افتح الفيديو' : 'Open video'}</a>
      </video> : source.poster && <img className={styles.poster} src={source.poster} width={960} height={540} alt={title} loading="lazy" decoding="async" />}
      {failed ? <button type="button" className={styles.videoToggle} onClick={() => setFailed(false)}>{ar ? 'تعذّر التحميل. حاول مجدداً' : 'Loading failed. Try again'}</button>
        : playbackSrc && <button type="button" className={styles.videoToggle} onClick={manuallyPaused || blocked ? resume : pause} aria-label={manuallyPaused || blocked ? ar ? 'تشغيل الفيديو' : 'Play video' : ar ? 'إيقاف الفيديو مؤقتاً' : 'Pause video'}>
          <span aria-hidden="true">{manuallyPaused || blocked ? '▷' : 'Ⅱ'}</span>
          {blocked && <span>{ar ? 'تشغيل الفيديو' : 'Play video'}</span>}
        </button>}
    </> : <div className={styles.placeholder}>
      <span className={styles.play} aria-hidden="true">▷</span>
      <p>{ar ? 'فيديو المحطة' : 'Station video'}</p>
      <span>{title}</span>
      <small>{ar ? 'سيُضاف الفيديو قريباً.' : 'The video will be added soon.'}</small>
    </div>}
  </div>;
}
