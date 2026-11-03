import type { Station } from './config';
export const scrollMap = [
  { start: 0, end: .06, from: 1, to: 1 },
  { start: .06, end: .22, from: 1, to: 60 },
  { start: .22, end: .32, from: 60, to: 60 },
  { start: .32, end: .48, from: 61, to: 120 },
  { start: .48, end: .58, from: 120, to: 120 },
  { start: .58, end: .74, from: 121, to: 180 },
  { start: .74, end: .84, from: 180, to: 180 },
  { start: .84, end: .96, from: 181, to: 240 },
  { start: .96, end: 1, from: 240, to: 240 },
] as const;
export const clampProgress = (p: number) => Math.min(1, Math.max(0, p));
export function frameAt(progress: number) {
  const p = clampProgress(progress);
  const s = scrollMap.find(s => p < s.end) || scrollMap[8];
  return Math.round(s.from + (s.to - s.from) * (p - s.start) / (s.end - s.start) + 1e-9);
}
export function stationAt(p: number): Station | null {
  if (p <= .06) return 'intro';
  if (p >= .22 && p <= .32) return 'alternatives';
  if (p >= .48 && p <= .58) return 'home-cloud';
  if (p >= .74 && p <= .84) return 'communities';
  if (p >= .96) return 'closing';
  return null;
}

/** Keep the current chapter readable throughout the camera travel. */
export function journeyStationAt(progress: number): Station {
  const p = clampProgress(progress);
  if (p < .4) return 'alternatives';
  if (p < .66) return 'home-cloud';
  if (p < .94) return 'communities';
  return 'closing';
}
