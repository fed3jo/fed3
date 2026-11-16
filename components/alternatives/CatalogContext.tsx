'use client';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { seedDocuments } from '@/lib/cms/seed';
import type { Alternative, Copy, Criterion } from '@/lib/fed3/alternatives';
import { appIntroductions as seedIntros } from '@/lib/fed3/app-introductions';
import { appStart as seedStart } from '@/lib/fed3/app-start';
import { comparisonBriefs as seedBriefs } from '@/lib/fed3/comparison-briefs';

function catalog(items: Alternative[]) {
  const appIntroductions: typeof seedIntros = {}, appStart: typeof seedStart = {}, comparisonBriefs: typeof seedBriefs = {}, categories: Record<string, Copy> = {}, logos: Record<string, string> = {};
  for (const app of items) {
    appIntroductions[app.id] = app.introduction ?? seedIntros[app.id];
    appStart[app.id] = app.start ?? seedStart[app.id];
    comparisonBriefs[app.id] = app.briefs ?? seedBriefs[app.id] ?? Object.fromEntries(app.rows.map(r => [r.key, { current: r.current, alternative: r.alternative }])) as Record<Criterion, { current: Copy; alternative: Copy }>;
    categories[app.category] = app.categoryLabel ?? { ar: app.category, en: app.category };
    if (app.logo) logos[app.name] = app.logo;
    if (app.currentLogo) logos[app.current] = app.currentLogo;
  }
  return { alternatives: items, appIntroductions, appStart, comparisonBriefs, categories, logos };
}
const CatalogContext = createContext(catalog(seedDocuments));
export function CatalogProvider({ items, children }: { items: Alternative[]; children: ReactNode }) { const value = useMemo(() => catalog(items), [items]); return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>; }
export const useCatalog = () => useContext(CatalogContext);
