import { fed3 } from './config';
import type { FrameResources } from './resources';

type Decoded = { image: CanvasImageSource; bytes: number; dispose: () => void };
/** One bounded cache per canvas. Pending work is capped as well as retained images. */
export class FrameDecoder {
  private cache = new Map<number, Decoded>();
  private pending = new Set<number>();
  private queue: number[] = [];
  private alive = true;
  private generation = 0;
  private target = 1;
  private bytes = 0;
  private width = 0;
  private abortImages = new Set<() => void>();
  private settings;
  private direction = 1;
  constructor(private resources: FrameResources, mobile: boolean, private onReady: () => void, private onError: () => void) {
    this.settings = mobile ? fed3.mobile : fed3.desktop;
  }
  resize(width: number) {
    const target = Math.max(16, Math.min(this.settings.width, Math.round(width / 16) * 16));
    if (this.width === target) return;
    this.width = target;
    this.generation++;
    this.cache.forEach(d => d.dispose()); this.cache.clear(); this.bytes = 0;
    this.queue = [];
  }
  get(n: number) {
    const d = this.cache.get(n);
    if (d) { this.cache.delete(n); this.cache.set(n, d); }
    return d?.image;
  }
  nearest(n: number) {
    const keys = [...this.cache.keys()];
    const closest = keys.sort((a, b) => Math.abs(a - n) - Math.abs(b - n))[0];
    return closest === undefined ? undefined : { frame: closest, image: this.get(closest)! };
  }
  request(n: number, direction = 1) {
    this.target = n;
    this.direction = direction;
    // Replace obsolete queued targets after fast scrolls. Already-running decodes are bounded to two.
    const ahead = this.settings.frames - 4;
    this.queue = [n, ...Array.from({ length: ahead }, (_, i) => n + (i + 1) * direction), n - direction, n - 2 * direction]
      .filter(i => i >= 1 && i <= 240 && !this.cache.has(i) && !this.pending.has(i) && this.resources.getBlob(i));
    this.pump();
  }
  private pump() {
    while (this.alive && this.pending.size < fed3.decodeConcurrency && this.queue.length) {
      const n = this.queue.shift()!;
      this.pending.add(n);
      void this.decode(n);
    }
  }
  private async decode(n: number) {
    const generation = this.generation;
    const width = this.width || this.settings.width;
    const height = Math.round(width * 9 / 16);
    let decoded: Decoded | undefined;
    try {
      const blob = this.resources.getBlob(n)!;
      if (typeof createImageBitmap === 'function') {
        try {
          const bitmap = await createImageBitmap(blob, { resizeWidth: width, resizeHeight: height, resizeQuality: 'medium' });
          decoded = { image: bitmap, bytes: bitmap.width * bitmap.height * 4, dispose: () => bitmap.close() };
        } catch { /* Some browsers expose ImageBitmap without resize/decode support. */ }
      }
      if (!this.alive || generation !== this.generation) { decoded?.dispose(); return; }
      if (!decoded) decoded = await this.decodeElement(blob);
      if (!this.alive || generation !== this.generation) { decoded.dispose(); return; }
      this.cache.set(n, decoded); this.bytes += decoded.bytes;
      // Reserve room for pending full-size fallback images within the same byte budget.
      const reserve = this.pending.size * fed3.source.width * fed3.source.height * 4;
      while (this.cache.size > this.settings.frames - this.pending.size || this.bytes > this.settings.bytes - reserve) {
        const oldest = [...this.cache.keys()].filter(k => k !== this.target && k !== n)
          .sort((a, b) => this.distance(b) - this.distance(a))[0];
        if (oldest === undefined) break;
        const item = this.cache.get(oldest)!;
        item.dispose(); this.bytes -= item.bytes; this.cache.delete(oldest);
      }
      this.onReady();
    } catch { if (this.alive && generation === this.generation && n === this.target) this.onError(); }
    finally { this.pending.delete(n); this.pump(); }
  }
  private distance(frame: number) {
    const offset = (frame - this.target) * this.direction;
    return Math.abs(offset) + (offset < -2 ? this.settings.frames : 0);
  }
  private async decodeElement(blob: Blob): Promise<Decoded> {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    let cancel!: () => void;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const cancelled = new Promise<never>((_, reject) => {
        cancel = () => { img.src = ''; reject(new Error('Decode cancelled')); };
        this.abortImages.add(cancel);
        timer = setTimeout(cancel, 10_000);
      });
      img.src = url;
      await Promise.race([img.decode(), cancelled]);
      URL.revokeObjectURL(url);
      return { image: img, bytes: img.naturalWidth * img.naturalHeight * 4, dispose: () => { img.src = ''; } };
    } catch (error) { URL.revokeObjectURL(url); img.src = ''; throw error; }
    finally { clearTimeout(timer); this.abortImages.delete(cancel); }
  }
  destroy() {
    this.alive = false; this.generation++; this.queue = [];
    this.abortImages.forEach(fn => fn()); this.abortImages.clear();
    this.cache.forEach(d => d.dispose()); this.cache.clear(); this.bytes = 0;
  }
}
