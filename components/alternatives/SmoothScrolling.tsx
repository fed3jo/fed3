'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

export function SmoothScrolling({ enabled, defer = false }: { enabled: boolean; defer?: boolean }) {
  const [ready, setReady] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setMotionAllowed(!query.matches);
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!enabled || !motionAllowed || !ready || !window.Lenis) return;
    const lenis = new window.Lenis({ duration: .95, smoothWheel: true, syncTouch: false, autoRaf: true });
    window.fed3Lenis = lenis;
    return () => {
      lenis.destroy();
      if (window.fed3Lenis === lenis) delete window.fed3Lenis;
    };
  }, [enabled, motionAllowed, ready]);
  return enabled && motionAllowed ? <Script id="fed3-alternatives-lenis" src="/vendor/lenis.min.js" strategy={defer ? 'lazyOnload' : 'afterInteractive'} onReady={() => setReady(true)} /> : null;
}
