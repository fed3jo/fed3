import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { frameAt, stationAt } from '../lib/fed3/sequence';
import { FrameResources } from '../lib/fed3/resources';
import { FrameDecoder } from '../lib/fed3/decoder';

test('manifest holds, discontinuities, reverse traversal and clamps stay exact', () => {
  const manifest = JSON.parse(readFileSync('public/Fed3_Frame_240/sequence.json', 'utf8'));
  for (const segment of manifest.suggested_scroll_map) {
    const midpoint = (segment.progress[0] + segment.progress[1]) / 2;
    expect(frameAt(midpoint)).toBe(Math.round((segment.frames[0] + segment.frames[1]) / 2));
  }
  expect([frameAt(-1), frameAt(0), frameAt(.22), frameAt(.32), frameAt(.48), frameAt(.58), frameAt(.74), frameAt(.84), frameAt(1), frameAt(2)])
    .toEqual([1, 1, 60, 61, 120, 121, 180, 181, 240, 240]);
  expect([stationAt(.27), stationAt(.53), stationAt(.79), stationAt(.9)]).toEqual(['alternatives', 'home-cloud', 'communities', null]);
  const forward = Array.from({ length: 1001 }, (_, i) => frameAt(i / 1000));
  expect(forward.every((f, i) => !i || f >= forward[i - 1])).toBe(true);
  expect(Array.from({ length: 1001 }, (_, i) => frameAt((1000 - i) / 1000))).toEqual([...forward].reverse());
});

test('bounded downloads, Strict Mode lease reuse, truthful failure and retry without redownloading successes', async () => {
  const originalFetch = globalThis.fetch;
  const bytes = readFileSync('public/Fed3_Frame_240/frame_00001.png');
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const frames = Array.from({ length: 240 }, (_, i) => ({ index: i + 1, file: `frame_${String(i + 1).padStart(5, '0')}.png`, bytes: bytes.length, sha256 }));
  const manifest = { frame_count: 240, width: 1600, height: 900, frames };
  let active = 0, peak = 0, fail = true;
  const calls: number[] = [], counts: number[] = [];
  globalThis.fetch = (async (url: string) => {
    if (url.endsWith('sequence.json')) return new Response(JSON.stringify(manifest));
    const index = Number(url.match(/frame_(\d+)/)![1]); calls.push(index);
    peak = Math.max(peak, ++active);
    await new Promise(resolve => setTimeout(resolve, 2)); active--;
    if (fail && index === 90) return new Response('', { status: 404 });
    return new Response(bytes, { headers: { 'Content-Type': 'image/png' } });
  }) as typeof fetch;
  const manager = new FrameResources();
  const unsubscribe = manager.subscribe(() => counts.push(manager.getSnapshot().completed));
  const first = manager.acquire(true, false); first();
  const release = manager.acquire(true, false);
  try {
    await expect.poll(() => manager.getSnapshot().completed).toBe(239);
    expect(manager.getSnapshot().failed).toEqual([90]);
    expect(peak).toBeLessThanOrEqual(6);
    expect(calls.slice(0, 5)).toEqual([1, 60, 120, 180, 240]);
    expect(calls.filter(n => n === 1)).toHaveLength(1);
    expect(counts.every((n, i) => !i || n >= counts[i - 1])).toBe(true);
    fail = false; manager.retry();
    await expect.poll(() => manager.getSnapshot().completed).toBe(240);
    expect(calls.filter(n => n === 60)).toHaveLength(1);
    expect(manager.getSnapshot().failed).toEqual([]);
  } finally { release(); unsubscribe(); globalThis.fetch = originalFetch; }
});

test('mobile simplified lease fetches only five anchors with a four-download ceiling', async () => {
  const originalFetch = globalThis.fetch;
  const bytes = readFileSync('public/Fed3_Frame_240/frame_00001.png');
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const frames = Array.from({ length: 240 }, (_, i) => ({ index: i + 1, file: `frame_${String(i + 1).padStart(5, '0')}.png`, bytes: bytes.length, sha256 }));
  const calls: number[] = []; let active = 0, peak = 0;
  globalThis.fetch = (async (url: string) => {
    if (url.endsWith('sequence.json')) return new Response(JSON.stringify({ frame_count: 240, width: 1600, height: 900, frames }));
    calls.push(Number(url.match(/frame_(\d+)/)![1])); peak = Math.max(peak, ++active);
    await new Promise(resolve => setTimeout(resolve, 5)); active--;
    return new Response(bytes, { headers: { 'Content-Type': 'image/png' } });
  }) as typeof fetch;
  const manager = new FrameResources(); const release = manager.acquire(false, true);
  try { await expect.poll(() => manager.getSnapshot().completed).toBe(5); expect(calls).toEqual([1, 60, 120, 180, 240]); expect(peak).toBeLessThanOrEqual(4); }
  finally { release(); globalThis.fetch = originalFetch; }
});

test('decode cache closes evictions and late work, with at most two concurrent decodes', async () => {
  const original = globalThis.createImageBitmap;
  let alive = 0, peak = 0, active = 0, peakActive = 0;
  globalThis.createImageBitmap = (async () => {
    peakActive = Math.max(peakActive, ++active);
    await new Promise(resolve => setTimeout(resolve, 2)); active--;
    peak = Math.max(peak, ++alive);
    return { width: 960, height: 540, close: () => { alive--; } } as ImageBitmap;
  }) as typeof createImageBitmap;
  const manager = new FrameResources();
  for (let i = 1; i <= 240; i++) manager.blobs.set(i, new Blob());
  let ready = 0;
  const decoder = new FrameDecoder(manager, true, () => { ready++; }, () => { throw new Error('Unexpected decode failure'); });
  decoder.resize(960);
  try {
    for (const target of [1, 60, 120, 180, 240, 20, 150]) {
      decoder.request(target); await expect.poll(() => Boolean(decoder.get(target))).toBe(true);
    }
    expect(peak).toBeLessThanOrEqual(10); expect(peakActive).toBeLessThanOrEqual(2); expect(ready).toBeGreaterThan(0);
    decoder.request(75); decoder.destroy();
    await expect.poll(() => alive).toBe(0);
  } finally { decoder.destroy(); globalThis.createImageBitmap = original; }
});
