'use client';
import { useState } from 'react';
import { criteria, type Alternative } from '@/lib/fed3/alternatives';
import type { Locale } from '@/lib/fed3/config';
import { FeatureIcon } from '@/components/shared/FeatureIcon';
import { AppLogo } from './AppLogo';
import styles from './alternatives.module.css';

export function AppFacts({ app, locale }: { app: Alternative; locale: Locale }) {
  const [group, setGroup] = useState('data');
  const ar = locale === 'ar';
  const keys = group === 'data' ? ['encryption', 'collection', 'control'] : ['features', 'platforms', 'cost'];
  return <section id="app-facts" className={styles.factsSection} tabIndex={-1}>
    <div className={styles.factsHeader}><div><p className={styles.eyebrow}>{ar ? 'داخل التطبيق' : 'INSIDE THE APP'}</p><h2>{ar ? 'تعرّف على التطبيق' : 'Get to know the app'}</h2></div><span className={styles.factsBrand}><AppLogo name={app.name} size={30} /><bdi>{app.name}</bdi></span></div>
    <div className={styles.factsTabs} role="group" aria-label={ar ? 'معلومات التطبيق' : 'App information'}><button aria-pressed={group === 'data'} onClick={() => setGroup('data')}><FeatureIcon name="encryption" size={18} />{ar ? 'بياناتك وخصوصيتك' : 'Your data & privacy'}<small>03</small></button><button aria-pressed={group === 'daily'} onClick={() => setGroup('daily')}><FeatureIcon name="platforms" size={18} />{ar ? 'استخدامك اليومي' : 'Everyday use'}<small>03</small></button></div>
    <div className={styles.factFeatures}>{app.rows.filter(row => keys.includes(row.key)).map((row, i) => <article key={row.key} data-app-fact>
      <div className={styles.featureTop}><span><FeatureIcon name={row.key} size={29} /></span><small dir="ltr">0{i + 1}</small></div>
      <h3>{criteria[row.key][locale]}</h3><p>{row.alternative[locale]}</p>
      <div className={styles.featureSources}><span>{ar ? 'من المصدر' : 'SOURCES'}</span>{row.sources.map(n => <a key={n} href={app.sources[n].url} target="_blank" rel="noopener noreferrer" aria-label={app.sources[n].name[locale]}>[{n + 1}]</a>)}</div>
    </article>)}</div>
  </section>;
}
