// The story is a local simulation. Outcomes describe this run, not a security audit.
export const GAME_VERSION = 1;
export const SAVE_KEY = 'fed3-opening-night-v1';
export const stages = ['intro', 'consent', 'photos', 'network', 'cloud', 'community', 'ending'] as const;
export type Stage = typeof stages[number];
export type FileId = 'orders' | 'portraits' | 'stories';
export type Role = 'market' | 'exhibit' | 'reviewers' | 'public';
export type Answers = {
  consent: 'quick' | 'reviewed' | null;
  photos: 'all' | 'selected' | null;
  backup: 'prepared' | 'skipped' | null;
  network: 'phished' | 'verified' | 'mobile' | null;
  access: Record<FileId, Role | null>;
  restored: boolean;
  community: 'existing' | 'signal' | null;
  trained: boolean;
};
export type GameState = { version: typeof GAME_VERSION; stage: Stage; answers: Answers };
export type GameAction =
  | { type: 'consent'; value: NonNullable<Answers['consent']> }
  | { type: 'photos'; value: NonNullable<Answers['photos']> }
  | { type: 'backup'; value: NonNullable<Answers['backup']> }
  | { type: 'network'; value: NonNullable<Answers['network']> }
  | { type: 'access'; file: FileId; role: Role }
  | { type: 'restore' }
  | { type: 'community'; value: NonNullable<Answers['community']> }
  | { type: 'train' }
  | { type: 'next' }
  | { type: 'rewind'; stage: Exclude<Stage, 'ending'> }
  | { type: 'restart' };
export const fileIds: FileId[] = ['orders', 'portraits', 'stories'];
export const roles: Role[] = ['market', 'exhibit', 'reviewers', 'public'];
export const appropriateAccess: Record<FileId, Role> = { orders: 'market', portraits: 'exhibit', stories: 'reviewers' };
export function initialGame(): GameState {
  return { version: GAME_VERSION, stage: 'intro', answers: { consent: null, photos: null, backup: null, network: null, access: { orders: null, portraits: null, stories: null }, restored: false, community: null, trained: false } };
}
export function canContinue(state: GameState): boolean {
  const a = state.answers;
  switch (state.stage) {
    case 'intro': return true;
    case 'consent': return a.consent !== null;
    case 'photos': return a.photos !== null;
    case 'network': return a.backup !== null && a.network !== null;
    case 'cloud': return fileIds.every(id => a.access[id] !== null);
    case 'community': return a.community !== null;
    default: return false;
  }
}
export function gameReducer(state: GameState, action: GameAction): GameState {
  const a = state.answers;
  const withAnswers = (patch: Partial<Answers>): GameState => ({ ...state, answers: { ...a, ...patch } });
  switch (action.type) {
    case 'restart': return initialGame();
    case 'next': return canContinue(state) ? { ...state, stage: stages[stages.indexOf(state.stage) + 1] } : state;
    case 'consent': return state.stage === 'consent' && a.consent === null && ['quick', 'reviewed'].includes(action.value) ? withAnswers({ consent: action.value }) : state;
    case 'photos': return state.stage === 'photos' && a.photos === null && ['all', 'selected'].includes(action.value) ? withAnswers({ photos: action.value }) : state;
    case 'backup': return state.stage === 'network' && a.backup === null && a.network === null && ['prepared', 'skipped'].includes(action.value) ? withAnswers({ backup: action.value }) : state;
    case 'network': return state.stage === 'network' && a.backup !== null && a.network === null && ['phished', 'verified', 'mobile'].includes(action.value) ? withAnswers({ network: action.value }) : state;
    case 'access': return state.stage === 'cloud' && fileIds.includes(action.file) && roles.includes(action.role) ? withAnswers({ access: { ...a.access, [action.file]: action.role } }) : state;
    case 'restore': return state.stage === 'cloud' && a.backup === 'prepared' && !a.restored ? withAnswers({ restored: true }) : state;
    case 'community': return state.stage === 'community' && a.community === null && ['existing', 'signal'].includes(action.value) ? withAnswers({ community: action.value }) : state;
    case 'train': return state.stage === 'community' && a.community === 'signal' && !a.trained ? withAnswers({ trained: true }) : state;
    case 'rewind': {
      const target = stages.indexOf(action.stage);
      if (target < 0 || target >= stages.indexOf(state.stage)) return state;
      const next = initialGame();
      next.stage = action.stage;
      // Keep only decisions made strictly before the selected scene.
      if (target > 1) next.answers.consent = a.consent;
      if (target > 2) next.answers.photos = a.photos;
      if (target > 3) { next.answers.backup = a.backup; next.answers.network = a.network; }
      if (target > 4) { next.answers.access = { ...a.access }; next.answers.restored = a.restored; }
      return next;
    }
    default: return state;
  }
}
export type Concern = 'ads' | 'library' | 'login' | 'backup' | 'restore' | 'access' | 'channel' | 'skills';
export function concerns(state: GameState): Concern[] {
  const a = state.answers;
  const result: Concern[] = [];
  if (a.consent === 'quick') result.push('ads');
  if (a.photos === 'all') result.push('library');
  if (a.network === 'phished') result.push('login');
  if (a.backup === 'skipped') result.push('backup');
  if (a.backup === 'prepared' && !a.restored && stages.indexOf(state.stage) >= 5) result.push('restore');
  if (fileIds.some(id => a.access[id] !== null && a.access[id] !== appropriateAccess[id])) result.push('access');
  if (a.community === 'existing') result.push('channel');
  if (a.community !== null && !a.trained) result.push('skills');
  return result;
}
export function outcome(state: GameState): 'ready' | 'partial' | 'interrupted' {
  const count = concerns(state).length;
  return count === 0 ? 'ready' : count <= 3 ? 'partial' : 'interrupted';
}
export function continuity(state: GameState) {
  const a = state.answers;
  return {
    files: a.backup === 'prepared' && a.restored,
    permissions: fileIds.every(id => a.access[id] === appropriateAccess[id]),
    people: a.community === 'signal' && a.trained,
  };
}
export function saveGame(state: GameState): string { return JSON.stringify(state); }
export function readGame(raw: string | null): GameState | null {
  if (!raw || raw.length > 4096) return null;
  try {
    const value = JSON.parse(raw);
    if (value?.version !== GAME_VERSION || !stages.includes(value.stage) || !value.answers) return null;
    const input = value.answers;
    const allowed = (key: string, values: string[]) => input[key] === null || values.includes(input[key]);
    if (!allowed('consent', ['quick', 'reviewed']) || !allowed('photos', ['all', 'selected']) || !allowed('backup', ['prepared', 'skipped']) || !allowed('network', ['phished', 'verified', 'mobile']) || !allowed('community', ['existing', 'signal'])) return null;
    if (typeof input.restored !== 'boolean' || typeof input.trained !== 'boolean' || !input.access || !fileIds.every(id => input.access[id] === null || roles.includes(input.access[id]))) return null;
    if (input.restored && input.backup !== 'prepared' || input.trained && input.community !== 'signal') return null;
    let reconstructed = initialGame();
    for (let index = 0; index <= stages.indexOf(value.stage); index++) {
      if (index > 0) { if (!canContinue(reconstructed)) return null; reconstructed = gameReducer(reconstructed, { type: 'next' }); }
      if (index === 1 && input.consent !== null) reconstructed = gameReducer(reconstructed, { type: 'consent', value: input.consent });
      if (index === 2 && input.photos !== null) reconstructed = gameReducer(reconstructed, { type: 'photos', value: input.photos });
      if (index === 3) {
        if (input.backup !== null) reconstructed = gameReducer(reconstructed, { type: 'backup', value: input.backup });
        if (input.network !== null) reconstructed = gameReducer(reconstructed, { type: 'network', value: input.network });
      }
      if (index === 4) {
        for (const id of fileIds) if (input.access[id] !== null) reconstructed = gameReducer(reconstructed, { type: 'access', file: id, role: input.access[id] });
        if (input.restored) reconstructed = gameReducer(reconstructed, { type: 'restore' });
      }
      if (index === 5) {
        if (input.community !== null) reconstructed = gameReducer(reconstructed, { type: 'community', value: input.community });
        if (input.trained) reconstructed = gameReducer(reconstructed, { type: 'train' });
      }
    }
    // Reject decisions injected from future scenes or invalid combinations.
    return JSON.stringify(reconstructed.answers) === JSON.stringify({ consent: input.consent, photos: input.photos, backup: input.backup, network: input.network, access: { orders: input.access.orders, portraits: input.access.portraits, stories: input.access.stories }, restored: input.restored, community: input.community, trained: input.trained }) ? reconstructed : null;
  } catch { return null; }
}
