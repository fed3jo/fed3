'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { Locale } from '@/lib/fed3/config';
import { categories, type Alternative } from '@/lib/fed3/alternatives';
import { appIntroductions } from '@/lib/fed3/app-introductions';
import { AppLogo } from './AppLogo';
import { DirectionalArrow, DownloadIcon } from './DirectionalArrow';
import styles from './showcase.module.css';

export function AlternativeShowcase({ locale, items, selectedId, onSelect, onCompare }: {
  locale: Locale; items: Alternative[]; selectedId: string; onSelect: (id: string) => void; onCompare: (id: string) => void;
}) {
  const ar = locale === 'ar';
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [direction, setDirection] = useState(1);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let intersects = false;
    const update = () => setVisible(intersects && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { intersects = entry.isIntersecting; update(); });
    observer.observe(element);
    document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);
  const index = Math.max(0, items.findIndex(item => item.id === selectedId));
  const app = items[index];
  if (!app) return null;
  const intro = appIntroductions[app.id];
  const select = (next: number) => {
    setDirection(next >= index ? 1 : -1);
    onSelect(items[(next + items.length) % items.length].id);
  };
  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0 || (event.target as Element).closest('a,button')) return;
    drag.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    drag.current = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.25) select(index + (dx * (ar ? 1 : -1) > 0 ? 1 : -1));
  };

  return <div ref={root} className={styles.showcase} data-app-showcase data-active-app={app.id} data-in-view={visible} role="region" aria-roledescription={ar ? 'عارض تطبيقات' : 'carousel'} aria-label={ar ? 'التطبيقات البديلة' : 'Alternative apps'} tabIndex={0}
    onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); select(index + (event.key === 'ArrowRight' ? 1 : -1)); } }}>
      <div className={styles.appList} role="group" aria-label={ar ? 'اختر تطبيقًا لعرضه' : 'Choose an app to explore'}>
        {items.map((item, i) => <button type="button" key={item.id} aria-pressed={i === index} aria-label={`${ar ? 'عرض' : 'Show'} ${item.name}`} onClick={() => select(i)}>
          <AppLogo name={item.name} size={27} /><bdi>{item.name}</bdi>
        </button>)}
      </div>
    <div className={styles.viewer}>
      <div className={styles.controls}>
        <button type="button" aria-label={ar ? 'التطبيق السابق' : 'Previous app'} onClick={() => select(index - 1)}>←</button>
        <span role="status" aria-live="polite" aria-atomic="true"><bdi>{String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</bdi><span className="sr-only"> {app.name}</span></span>
        <button type="button" aria-label={ar ? 'التطبيق التالي' : 'Next app'} onClick={() => select(index + 1)}>→</button>
      </div>
      <div className={styles.dragSurface} onPointerDown={startDrag} onPointerUp={endDrag} onPointerCancel={() => { drag.current = null; }}>
        <article key={app.id} className={styles.appCard} data-showcase-card data-direction={direction} aria-labelledby={`showcase-${app.id}`}>
          <div className={styles.visual} aria-hidden="true">
            <div className={styles.visualPair}>
              <span className={styles.currentPlaque}><AppLogo name={app.current} size={58} /><small>{ar ? 'التطبيق الحالي' : 'CURRENT APP'}</small></span>
              <span className={styles.connector}><DirectionalArrow /></span>
              <span className={styles.logoPlaque}><AppLogo name={app.name} size={105} /><small>{ar ? 'البديل' : 'ALTERNATIVE'}</small></span>
            </div>
          </div>
          <div className={styles.appCopy}>
            <span className={styles.category}><i />{categories[app.category][locale]}</span>
            <h3 id={`showcase-${app.id}`} dir="ltr">{app.name}</h3>
            <p className={styles.replacement}>{ar ? 'بديل لـ' : 'An alternative to'} <AppLogo name={app.current} size={20} /><bdi>{app.current}</bdi></p>
            <p className={styles.description}>{intro.description[locale]}</p>
            <a className={styles.source} href={intro.source} target="_blank" rel="noopener noreferrer">{ar ? 'تعرّف عليه من الموقع الرسمي' : 'Explore the official website'}<DirectionalArrow /></a>
            <button type="button" className={styles.compare} onClick={() => onCompare(app.id)} aria-label={`${ar ? 'قارن الآن' : 'Compare now'}: ${app.name} / ${app.current}`}>{ar ? 'قارن مع تطبيقك الحالي' : 'Compare with your current app'}<DirectionalArrow /></button>
            <div className={styles.links}>
              <a href={app.download} target="_blank" rel="noopener noreferrer" data-download aria-label={`${ar ? 'تنزيل التطبيق' : 'Download app'}: ${app.name}`}><DownloadIcon />{ar ? 'تنزيل التطبيق' : 'Download app'}</a>
              <Link href={`/${locale}/apps/${app.id}/`} aria-label={`${ar ? 'صفحة التطبيق' : 'App details'}: ${app.name}`}>{ar ? 'صفحة التطبيق' : 'App details'}<DirectionalArrow /></Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>;
}
