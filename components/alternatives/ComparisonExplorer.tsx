'use client';

import { useState } from 'react';
import type { Alternative, ComparisonRow, Criterion } from '@/lib/fed3/alternatives';
import { criteria, privacyCriteria } from '@/lib/fed3/alternatives';
import { criterionQuestions } from '@/lib/fed3/narrative';
import type { Locale } from '@/lib/fed3/config';
import { AppLogo } from './AppLogo';
import { StoryIcon } from '@/components/shared/SovereigntyStory';
import styles from './alternatives.module.css';

export function ComparisonExplorer({ app, rows, locale }: { app: Alternative; rows: ComparisonRow[]; locale: Locale }) {
  const [selected, setSelected] = useState<Criterion>('encryption');
  const row = rows.find(item => item.key === selected) || rows[0];
  const index = rows.indexOf(row);
  const ar = locale === 'ar';
  const group = (key: Criterion) => privacyCriteria.includes(key) ? 'data' : key === 'portability' || key === 'limitations' ? 'choice' : 'people';
  const next = (offset: number) => setSelected(rows[(index + offset + rows.length) % rows.length].key);
  return <div className={styles.explorer} data-comparison-explorer>
    <nav className={styles.axisNav} aria-label={ar ? 'اختر محور المقارنة' : 'Choose a comparison criterion'}>
      <p>{ar ? 'شو الأهم إلك؟' : 'What matters to you?'}<small>{String(rows.length).padStart(2, '0')}</small></p>
      {rows.map((item, i) => <button key={item.key} data-comparison-criterion aria-pressed={row.key === item.key} aria-controls={`axis-panel-${app.id}`} onClick={() => setSelected(item.key)}>
        <span className={styles.axisNumber}>{String(i + 1).padStart(2, '0')}</span><span>{criteria[item.key][locale]}</span><span className={styles.axisDot} aria-hidden="true" />
      </button>)}
    </nav>
    <section id={`axis-panel-${app.id}`} className={styles.axisPanel} aria-label={criteria[row.key][locale]}>
      <div className={styles.axisTop}><span className={styles.axisSymbol}><StoryIcon kind={group(row.key)} /></span><span>{ar ? 'محور المقارنة' : 'COMPARISON CRITERION'}<b>{criteria[row.key][locale]}</b></span><small dir="ltr">{String(index + 1).padStart(2, '0')} / {String(rows.length).padStart(2, '0')}</small></div>
      <div className={styles.axisContent}>
        <h4>{criterionQuestions[row.key][locale]}</h4>
        <div className={styles.axisSides}>
          <article><div className={styles.axisIdentity}><AppLogo name={app.current} size={36} /><div><small>{ar ? 'التطبيق الحالي' : 'CURRENT APP'}</small><h5 dir="ltr">{app.current}</h5></div></div><p>{row.current[locale]}</p></article>
          <article><div className={styles.axisIdentity}><AppLogo name={app.name} size={36} /><div><small>{ar ? 'البديل المقترح' : 'ALTERNATIVE'}</small><h5 dir="ltr">{app.name}</h5></div></div><p>{row.alternative[locale]}</p></article>
        </div>
        <div className={styles.axisEvidence}><span>{ar ? 'اقرأ من المصدر' : 'READ THE SOURCES'}</span>{row.sources.map(number => <a href={app.sources[number].url} target="_blank" rel="noopener noreferrer" key={number}>{app.sources[number].name[locale]} ↗</a>)}</div>
      </div>
      <div className={styles.axisControls}><span>{ar ? 'قارن ما يناسبك، ثم جرّب خطوة.' : 'Compare what matters, then try one step.'}</span><div><button onClick={() => next(-1)} aria-label={ar ? 'المحور السابق' : 'Previous criterion'}>‹</button><button onClick={() => next(1)} aria-label={ar ? 'المحور التالي' : 'Next criterion'}>›</button></div></div>
    </section>
  </div>;
}
