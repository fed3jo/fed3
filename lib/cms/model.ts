import { z } from 'zod';
import { criteria, type Alternative } from '@/lib/fed3/alternatives';
z.config(z.locales.ar());

export const criterionKeys = Object.keys(criteria) as [keyof typeof criteria, ...(keyof typeof criteria)[]];
const text = z.string().max(12000);
const short = z.string().max(240);
const copy = z.object({ ar: text, en: text }).strict();
const https = z.string().max(2048).refine(value => { try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; } }, 'استخدم رابط HTTPS كاملًا');
const optionalUrl = z.union([z.literal(''), https]);
const imageUrl = z.union([z.literal(''), https, z.string().regex(/^\/app-logos\/[a-z0-9.-]+$/)]);
export const appSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).min(2).max(80),
  name: short, current: short, category: z.string().regex(/^[a-z0-9-]+$/).max(80), categoryLabel: copy,
  mark: z.string().max(5), color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  description: copy, gain: copy, tradeoff: copy, firstStep: copy, steps: z.array(copy).max(20),
  official: optionalUrl, download: optionalUrl, logo: imageUrl, currentLogo: imageUrl,
  reviewedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v, 'تاريخ غير صالح'),
  sources: z.array(z.object({ name: copy, url: optionalUrl }).strict()).max(30),
  rows: z.array(z.object({ key: z.enum(criterionKeys), current: copy, alternative: copy, sources: z.array(z.number().int().min(0).max(29)).max(30) }).strict()).length(10),
  introduction: z.object({ source: optionalUrl, description: copy, features: z.array(copy).max(12) }).strict(),
  start: z.object({ firstCriterion: z.enum(criterionKeys), intro: copy, benefit: copy, remember: copy, downloadLabel: copy, note: copy, steps: z.array(copy).max(20) }).strict(),
  briefs: z.record(z.enum(criterionKeys), z.object({ current: copy, alternative: copy }).strict()),
  downloads: z.array(z.object({ platform: short, url: optionalUrl }).strict()).max(15),
  media: z.array(z.object({ id: z.uuid(), url: https, mime: z.string().regex(/^(image\/(png|jpeg|webp|avif)|video\/(mp4|webm))$/), alt: copy, license: short, sourceUrl: optionalUrl }).strict()).max(20),
  sortOrder: z.number().int().min(0).max(100000),
}).strict();
export type AppDocument = z.infer<typeof appSchema>;
export type StaffRole = 'manager' | 'editor';
export type Staff = { user_id: string; email: string; role: StaffRole; active: boolean };
export type AppRecord = { id: string; draft: AppDocument; published: AppDocument | null; archived: boolean; version: number; position: number; updated_at: string };
export const mediaSchema = z.object({ id: z.uuid(), path: z.string().regex(/^[a-zA-Z0-9/_-]+\.(png|jpg|webp|avif|mp4|webm)$/).max(200), url: https, name: short.min(1), mime: z.enum(['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'video/mp4', 'video/webm']), bytes: z.number().int().positive().max(40 * 1024 * 1024), alt: copy, license: short.min(1), sourceUrl: optionalUrl, sha256: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
export type MediaAsset = z.infer<typeof mediaSchema>;
export const backupSchema = z.object({ format: z.literal('fed3-cms'), schemaVersion: z.literal(1), exportedAt: z.iso.datetime(), version: z.number().int().min(0), apps: z.array(z.object({ id: z.string(), draft: appSchema, published: appSchema.nullable(), archived: z.boolean(), version: z.number().int().min(1), position: z.number().int().min(0).max(100000), updated_at: z.string() }).strict()).max(1000), media: z.array(mediaSchema).max(5000) }).strict().superRefine((data, ctx) => {
  const ids = new Set<string>();
  for (const app of data.apps) { if (ids.has(app.id) || app.id !== app.draft.id || (app.published && app.id !== app.published.id)) ctx.addIssue({ code: 'custom', message: 'معرف تطبيق مكرر أو غير متطابق' }); ids.add(app.id); }
  if (new Set(data.media.map(m => m.id)).size !== data.media.length) ctx.addIssue({ code: 'custom', message: 'معرف وسيط مكرر' });
});
export type ContentBackup = z.infer<typeof backupSchema>;

export function publishIssues(doc: AppDocument): string[] {
  const issues: string[] = [];
  const bilingual = (value: { ar: string; en: string }, label: string) => { if (!value.ar.trim() || !value.en.trim()) issues.push(`${label}: أكمل العربي والإنجليزي`); };
  if (!doc.name.trim() || !doc.current.trim()) issues.push('أكمل اسم التطبيق والتطبيق المقارن');
  for (const [field, label] of [['description', 'الوصف'], ['gain', 'الفوائد'], ['tradeoff', 'الحدود'], ['firstStep', 'الخطوة الأولى'], ['categoryLabel', 'التصنيف']] as const) bilingual(doc[field], label);
  if (!doc.official || !doc.download || !doc.introduction.source) issues.push('أكمل روابط الموقع والتنزيل والتعريف');
  if (!doc.logo || !doc.currentLogo) issues.push('اختر شعار التطبيق وشعار التطبيق المقارن');
  if (!doc.sources.length || doc.sources.some(s => !s.url || !s.name.ar.trim() || !s.name.en.trim())) issues.push('أكمل أسماء المصادر وروابطها');
  if (!doc.steps.length || !doc.start.steps.length) issues.push('أضف خطوات الانتقال والبداية');
  doc.steps.forEach(s => bilingual(s, 'خطوة انتقال')); doc.start.steps.forEach(s => bilingual(s, 'خطوة بداية'));
  if (new Set(doc.rows.map(r => r.key)).size !== 10) issues.push('محاور المقارنة العشرة مطلوبة بدون تكرار');
  for (const row of doc.rows) { bilingual(row.current, criteria[row.key].ar); bilingual(row.alternative, criteria[row.key].ar); if (!row.sources.length || row.sources.some(n => n >= doc.sources.length)) issues.push(`مراجع غير صالحة لمحور ${criteria[row.key].ar}`); }
  bilingual(doc.introduction.description, 'التعريف'); doc.introduction.features.forEach(f => bilingual(f, 'ميزة'));
  for (const key of ['intro', 'benefit', 'remember', 'downloadLabel', 'note'] as const) bilingual(doc.start[key], `نص البداية ${key}`);
  for (const key of criterionKeys) { bilingual(doc.briefs[key].current, `ملخص ${criteria[key].ar}`); bilingual(doc.briefs[key].alternative, `ملخص ${criteria[key].ar}`); }
  if (doc.downloads.some(d => !d.platform.trim() || !d.url)) issues.push('أكمل أنظمة التشغيل وروابط تنزيلها');
  if (doc.media.some(m => !m.alt.ar.trim() || !m.alt.en.trim() || !m.license.trim())) issues.push('أكمل وصف الوسائط وترخيصها');
  if (doc.reviewedOn > new Date().toISOString().slice(0, 10)) issues.push('تاريخ مراجعة المصادر لا يكون بالمستقبل');
  return [...new Set(issues)];
}

export function newDocument(): AppDocument {
  const c = () => ({ ar: '', en: '' });
  return { id: 'new-app', name: '', current: '', category: 'messaging', categoryLabel: { ar: 'المراسلة', en: 'Messaging' }, mark: 'A', color: '#062759', description: c(), gain: c(), tradeoff: c(), firstStep: c(), steps: [c()], official: '', download: '', logo: '', currentLogo: '', reviewedOn: new Date().toISOString().slice(0, 10), sources: [{ name: c(), url: '' }], rows: criterionKeys.map(key => ({ key, current: c(), alternative: c(), sources: [] })), introduction: { source: '', description: c(), features: [c()] }, start: { firstCriterion: 'collection', intro: c(), benefit: c(), remember: c(), downloadLabel: c(), note: c(), steps: [c()] }, briefs: Object.fromEntries(criterionKeys.map(k => [k, { current: c(), alternative: c() }])) as AppDocument['briefs'], downloads: [], media: [], sortOrder: 10 };
}

export function toAlternative(doc: AppDocument): Alternative { return doc; }
