import { anchors, fed3, frameUrl } from './config';

type FrameInfo = { index: number; file: string; bytes: number; sha256: string };
type Manifest = { frame_count: number; width: number; height: number; frames: FrameInfo[] };
export type ResourceSnapshot = { completed: number; failed: number[]; manifestError: boolean; revision: number };
export const emptySnapshot: ResourceSnapshot = { completed: 0, failed: [], manifestError: false, revision: 0 };
type Lease = { all: boolean; mobile: boolean };

/** Compressed resources survive locale navigation. No browser work runs at import time. */
export class FrameResources {
  readonly blobs = new Map<number, Blob>();
  private inflight = new Map<number, AbortController>();
  private failed = new Set<number>();
  private listeners = new Set<() => void>();
  private leases = new Map<symbol, Lease>();
  private manifest?: Manifest;
  private manifestTask?: Promise<void>;
  private manifestController?: AbortController;
  private manifestError = false;
  private releaseTimer?: ReturnType<typeof setTimeout>;
  private snapshot = emptySnapshot;

  getSnapshot = () => this.snapshot;
  getBlob(n: number) {
    const exact = this.blobs.get(n);
    if (exact || !this.failed.has(n)) return exact;
    const nearest = [...this.blobs.keys()].sort((a, b) => Math.abs(a - n) - Math.abs(b - n))[0];
    return nearest === undefined ? undefined : this.blobs.get(nearest);
  }
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private emit() {
    this.snapshot = { completed: this.blobs.size, failed: [...this.failed], manifestError: this.manifestError, revision: this.snapshot.revision + 1 };
    this.listeners.forEach(fn => fn());
  }
  acquire(all: boolean, mobile: boolean) {
    clearTimeout(this.releaseTimer);
    const id = Symbol();
    this.leases.set(id, { all, mobile });
    void this.start();
    return () => {
      this.leases.delete(id);
      // A short grace period lets Strict Mode and client route remounts share in-flight requests.
      this.releaseTimer = setTimeout(() => {
        if (!this.leases.size) {
          this.manifestController?.abort();
          this.inflight.forEach(controller => controller.abort());
        } else this.cancelUnneeded();
      }, 150);
    };
  }
  private cancelUnneeded() {
    if (![...this.leases.values()].some(l => l.all)) {
      this.inflight.forEach((c, n) => { if (!(anchors as readonly number[]).includes(n)) c.abort(); });
    }
  }
  retry = () => {
    this.failed.clear();
    this.manifestError = false;
    this.emit();
    void this.start();
  };
  private async start() {
    if (!this.leases.size) return;
    if (!this.manifest && !this.manifestError) {
      this.manifestTask ??= this.readManifest().finally(() => { this.manifestTask = undefined; });
      await this.manifestTask;
      if (!this.manifest && !this.manifestError && this.leases.size) { void this.start(); return; }
    }
    this.pump();
  }
  private async readManifest() {
    const controller = new AbortController();
    this.manifestController = controller;
    try {
      const response = await this.request(fed3.MANIFEST_URL, controller.signal);
      const data = JSON.parse(await response.text()) as Manifest;
      if (data.frame_count !== 240 || data.width !== 1600 || data.height !== 900 || data.frames?.length !== 240 ||
        data.frames.some((f, i) => f.index !== i + 1 || f.file !== `frame_${String(i + 1).padStart(5, '0')}.png` || !f.bytes || !/^[a-f\d]{64}$/.test(f.sha256))) {
        throw new Error('Invalid sequence manifest');
      }
      this.manifest = data;
    } catch {
      if (!controller.signal.aborted) this.manifestError = true;
    } finally { this.manifestController = undefined; this.emit(); }
  }
  private async request(url: string, signal: AbortSignal, revalidate = false): Promise<Blob> {
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
      const timeout = new AbortController();
      const cancel = () => timeout.abort();
      signal.addEventListener('abort', cancel, { once: true });
      const timer = setTimeout(cancel, 12_000);
      try {
        const response = await fetch(url, { signal: timeout.signal, mode: 'cors', credentials: 'omit', cache: revalidate || attempt ? 'reload' : 'default' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.blob();
      } catch (error) { lastError = error; }
      finally { clearTimeout(timer); signal.removeEventListener('abort', cancel); }
    }
    throw lastError;
  }
  private pump() {
    if (!this.manifest || !this.leases.size) return;
    const leases = [...this.leases.values()];
    const all = leases.some(l => l.all);
    const limit = leases.every(l => l.mobile) ? fed3.mobile.downloads : fed3.desktop.downloads;
    const order: number[] = [...anchors];
    if (all) for (let n = 1; n <= 240; n++) if (!order.includes(n)) order.push(n);
    for (const n of order) {
      if (this.inflight.size >= limit) break;
      if (this.blobs.has(n) || this.failed.has(n) || this.inflight.has(n)) continue;
      const controller = new AbortController();
      this.inflight.set(n, controller);
      void this.load(n, controller);
    }
  }
  private async load(n: number, controller: AbortController) {
    const info = this.manifest!.frames[n - 1];
    try {
      // Verify integrity without decoding 240 full-size images. Invalid data never counts as ready.
      for (let attempt = 0; attempt < 2; attempt++) {
        const blob = await this.request(frameUrl(n), controller.signal, attempt > 0);
        if (controller.signal.aborted) return;
        let valid = blob.size === info.bytes && blob.type.split(';')[0] === 'image/png';
        if (valid) {
          const buffer = await blob.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          valid = bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71 &&
            String.fromCharCode(...bytes.slice(-8, -4)) === 'IEND';
          if (valid && globalThis.crypto?.subtle) {
            const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', buffer));
            valid = [...digest].map(v => v.toString(16).padStart(2, '0')).join('') === info.sha256;
          }
        }
        if (controller.signal.aborted) return;
        if (valid) { this.blobs.set(n, blob); return; }
      }
      throw new Error(`Invalid PNG: ${n}`);
    } catch { if (!controller.signal.aborted) this.failed.add(n); }
    finally { this.inflight.delete(n); this.emit(); this.pump(); }
  }
}

const managers = new Map<string, FrameResources>();
export function getFrameResources() {
  const key = `${fed3.assetVersion}:${fed3.FRAME_BASE_URL}`;
  if (!managers.has(key)) managers.set(key, new FrameResources());
  return managers.get(key)!;
}
