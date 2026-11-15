'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { Locale } from '@/lib/fed3/config';
import { categories, type Alternative } from '@/lib/fed3/alternatives';
import { appIntroductions } from '@/lib/fed3/app-introductions';
import { appStart } from '@/lib/fed3/app-start';
import { PlainText } from './PlainText';
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
  const [hasAutoSwapped, setHasAutoSwapped] = useState(false);
  const autoSwapTimer = useRef<NodeJS.Timeout | null>(null);
  const userInteracted = useRef(false);
  const isHovered = useRef(false);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let intersects = false;
    const update = () => setVisible(intersects && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { intersects = entry.isIntersecting; update(); }, { threshold: 0.2 });
    observer.observe(element);
    document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);

  const index = Math.max(0, items.findIndex(item => item.id === selectedId));
  const app = items[index];
  const prevIndex = (index - 1 + items.length) % items.length;
  const nextIndex = (index + 1) % items.length;
  const prevApp = items[prevIndex];
  const nextApp = items[nextIndex];

  const select = (next: number, isManual = true) => {
    if (isManual) {
      userInteracted.current = true;
      if (autoSwapTimer.current) clearTimeout(autoSwapTimer.current);
    }
    setDirection(next >= index ? 1 : -1);
    onSelect(items[(next + items.length) % items.length].id);
  };

  useEffect(() => {
    if (!visible || hasAutoSwapped || userInteracted.current) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // After scrolling down and resting for a short moment (2.4 seconds), swap to the next card smoothly
    autoSwapTimer.current = setTimeout(() => {
      if (!userInteracted.current && !isHovered.current) {
        setHasAutoSwapped(true);
        select(index + 1, false);
      }
    }, 2400);

    return () => {
      if (autoSwapTimer.current) clearTimeout(autoSwapTimer.current);
    };
  }, [visible, hasAutoSwapped, index]);

  if (!app) return null;
  const intro = appIntroductions[app.id];
  const prevIntro = appIntroductions[prevApp.id];
  const nextIntro = appIntroductions[nextApp.id];

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0 || (event.target as Element).closest('a,button,[data-showcase-peek]')) return;
    drag.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    drag.current = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      select(index + (dx * (ar ? 1 : -1) > 0 ? 1 : -1));
    }
  };

  return (
    <div
      ref={root}
      className={styles.showcase}
      data-app-showcase
      data-active-app={app.id}
      data-in-view={visible}
      role="region"
      aria-roledescription={ar ? 'عارض تطبيقات' : 'carousel'}
      aria-label={ar ? 'التطبيقات البديلة' : 'Alternative apps'}
      tabIndex={0}
      onKeyDown={event => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          select(index + (event.key === 'ArrowRight' ? 1 : -1));
        }
      }}
      onMouseEnter={() => { isHovered.current = true; }}
      onMouseLeave={() => { isHovered.current = false; }}
    >
      <div className={styles.appList} role="group" aria-label={ar ? 'اختر تطبيقًا لعرضه' : 'Choose an app to explore'}>
        {items.map((item, i) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={i === index}
            aria-label={`${ar ? 'عرض' : 'Show'} ${item.name}`}
            onClick={() => select(i)}
          >
            <AppLogo name={item.name} size={27} />
            <bdi>{item.name}</bdi>
          </button>
        ))}
      </div>

      <div className={styles.viewer}>
        <div className={styles.controls}>
          <button type="button" aria-label={ar ? 'التطبيق السابق' : 'Previous app'} onClick={() => select(index - 1)}>
            ←
          </button>
          <span role="status" aria-live="polite" aria-atomic="true">
            <bdi>{String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</bdi>
            <span className="sr-only"> {app.name}</span>
          </span>
          <button type="button" aria-label={ar ? 'التطبيق التالي' : 'Next app'} onClick={() => select(index + 1)}>
            →
          </button>
        </div>

        <div
          className={styles.dragSurface}
          onPointerDown={startDrag}
          onPointerUp={endDrag}
          onPointerCancel={() => { drag.current = null; }}
        >
          <div className={styles.stage}>
            {/* Flanking Card: Previous (Right side in RTL, Left side in LTR) */}
            <aside
              className={`${styles.sideCard} ${styles.sideCardPrev}`}
              data-showcase-peek="prev"
              onClick={() => select(index - 1)}
              role="button"
              tabIndex={0}
              aria-label={`${ar ? 'الانتقال إلى' : 'Go to'} ${prevApp.name}`}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  select(index - 1);
                }
              }}
            >
              <div className={styles.sideVisual} aria-hidden="true">
                <div className={styles.sideVisualPair}>
                  <span className={styles.sideCurrentPlaque}>
                    <AppLogo name={prevApp.current} size={46} />
                    <small>{ar ? 'الحالي' : 'CURRENT'}</small>
                  </span>
                  <span className={styles.sideConnector}><DirectionalArrow /></span>
                  <span className={styles.sideLogoPlaque}>
                    <AppLogo name={prevApp.name} size={76} />
                    <small>{ar ? 'البديل' : 'ALT'}</small>
                  </span>
                </div>
              </div>
              <div className={styles.sideCopy}>
                <span className={styles.category}><i />{categories[prevApp.category][locale]}</span>
                <h4 className={styles.sideTitle} dir="ltr">{prevApp.name}</h4>
                <p className={styles.replacement}>
                  {ar ? 'بديل لـ' : 'An alternative to'} <AppLogo name={prevApp.current} size={18} /><bdi>{prevApp.current}</bdi>
                </p>
                <p className={styles.sideDescription}><PlainText text={appStart[prevApp.id].intro[locale]} /></p>
                <div className={styles.sideChips}>
                  {prevIntro.features.slice(0, 2).map((feature, fi) => (
                    <span key={fi} className={styles.sideChip}>
                      <span className={styles.featureChipDot} />
                      <span>{feature[locale]}</span>
                    </span>
                  ))}
                </div>
                <div className={styles.sidePeekAction}>
                  <span>{ar ? 'اضغط لعرض التطبيق' : 'Click to view app'}</span>
                  <DirectionalArrow />
                </div>
              </div>
            </aside>

            {/* Center Active Card */}
            <div className={styles.centerWrapper}>
              <article
                key={app.id}
                className={styles.appCard}
                data-showcase-card
                data-direction={direction}
                aria-labelledby={`showcase-${app.id}`}
              >
                <div className={styles.visual} aria-hidden="true">
                  <div className={styles.visualPair}>
                    <span className={styles.currentPlaque}>
                      <AppLogo name={app.current} size={58} />
                      <small>{ar ? 'التطبيق الحالي' : 'CURRENT APP'}</small>
                    </span>
                    <span className={styles.connector}><DirectionalArrow /></span>
                    <span className={styles.logoPlaque}>
                      <AppLogo name={app.name} size={105} />
                      <small>{ar ? 'البديل' : 'ALTERNATIVE'}</small>
                    </span>
                  </div>
                </div>

                <div className={styles.appCopy}>
                  <span className={styles.category}><i />{categories[app.category][locale]}</span>
                  <h3 id={`showcase-${app.id}`} dir="ltr">{app.name}</h3>
                  <p className={styles.replacement}>
                    {ar ? 'بديل لـ' : 'An alternative to'} <AppLogo name={app.current} size={20} /><bdi>{app.current}</bdi>
                  </p>

                  <p className={styles.description}>
                    <PlainText text={appStart[app.id].intro[locale]} />
                  </p>

                  <div className={styles.featureChips} aria-label={ar ? 'أبرز المزايا' : 'Key features'}>
                    {intro.features.map((feature, fi) => (
                      <span key={fi} className={styles.featureChip}>
                        <span className={styles.featureChipDot} aria-hidden="true" />
                        <span>{feature[locale]}</span>
                      </span>
                    ))}
                  </div>

                  <a className={styles.source} href={intro.source} target="_blank" rel="noopener noreferrer">
                    {ar ? 'تعرّف عليه من الموقع الرسمي' : 'Explore the official website'}
                    <DirectionalArrow />
                  </a>

                  <button
                    type="button"
                    className={styles.compare}
                    onClick={() => onCompare(app.id)}
                    aria-label={`${ar ? 'قارن الآن' : 'Compare now'}: ${app.name} / ${app.current}`}
                  >
                    {ar ? 'قارن مع تطبيقك الحالي' : 'Compare with your current app'}
                    <DirectionalArrow />
                  </button>

                  <p className={styles.downloadNote}>{appStart[app.id].note[locale]}</p><div className={styles.links}>
                    <a
                      href={app.download}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-download
                      aria-label={`${ar ? 'تنزيل التطبيق' : 'Download app'}: ${app.name}`}
                    >
                      <DownloadIcon />
                      {appStart[app.id].downloadLabel[locale]}
                    </a>
                    <Link
                      href={`/${locale}/apps/${app.id}/`}
                      aria-label={`${ar ? 'صفحة التطبيق' : 'App details'}: ${app.name}`}
                    >
                      {ar ? 'صفحة التطبيق' : 'App details'}
                      <DirectionalArrow />
                    </Link>
                  </div>
                </div>
              </article>
            </div>

            {/* Flanking Card: Next (Left side in RTL, Right side in LTR) */}
            <aside
              className={`${styles.sideCard} ${styles.sideCardNext}`}
              data-showcase-peek="next"
              onClick={() => select(index + 1)}
              role="button"
              tabIndex={0}
              aria-label={`${ar ? 'الانتقال إلى' : 'Go to'} ${nextApp.name}`}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  select(index + 1);
                }
              }}
            >
              <div className={styles.sideVisual} aria-hidden="true">
                <div className={styles.sideVisualPair}>
                  <span className={styles.sideCurrentPlaque}>
                    <AppLogo name={nextApp.current} size={46} />
                    <small>{ar ? 'الحالي' : 'CURRENT'}</small>
                  </span>
                  <span className={styles.sideConnector}><DirectionalArrow /></span>
                  <span className={styles.sideLogoPlaque}>
                    <AppLogo name={nextApp.name} size={76} />
                    <small>{ar ? 'البديل' : 'ALT'}</small>
                  </span>
                </div>
              </div>
              <div className={styles.sideCopy}>
                <span className={styles.category}><i />{categories[nextApp.category][locale]}</span>
                <h4 className={styles.sideTitle} dir="ltr">{nextApp.name}</h4>
                <p className={styles.replacement}>
                  {ar ? 'بديل لـ' : 'An alternative to'} <AppLogo name={nextApp.current} size={18} /><bdi>{nextApp.current}</bdi>
                </p>
                <p className={styles.sideDescription}><PlainText text={appStart[nextApp.id].intro[locale]} /></p>
                <div className={styles.sideChips}>
                  {nextIntro.features.slice(0, 2).map((feature, fi) => (
                    <span key={fi} className={styles.sideChip}>
                      <span className={styles.featureChipDot} />
                      <span>{feature[locale]}</span>
                    </span>
                  ))}
                </div>
                <div className={styles.sidePeekAction}>
                  <span>{ar ? 'اضغط لعرض التطبيق' : 'Click to view app'}</span>
                  <DirectionalArrow />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
