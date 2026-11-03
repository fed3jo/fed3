'use client';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { fed3, holds, type Locale, type Station } from '@/lib/fed3/config';
import { scrollMap, journeyStationAt, clampProgress } from '@/lib/fed3/sequence';
import type { CanvasHandle } from '@/components/landing/SequenceCanvas';

const progressKey = `fed3-progress-${fed3.assetVersion}`;
function restoreScroll(top: number) {
  if (window.fed3Lenis) { window.fed3Lenis.resize(); window.fed3Lenis.scrollTo(top, { immediate: true, force: true }); }
  else window.scrollTo({ top, behavior: 'instant' });
}
export function rememberProgress(progress: number, station: Station | null) {
  try { sessionStorage.setItem(progressKey, JSON.stringify({ progress, station, time: Date.now() })); } catch { /* Storage is optional. */ }
}
export function readSavedProgress(consume = false) {
  try {
    const saved = sessionStorage.getItem(progressKey);
    if (consume) sessionStorage.removeItem(progressKey);
    const value = saved ? JSON.parse(saved) : null;
    if (value && Date.now() - value.time < 120_000 && Number.isFinite(value.progress)) return clampProgress(value.progress);
  } catch { /* A direct visit starts at the intro. */ }
  return null;
}
export function useScrollSequence({ enabled, stage, canvas, locale, mobile, openingComplete }: {
  enabled: boolean; stage: RefObject<HTMLElement | null>; canvas: RefObject<CanvasHandle | null>; locale: Locale; mobile: boolean; openingComplete: boolean;
}) {
  const timeline = useRef<Fed3Timeline | null>(null);
  const playhead = useRef({ frame: 1 });
  const progress = useRef(0);
  const activeRef = useRef<Station | null>('alternatives');
  const [active, setActive] = useState<Station | null>('alternatives');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const pendingNavigation = useRef<Station | null>(null);
  const pendingRestore = useRef<number | null>(null);
  useEffect(() => {
    if (!enabled || !stage.current || !window.gsap || !window.ScrollTrigger) return;
    let alive = true;
    let context: { revert(): void } | undefined;
    let layoutFrame = 0;
    const gsap = window.gsap, plugin = window.ScrollTrigger, element = stage.current;
    const setup = () => {
      if (!alive) return;
      try {
        context = gsap.context(() => {
          const tl = gsap.timeline({ defaults: { ease: 'none' },
            onUpdate: () => {
              if (!alive) return;
              progress.current = tl.progress();
              canvas.current?.request(playhead.current.frame);
              const station = journeyStationAt(progress.current);
              if (station !== activeRef.current) { activeRef.current = station; setActive(station); }
              element.style.setProperty('--journey-progress', String(progress.current));
            },
            scrollTrigger: { id: 'fed3-sequence', trigger: element, start: 'top top', end: () => `+=${window.innerHeight * (mobile ? fed3.scrollViewports.mobile : fed3.scrollViewports.desktop)}`,
              pin: true, pinSpacing: true, scrub: .28, anticipatePin: 1, invalidateOnRefresh: true },
          });
          for (const segment of scrollMap) {
            tl.set(playhead.current, { frame: segment.from }, segment.start);
            tl.to(playhead.current, { frame: segment.to, duration: segment.end - segment.start, ease: 'none' }, segment.start);
          }
          tl.addLabel('alternatives', holds.alternatives).addLabel('home-cloud', holds['home-cloud']).addLabel('communities', holds.communities);
          timeline.current = tl;
        }, element);
        plugin.refresh();
        const saved = readSavedProgress(true);
        const hash = window.location.hash.slice(1) as Station;
        const initial = pendingNavigation.current ? holds[pendingNavigation.current] : saved ?? (hash in holds ? holds[hash] : null);
        pendingRestore.current = initial;
        if (initial !== null && timeline.current?.scrollTrigger) {
          const trigger = timeline.current.scrollTrigger;
          restoreScroll(trigger.start + initial * (trigger.end - trigger.start));
          timeline.current.progress(initial); plugin.update();
        }
        pendingNavigation.current = null;
        setReady(true);
      } catch { context?.revert(); setError(true); }
    };
    // Fonts and one browser layout pass must settle before pin measurements.
    void document.fonts.ready.then(() => { if (alive) layoutFrame = requestAnimationFrame(setup); });
    return () => { alive = false; cancelAnimationFrame(layoutFrame); context?.revert(); timeline.current = null; setReady(false); };
  }, [enabled, mobile, stage, canvas]);
  useEffect(() => {
    if (!ready || !openingComplete || pendingRestore.current === null) return;
    const frame = requestAnimationFrame(() => {
      const target = pendingRestore.current;
      if (target === null) return;
      window.ScrollTrigger?.refresh();
      const trigger = timeline.current?.scrollTrigger;
      if (!trigger) return;
      restoreScroll(trigger.start + target * (trigger.end - trigger.start));
      timeline.current?.progress(target); window.ScrollTrigger?.update();
      pendingRestore.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [ready, openingComplete]);
  useEffect(() => {
    if (!ready) return;
    const saved = progress.current;
    const id = requestAnimationFrame(() => {
      window.ScrollTrigger?.refresh();
      const trigger = timeline.current?.scrollTrigger;
      if (trigger && saved > 0) {
        restoreScroll(trigger.start + saved * (trigger.end - trigger.start));
        timeline.current?.progress(saved);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [locale, ready]);
  const navigate = useCallback((station: Station) => {
    const trigger = timeline.current?.scrollTrigger;
    if (trigger) {
      const top = trigger.start + holds[station] * (trigger.end - trigger.start);
      if (window.fed3Lenis) window.fed3Lenis.scrollTo(top, { duration: 1.4 });
      else window.scrollTo({ top, behavior: 'smooth' });
    } else {
      pendingNavigation.current = station;
      document.getElementById(station)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);
  const save = useCallback(() => rememberProgress(progress.current, activeRef.current), []);
  return { active, ready, error, navigate, save, progress };
}
