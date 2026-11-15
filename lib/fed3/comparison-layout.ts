import type { Copy, Criterion } from './alternatives';

export const comparisonGroups = [
  { id: 'privacy', title: { ar: 'الخصوصية والبيانات', en: 'Privacy & data' }, criteria: ['encryption', 'collection', 'ads', 'control', 'account'] },
  { id: 'features', title: { ar: 'المزايا والأجهزة', en: 'Features & devices' }, criteria: ['features', 'platforms'] },
  { id: 'cost', title: { ar: 'التكلفة', en: 'Cost' }, criteria: ['cost'] },
  { id: 'migration', title: { ar: 'الانتقال والقيود', en: 'Migration & limits' }, criteria: ['portability', 'limitations'] },
] as const satisfies readonly { id: string; title: Copy; criteria: readonly Criterion[] }[];

export type ComparisonGroupId = typeof comparisonGroups[number]['id'];
