import { test, expect } from '@playwright/test';
import { checkpoints, START, inside, nearbyStation, observe, readRun, segmentBlocked, streetRoute, type Bounds, type DroneKnowledge, type SavedRun } from '../lib/fed3/exposed';

const wall: Bounds = { x: 0, z: 0, w: 4, d: 2, height: 3 };
const emptyKnowledge = (): DroneKnowledge => ({ last: null, age: 0, source: null });
const validRun = (): SavedRun => ({ version: 1, stage: 3, choices: { navigation: true, contacts: true, cloud: true }, seconds: 123.5, pulses: 4 });

test('files can be collected again after transfer without unlocking future stations', () => {
  expect(nearbyStation(3, { x: -12, z: -81 })).toBe(2);
  expect(nearbyStation(3, { x: 0, z: -125 })).toBe(3);
  expect(nearbyStation(1, checkpoints[2])).toBeNull();
  expect(nearbyStation(3, checkpoints[1])).toBeNull();
  expect(nearbyStation(3, { x: -12, z: -79.5 })).toBeNull();
  expect(nearbyStation(2, checkpoints[2])).toBe(2);
});

test('location disclosure records a copy and stopping disclosure preserves only the last known point', () => {
  const player = { x: 2, z: -15 };
  const disclosed = observe(emptyKnowledge(), player, false, true, .1);
  expect(disclosed).toEqual({ last: { x: 2, z: -15 }, age: 0, source: 'location' });
  expect(disclosed.last).not.toBe(player);

  player.x = 30;
  player.z = -45;
  const searching = observe(disclosed, player, false, false, 2);
  expect(searching.last).toEqual({ x: 2, z: -15 });
  expect(searching.age).toBe(2);
  expect(searching.source).toBe('location');
  expect(disclosed.age).toBe(0);
  expect(disclosed.last).toEqual({ x: 2, z: -15 });
});

test('hidden movement cannot create drone knowledge and old observations expire after nine seconds', () => {
  const hidden = observe(emptyKnowledge(), { x: 100, z: -60 }, false, false, 1);
  expect(hidden.last).toBeNull();
  expect(hidden.source).toBeNull();

  const spotted = observe(emptyKnowledge(), { x: 4, z: -10 }, true, false, 0);
  const boundary = observe(spotted, { x: 80, z: -100 }, false, false, 9);
  expect(boundary.last).toEqual({ x: 4, z: -10 });
  const expired = observe(boundary, { x: 80, z: -100 }, false, false, .01);
  expect(expired.last).toBeNull();
  expect(expired.source).toBeNull();
});

test('a fresh visual sighting replaces a stale ping and reacquires an expired target', () => {
  const stale = observe(emptyKnowledge(), { x: 1, z: 2 }, false, true, 0);
  const seen = observe({ ...stale, age: 7 }, { x: -8, z: -30 }, true, false, .2);
  expect(seen).toEqual({ last: { x: -8, z: -30 }, age: 0, source: 'visual' });
  const expired = observe(seen, { x: 9, z: -90 }, false, false, 10);
  const reacquired = observe(expired, { x: 9, z: -90 }, true, false, .1);
  expect(reacquired).toEqual({ last: { x: 9, z: -90 }, age: 0, source: 'visual' });
});

test('solid walls block crossing sight lines but walls past the target do not', () => {
  expect(segmentBlocked({ x: -5, z: 0 }, { x: 5, z: 0 }, [wall])).toBe(true);
  expect(segmentBlocked({ x: 5, z: 0 }, { x: -5, z: 0 }, [wall])).toBe(true);
  expect(segmentBlocked({ x: -5, z: -4 }, { x: 5, z: 4 }, [wall])).toBe(true);
  expect(segmentBlocked({ x: -5, z: 0 }, { x: -3, z: 0 }, [wall])).toBe(false);
  expect(segmentBlocked({ x: -5, z: 0 }, { x: 5, z: 0 }, [])).toBe(false);
});

test('parallel sight lines handle misses, boundary contact, and endpoints inside a wall', () => {
  expect(segmentBlocked({ x: 3, z: -5 }, { x: 3, z: 5 }, [wall])).toBe(false);
  expect(segmentBlocked({ x: 0, z: -5 }, { x: 0, z: 5 }, [wall])).toBe(true);
  expect(segmentBlocked({ x: -5, z: 2 }, { x: 5, z: 2 }, [wall])).toBe(false);
  expect(segmentBlocked({ x: -5, z: 1 }, { x: 5, z: 1 }, [wall])).toBe(true);
  expect(segmentBlocked({ x: 0, z: 0 }, { x: 5, z: 0 }, [wall])).toBe(true);
  expect(segmentBlocked({ x: 0, z: 0 }, { x: 0, z: 0 }, [wall])).toBe(true);
  expect(segmentBlocked({ x: 4, z: 4 }, { x: 4, z: 4 }, [wall])).toBe(false);
});

test('occlusion respects eye height and checks subsequent walls after low cover', () => {
  const cover = { ...wall, height: .8 };
  const a = { x: -5, z: 0 }, b = { x: 5, z: 0 };
  expect(segmentBlocked(a, b, [cover])).toBe(false);
  expect(segmentBlocked(a, b, [cover], .8)).toBe(true);
  expect(segmentBlocked(a, b, [cover], .81)).toBe(false);
  expect(segmentBlocked(a, b, [cover, { ...wall, x: 3 }])).toBe(true);
});

test('collision containment uses open boundaries and expands obstacles by the player radius', () => {
  expect(inside({ x: 0, z: 0 }, wall)).toBe(true);
  expect(inside({ x: 1.999, z: .999 }, wall)).toBe(true);
  expect(inside({ x: 2, z: 0 }, wall)).toBe(false);
  expect(inside({ x: 0, z: -1 }, wall)).toBe(false);
  expect(inside({ x: 2.4, z: 0 }, wall, .5)).toBe(true);
  expect(inside({ x: 2.5, z: 0 }, wall, .5)).toBe(false);
  expect(inside({ x: -2.4, z: -1.4 }, wall, .5)).toBe(true);
});

test('checkpoint routes stay on the central road and cross streets without cutting inner building rows', () => {
  const buildings: Bounds[] = [-14, 14].flatMap(x => [-23, -61, -101].map(z => ({ x, z, w: 12, d: 14, height: 15 })));
  const starts = [START, ...checkpoints.slice(0, 3).map(cp => ({ x: cp.x, z: cp.z + 4 }))];
  for (let stage = 0; stage < checkpoints.length; stage++) {
    const from = starts[stage];
    const destination = checkpoints[stage];
    const route = streetRoute(stage, from);
    expect(route[0]).toEqual(from);
    expect(route[0]).not.toBe(from);
    expect(route.at(-1)).toEqual({ x: destination.x, z: destination.z });
    for (let i = 1; i < route.length; i++) {
      expect(segmentBlocked(route[i - 1], route[i], buildings), `stage ${stage}, segment ${i}`).toBe(false);
    }
  }
  // This first-leg shortcut would enter the east building row; the street route must avoid it.
  expect(segmentBlocked(starts[1], checkpoints[1], buildings)).toBe(true);
});

test('navigation detours around its kiosk when leaving from either side of the approach', () => {
  const kiosk: Bounds = { x: checkpoints[0].x, z: checkpoints[0].z, w: .8 + .7, d: .65 + .7, height: 1.9 };
  for (const x of [0, -.4, .4]) {
    const from = { x, z: -1 };
    const route = streetRoute(1, from);
    expect(route[0]).toEqual(from);
    expect(route.at(-1)).toEqual({ x: checkpoints[1].x, z: checkpoints[1].z });
    for (let i = 1; i < route.length; i++) {
      expect(segmentBlocked(route[i - 1], route[i], [kiosk]), `approach x ${x}, segment ${i}`).toBe(false);
    }
    // Walking straight down the road would hit the kiosk even before considering buildings.
    expect(segmentBlocked(from, { x, z: -8 }, [kiosk])).toBe(true);
  }
});

test('arriving within a checkpoint approach keeps navigation local to that destination', () => {
  for (let stage = 0; stage < checkpoints.length; stage++) {
    const cp = checkpoints[stage];
    const from = { x: cp.x + 1, z: cp.z + 2 };
    const before = { ...from };
    const route = streetRoute(stage, from);
    expect(route).toEqual([from, { x: cp.x, z: cp.z }]);
    expect(from).toEqual(before);
  }
});

test('save reader accepts valid checkpoint choices and removes unexpected fields', () => {
  const full = validRun();
  expect(readRun(JSON.stringify(full))).toEqual(full);
  expect(readRun(JSON.stringify({ ...full, debug: 'untrusted', choices: { ...full.choices, extra: true } }))).toEqual(full);
  for (let stage = 0; stage <= 3; stage++) {
    for (const navigation of [false, true]) {
      for (const contacts of [false, true]) {
        for (const cloud of [false, true]) {
          const save = { ...full, stage, choices: { navigation, contacts, cloud } };
          const futureDecision = (stage < 2 && contacts) || (stage < 3 && cloud);
          expect(readRun(JSON.stringify(save))).toEqual(futureDecision ? null : save);
        }
      }
    }
  }
});

test('save reader rejects corrupt data, unsupported versions, and invalid numeric counters', () => {
  for (const raw of [null, '', '{', 'null', '[]', '0', 'true', '"run"']) expect(readRun(raw)).toBeNull();
  const full = validRun();
  for (const patch of [
    { version: 2 }, { version: '1' },
    { stage: -1 }, { stage: 4 }, { stage: 1.5 }, { stage: '2' },
    { seconds: -1 }, { seconds: 86401 }, { seconds: '10' }, { seconds: null },
    { pulses: -1 }, { pulses: 100001 }, { pulses: 1.5 }, { pulses: '1' },
    { choices: null }, { choices: {} },
    { choices: { ...full.choices, cloud: 'true' } },
  ]) expect(readRun(JSON.stringify({ ...full, ...patch }))).toBeNull();
  for (const key of ['stage', 'seconds', 'pulses', 'choices', 'version']) {
    const missing: Record<string, unknown> = { ...full };
    delete missing[key];
    expect(readRun(JSON.stringify(missing))).toBeNull();
  }
});

test('save limits permit exact endpoints and reject future contacts or cloud outcomes', () => {
  const full = validRun();
  expect(readRun(JSON.stringify({ ...full, seconds: 0, pulses: 0 }))).not.toBeNull();
  expect(readRun(JSON.stringify({ ...full, seconds: 86400, pulses: 100000 }))).not.toBeNull();
  expect(readRun(JSON.stringify({ ...full, stage: 0 }))).toBeNull();
  expect(readRun(JSON.stringify({ ...full, stage: 1 }))).toBeNull();
  expect(readRun(JSON.stringify({ ...full, stage: 2 }))).toBeNull();
});
