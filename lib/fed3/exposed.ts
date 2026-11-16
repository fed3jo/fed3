export type Point = { x: number; z: number };
export type Bounds = { x: number; z: number; w: number; d: number; height: number };
export type Decision = 'navigation' | 'contacts' | 'cloud';
export type Choices = { navigation: boolean; contacts: boolean; cloud: boolean };
export type Checkpoint = Point & { ar: string; en: string; decision?: Decision };
export const checkpoints: Checkpoint[] = [
  { x: 0, z: -5, ar: 'محطة الملاحة', en: 'Navigation kiosk', decision: 'navigation' },
  { x: 13, z: -43, ar: 'بوابة الأرشيف', en: 'Archive gate', decision: 'contacts' },
  { x: -12, z: -83, ar: 'محطة نقل الملفات', en: 'Transfer station', decision: 'cloud' },
  { x: 0, z: -127, ar: 'مقرّ الفريق', en: 'Community hub' },
];
export const START: Point = { x: 0, z: 14 };
export const SAVE_KEY = 'fed3-exposed-v1';
export function nearbyStation(stage: number, from: Point): number | null {
  const near = (index: number) => Math.hypot(from.x - checkpoints[index].x, from.z - checkpoints[index].z) < 3.5;
  if (near(stage)) return stage;
  if (stage === 3 && near(2)) return 2;
  return null;
}
export function streetRoute(stage: number, from: Point): Point[] {
  const destination = checkpoints[stage];
  if (stage === 0 || Math.hypot(from.x - destination.x, from.z - destination.z) < 4) return [{ ...from }, { x: destination.x, z: destination.z }];
  const route: Point[] = [{ ...from }];
  if (stage === 1 && from.z > -7 && Math.abs(from.x) < 5) {
    const side = from.x < -.2 ? -1.7 : 1.7;
    route.push({ x: side, z: from.z }, { x: side, z: -8 }, { x: 0, z: -8 }, { x: 0, z: destination.z }, { x: destination.x, z: destination.z });
    return route;
  }
  if (Math.abs(from.x) > 7) {
    const crossStreet = Math.abs(from.z + 43) < Math.abs(from.z + 83) ? -43 : -83;
    route.push({ x: from.x, z: crossStreet }, { x: 0, z: crossStreet });
  } else route.push({ x: 0, z: from.z });
  route.push({ x: 0, z: destination.z }, { x: destination.x, z: destination.z });
  return route;
}
export type SavedRun = { version: 1; stage: number; choices: Choices; seconds: number; pulses: number };
export function readRun(raw: string | null): SavedRun | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    if (s.version !== 1 || !Number.isInteger(s.stage) || s.stage < 0 || s.stage > 3 || !s.choices ||
      ['navigation', 'contacts', 'cloud'].some(k => typeof s.choices[k] !== 'boolean') ||
      !Number.isFinite(s.seconds) || s.seconds < 0 || s.seconds > 86400 ||
      !Number.isInteger(s.pulses) || s.pulses < 0 || s.pulses > 100000) return null;
    if ((s.stage === 0 && (s.choices.contacts || s.choices.cloud)) || (s.stage < 3 && s.choices.cloud) || (s.stage < 2 && s.choices.contacts)) return null;
    return { version: 1, stage: s.stage, choices: { navigation: s.choices.navigation, contacts: s.choices.contacts, cloud: s.choices.cloud }, seconds: s.seconds, pulses: s.pulses };
  } catch { return null; }
}
export function inside(point: Point, b: Bounds, radius = 0): boolean {
  return Math.abs(point.x - b.x) < b.w / 2 + radius && Math.abs(point.z - b.z) < b.d / 2 + radius;
}
export function segmentBlocked(a: Point, b: Point, bounds: Bounds[], eyeHeight = 1.2): boolean {
  return bounds.some(box => {
    if (box.height < eyeHeight) return false;
    let low = 0, high = 1;
    for (const [start, delta, min, max] of [
      [a.x, b.x - a.x, box.x - box.w / 2, box.x + box.w / 2],
      [a.z, b.z - a.z, box.z - box.d / 2, box.z + box.d / 2],
    ]) {
      if (Math.abs(delta) < .00001) { if (start < min || start > max) return false; }
      else {
        const one = (min - start) / delta, two = (max - start) / delta;
        low = Math.max(low, Math.min(one, two)); high = Math.min(high, Math.max(one, two));
        if (low > high) return false;
      }
    }
    return high >= 0 && low <= 1;
  });
}
export type DroneKnowledge = { last: Point | null; age: number; source: 'visual' | 'location' | null };
export function observe(knowledge: DroneKnowledge, player: Point, visible: boolean, sharedPing: boolean, dt: number): DroneKnowledge {
  if (visible || sharedPing) return { last: { x: player.x, z: player.z }, age: 0, source: sharedPing ? 'location' : 'visual' };
  const age = knowledge.age + dt;
  return { last: age > 9 ? null : knowledge.last, age, source: age > 9 ? null : knowledge.source };
}
