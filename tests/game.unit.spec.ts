import { test, expect } from '@playwright/test';
import { appropriateAccess, canContinue, concerns, continuity, fileIds, gameReducer, initialGame, outcome, readGame, roles, saveGame, stages, type GameAction, type GameState } from '../lib/fed3/game';

const next = (state: GameState) => gameReducer(state, { type: 'next' });
function run(choices: { quick?: boolean; all?: boolean; skip?: boolean; phished?: boolean; public?: boolean; noRestore?: boolean; existing?: boolean; noTrain?: boolean } = {}) {
  let s = next(initialGame());
  s = next(gameReducer(s, { type: 'consent', value: choices.quick ? 'quick' : 'reviewed' }));
  s = next(gameReducer(s, { type: 'photos', value: choices.all ? 'all' : 'selected' }));
  s = gameReducer(s, { type: 'backup', value: choices.skip ? 'skipped' : 'prepared' });
  s = next(gameReducer(s, { type: 'network', value: choices.phished ? 'phished' : 'verified' }));
  for (const file of fileIds) s = gameReducer(s, { type: 'access', file, role: choices.public ? 'public' : appropriateAccess[file] });
  if (!choices.noRestore) s = gameReducer(s, { type: 'restore' });
  s = next(s);
  s = gameReducer(s, { type: 'community', value: choices.existing ? 'existing' : 'signal' });
  if (!choices.noTrain) s = gameReducer(s, { type: 'train' });
  return next(s);
}
test('causal endings distinguish preparation, privacy and actual recovery', () => {
  const ready = run();
  expect(ready.stage).toBe('ending');
  expect(outcome(ready)).toBe('ready');
  expect(concerns(ready)).toEqual([]);
  expect(continuity(ready)).toEqual({ files: true, permissions: true, people: true });
  expect(outcome(run({ all: true }))).toBe('partial');
  const stalled = run({ quick: true, all: true, skip: true, phished: true, public: true, existing: true });
  expect(outcome(stalled)).toBe('interrupted');
  expect(continuity(stalled)).toEqual({ files: false, permissions: false, people: false });
  expect(concerns(run({ noRestore: true }))).toEqual(['restore']);
  // Switching to a messenger cannot undo credentials disclosed in an earlier scene.
  expect(concerns(run({ phished: true }))).toContain('login');
  expect(run({ skip: true }).answers.restored).toBe(false);
});
test('scene guards reject skipped prerequisites, duplicate decisions and impossible skills', () => {
  const initial = initialGame();
  expect(gameReducer(initial, { type: 'restore' })).toBe(initial);
  expect(gameReducer(initial, { type: 'train' })).toBe(initial);
  let s = next(initial);
  expect(canContinue(s)).toBe(false); expect(next(s)).toBe(s);
  s = gameReducer(s, { type: 'consent', value: 'reviewed' });
  expect(gameReducer(s, { type: 'consent', value: 'quick' })).toBe(s);
  let n = gameReducer(run(), { type: 'rewind', stage: 'network' });
  expect(gameReducer(n, { type: 'network', value: 'mobile' })).toBe(n);
  n = gameReducer(n, { type: 'backup', value: 'skipped' });
  n = next(gameReducer(n, { type: 'network', value: 'mobile' }));
  expect(gameReducer(n, { type: 'restore' })).toBe(n);
  for (const file of fileIds) n = gameReducer(n, { type: 'access', file, role: appropriateAccess[file] });
  n = next(n); n = gameReducer(n, { type: 'community', value: 'existing' });
  expect(gameReducer(n, { type: 'train' })).toBe(n);
});
test('rewinding keeps earlier choices, clears future effects and leaves the input immutable', () => {
  const ending = run({ all: true, phished: true });
  const snapshot = saveGame(ending);
  const revised = gameReducer(ending, { type: 'rewind', stage: 'photos' });
  expect(revised.answers.consent).toBe('reviewed');
  expect(revised.answers.photos).toBeNull();
  expect(revised.answers.network).toBeNull();
  expect(revised.answers.access).toEqual({ orders: null, portraits: null, stories: null });
  expect(revised.answers.trained).toBe(false);
  expect(saveGame(ending)).toBe(snapshot);
  expect(gameReducer(revised, { type: 'rewind', stage: 'community' })).toBe(revised);
});
test('save validation rejects corruption, future decisions and incompatible versions', () => {
  for (const input of [null, '', '{', 'null', '[]', '0', 'x'.repeat(5000)]) expect(readGame(input)).toBeNull();
  const good = run(); expect(readGame(saveGame(good))).toEqual(good);
  for (const patch of [{ version: 99 }, { stage: 'unknown' }, { answers: { ...good.answers, backup: 'skipped' } }, { stage: 'intro' }, { answers: { ...good.answers, consent: '__proto__' } }]) expect(readGame(JSON.stringify({ ...good, ...patch }))).toBeNull();
  const premature = initialGame(); premature.answers.trained = true;
  expect(readGame(saveGame(premature))).toBeNull();
});
test('all 256 decision combinations are deterministic, replayable and serializable at every checkpoint', () => {
  const keys = ['quick', 'all', 'skip', 'phished', 'public', 'noRestore', 'existing', 'noTrain'] as const;
  for (let mask = 0; mask < 256; mask++) {
    const options = Object.fromEntries(keys.map((key, index) => [key, Boolean(mask & 1 << index)]));
    const end = run(options);
    expect(end).toEqual(run(options));
    expect(readGame(saveGame(end))).toEqual(end);
    for (const stage of stages) {
      if (stage === 'ending') continue;
      const checkpoint = gameReducer(end, { type: 'rewind', stage });
      expect(readGame(saveGame(checkpoint))).toEqual(checkpoint);
    }
  }
});
test('all 64 permission combinations evaluate purpose separately from recovery', () => {
  for (const first of roles) for (const second of roles) for (const third of roles) {
    let s = gameReducer(run(), { type: 'rewind', stage: 'cloud' });
    for (const [i, role] of [first, second, third].entries()) s = gameReducer(s, { type: 'access', file: fileIds[i], role });
    expect(continuity(s).permissions).toBe(first === 'market' && second === 'exhibit' && third === 'reviewers');
    expect(continuity(s).files).toBe(false);
    expect(canContinue(s)).toBe(true);
    expect(readGame(saveGame(s))).toEqual(s);
  }
});
