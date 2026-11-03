'use client';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { FrameDecoder } from '@/lib/fed3/decoder';
import { fed3 } from '@/lib/fed3/config';
import type { FrameResources } from '@/lib/fed3/resources';
import styles from './landing.module.css';

export type CanvasHandle = { request: (frame: number) => void };
export const SequenceCanvas = forwardRef<CanvasHandle, {
  resources: FrameResources; revision: number; mobile: boolean; label: string; initialFrame: number; onPaint: () => void; onError: () => void; onAnchor: (frame: number | null) => void;
}>(function SequenceCanvas({ resources, revision, mobile, label, initialFrame, onPaint, onError, onAnchor }, ref) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const schedule = useRef<() => void>(() => {});
  const target = useRef(initialFrame);
  const direction = useRef(1);
  const callbacks = useRef({ onPaint, onError, onAnchor });
  useEffect(() => { callbacks.current = { onPaint, onError, onAnchor }; }, [onPaint, onError, onAnchor]);
  useImperativeHandle(ref, () => ({ request(n) {
    const next = Math.max(1, Math.min(240, Math.round(n)));
    direction.current = next >= target.current ? 1 : -1;
    target.current = next;
    schedule.current();
  } }), []);
  useEffect(() => {
    const node = canvas.current!;
    const ctx = node.getContext('2d', { alpha: false });
    if (!ctx) { callbacks.current.onError(); return; }
    let alive = true, visible = true, raf = 0, resizeTimer: ReturnType<typeof setTimeout> | undefined;
    let lastFrame = -1, lastWidth = 0, first = false, measuredWidth = 0, lastAnchor: number | null = null;
    let blend: HTMLCanvasElement | null = null, blendStarted = 0;
    const settings = mobile ? fed3.mobile : fed3.desktop;
    const draw = () => {
      raf = 0;
      if (!alive || document.hidden || !node.width) return;
      if (first && !visible) return;
      decoder.request(target.current, direction.current);
      const exact = decoder.get(target.current);
      const available = exact ? { image: exact, frame: target.current } : decoder.nearest(target.current);
      const windowReady = [0, 1, 2].every(offset => decoder.get(Math.min(240, target.current + offset)));
      if (available && !first && windowReady) { first = true; callbacks.current.onPaint(); }
      if (!available || (available.frame === lastFrame && node.width === lastWidth && !blend)) return;
      // A late decode must not pull the picture backwards during forward travel.
      if (node.width === lastWidth && (target.current - lastFrame) * direction.current >= 0 && (available.frame - lastFrame) * direction.current < 0) return;
      const crossesCut = (lastFrame <= 60 && available.frame > 60) || (available.frame <= 60 && lastFrame > 60);
      if (!blend && lastFrame > 0 && Math.abs(available.frame - lastFrame) < 35 && crossesCut && lastWidth === node.width) {
        const snapshot = document.createElement('canvas');
        snapshot.width = node.width; snapshot.height = node.height;
        const snapshotContext = snapshot.getContext('2d');
        if (snapshotContext) { snapshotContext.drawImage(node, 0, 0); blend = snapshot; blendStarted = performance.now(); }
      }
      ctx.drawImage(available.image, 0, 0, node.width, node.height);
      if (blend) {
        const amount = Math.min(1, (performance.now() - blendStarted) / 180);
        ctx.globalAlpha = 1 - amount * amount * (3 - 2 * amount);
        ctx.drawImage(blend, 0, 0, node.width, node.height);
        ctx.globalAlpha = 1;
        if (amount < 1) request();
        else { blend.width = 0; blend = null; }
      }
      lastFrame = available.frame; lastWidth = node.width;
      node.dataset.frame = String(lastFrame);
      const anchor = [1, 60, 120, 180, 240].includes(lastFrame) ? lastFrame : null;
      if (anchor !== lastAnchor) { lastAnchor = anchor; callbacks.current.onAnchor(anchor); }
    };
    const request = () => { if (alive && !raf && (!first || visible) && !document.hidden) raf = requestAnimationFrame(draw); };
    const decoder = new FrameDecoder(resources, mobile, request, () => callbacks.current.onError());
    schedule.current = request;
    const resize = () => {
      if (!alive) return;
      const width = Math.max(16, Math.min(settings.width, Math.round(measuredWidth * Math.min(devicePixelRatio || 1, settings.dpr))));
      const height = Math.round(width * 9 / 16);
      if (node.width !== width || node.height !== height) {
        if (blend) { blend.width = 0; blend = null; }
        node.width = width; node.height = height;
        // Paint the nearest retained image before replacing the decode size.
        const previous = decoder.nearest(target.current);
        if (previous) ctx.drawImage(previous.image, 0, 0, width, height);
        else { ctx.fillStyle = '#F2EFE9'; ctx.fillRect(0, 0, width, height); }
        decoder.resize(width); lastWidth = 0;
      }
      request();
    };
    const observer = new ResizeObserver(entries => {
      measuredWidth = entries[0].contentRect.width;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, first ? 120 : 0);
    });
    observer.observe(node);
    const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) request(); });
    intersection.observe(node);
    const visibility = () => { if (!document.hidden) request(); };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      alive = false; cancelAnimationFrame(raf); clearTimeout(resizeTimer);
      if (blend) blend.width = 0;
      observer.disconnect(); intersection.disconnect(); decoder.destroy();
      document.removeEventListener('visibilitychange', visibility);
      schedule.current = () => {};
    };
  }, [resources, mobile]);
  useEffect(() => { schedule.current(); }, [revision]);
  return <canvas ref={canvas} className={styles.canvas} role="img" aria-label={label} width={1600} height={900} />;
});
