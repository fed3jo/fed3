'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

export function SmoothScrolling({ enabled }: { enabled: boolean }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!enabled || !ready || !window.Lenis) return;
    const lenis = new window.Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false, autoRaf: true });
    window.fed3Lenis = lenis;
    return () => {
      lenis.destroy();
      if (window.fed3Lenis === lenis) delete window.fed3Lenis;
    };
  }, [enabled, ready]);
  return enabled ? <Script id="fed3-alternatives-lenis" src="/vendor/lenis.min.js" strategy="afterInteractive" onReady={() => setReady(true)} /> : null;
}
