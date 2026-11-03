'use client';
import Script from 'next/script';
import { createContext, useContext, useEffect, useState } from 'react';

const GsapContext = createContext({ ready: false, error: false });
export const useGsap = () => useContext(GsapContext);
export function GsapCdnProvider({ enabled, children }: { enabled: boolean; children: React.ReactNode }) {
  const [core, setCore] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [lenisReady, setLenisReady] = useState(false);
  useEffect(() => {
    if (!enabled || !ready || !lenisReady || !window.Lenis || !window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new window.Lenis({ duration: .85, smoothWheel: true, syncTouch: false });
    window.fed3Lenis = lenis;
    const tick = (time: number) => lenis.raf(time * 1000);
    lenis.on('scroll', () => window.ScrollTrigger?.update());
    window.gsap.ticker.add(tick);
    return () => { window.gsap?.ticker.remove(tick); lenis.destroy(); delete window.fed3Lenis; };
  }, [enabled, ready, lenisReady]);
  useEffect(() => {
    if (!enabled || ready) return;
    const timer = setTimeout(() => setError(true), 20_000);
    return () => clearTimeout(timer);
  }, [enabled, ready]);
  return <GsapContext.Provider value={{ ready, error }}>
    {children}
    {enabled && <Script id="fed3-lenis" src="/vendor/lenis.min.js" strategy="afterInteractive" onReady={() => setLenisReady(true)} />}
    {enabled && <Script id="fed3-gsap" src="/vendor/gsap.min.js" strategy="afterInteractive"
      onReady={() => { if (window.gsap) setCore(true); else setError(true); }} onError={() => setError(true)} />}
    {enabled && core && <Script id="fed3-scrolltrigger" src="/vendor/ScrollTrigger.min.js" strategy="afterInteractive"
      onReady={() => {
        if (window.gsap && window.ScrollTrigger) { window.gsap.registerPlugin(window.ScrollTrigger); setReady(true); setError(false); }
        else setError(true);
      }} onError={() => setError(true)} />}
  </GsapContext.Provider>;
}
