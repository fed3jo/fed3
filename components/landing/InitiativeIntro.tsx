'use client';
import { useId, type ReactNode } from 'react';
import type { Locale, Station } from '@/lib/fed3/config';
import type { Messages } from '@/lib/fed3/messages';
import { InitiativeIdentity } from './InitiativeIdentity';
import { HeroJourney } from './HeroJourney';
import { alternativesHeroVideo } from '@/lib/fed3/videos';
import styles from './home-intro.module.css';

const divider = 'M430 0 C411 22 443 38 423 65 C407 90 441 116 422 145 C403 175 445 204 420 234 C396 260 367 277 376 310 C381 340 348 382 327 411 C301 446 278 459 246 460 C214 461 192 501 172 523 C149 550 124 560 102 578 C74 600 39 609 0 588';

export function InitiativeIntro({ locale, messages, ready, explore, identity, variant = 'initiative', reduceMotion = false }: { locale: Locale; messages: Messages; ready: boolean; explore: (station?: Station) => void; identity?: ReactNode; variant?: 'initiative' | 'alternatives'; reduceMotion?: boolean }) {
  const ar = locale === 'ar';
  const alternatives = variant === 'alternatives';
  const clipId = `journey-${useId().replace(/:/g, '')}`;
  return <section className={styles.intro} data-home-intro data-intro-variant={variant} data-locale={locale} data-ready={ready} aria-labelledby="identity-heading">
    <div className={styles.emptySpace} data-hero-empty-space>
        <svg className={styles.separator} data-hero-separator viewBox="0 0 1000 620" preserveAspectRatio="none" focusable="false" aria-hidden="true">
          <defs><clipPath id={clipId} clipPathUnits="objectBoundingBox"><path d={`${divider} V0 Z`} transform={ar ? 'scale(.001 .00161290322580645)' : 'translate(1 0) scale(-.001 .00161290322580645)'} /></clipPath></defs>
          <path className={styles.surface} d={`${divider} V0 Z`} />
          <path className={styles.dividerLine} d={divider} />
        </svg>
        <svg className={styles.mobileSeparator} data-hero-separator viewBox="0 0 400 140" preserveAspectRatio="none" focusable="false" aria-hidden="true">
          <defs><clipPath id={`${clipId}-mobile`} clipPathUnits="objectBoundingBox"><path d="M0 36 C42 45 71 19 110 25 S172 38 211 19 S273 20 311 10 S365 15 400 0 V140 H0 Z" transform={ar ? 'scale(.0025 .00714285714285714)' : 'translate(1 0) scale(-.0025 .00714285714285714)'} /></clipPath></defs>
          <path className={styles.surface} d="M0 36 C42 45 71 19 110 25 S172 38 211 19 S273 20 311 10 S365 15 400 0 V140 H0 Z" />
          <path className={styles.dividerLine} d="M0 36 C42 45 71 19 110 25 S172 38 211 19 S273 20 311 10 S365 15 400 0" />
        </svg>
        <HeroJourney locale={locale} clipId={clipId} media={alternatives ? alternativesHeroVideo : undefined} label={alternatives ? ar ? 'تطبيقات البدائل الرقمية' : 'Digital alternative apps' : undefined} reduceMotion={reduceMotion} />
    </div>
    <div className={styles.stage}>
      <div className={styles.overview} dir={ar ? 'rtl' : 'ltr'}>
        {identity ?? <InitiativeIdentity locale={locale} ready={ready} />}
        <div className={styles.exploreWrap}><button className={styles.explore} onClick={() => explore('alternatives')}><span>{alternatives ? ar ? 'استكشف التطبيقات' : 'Explore the apps' : ar ? 'استكشف المحطات' : 'Explore the stations'}</span><span aria-hidden="true">{ar ? '↙' : '↘'}</span></button><span className={styles.scrollHint}>{messages.scroll}</span></div>
      </div>
    </div>
    <div className={styles.bottom}>
      <div className={styles.location}><i />{alternatives ? ar ? 'المحطة الأولى / البدائل الرقمية' : 'STATION ONE / DIGITAL ALTERNATIVES' : ar ? 'من عمّان، الأردن' : 'FROM AMMAN, JORDAN'}</div>
      <p>{alternatives ? ar ? 'تعرّف، قارن، ثم جرّب ما يناسبك.' : 'Explore, compare, then try what suits you.' : ar ? 'مبادرة من متطوعي برنامج اليافعين في مؤسسة رواد التنمية.' : 'An initiative by youth-program volunteers at Ruwwad Al Tanmeya.'}</p>
      <span className={styles.edition} dir="ltr">{alternatives ? 'FED3 · 05 APPS' : 'FED3 · 01 / 03'}</span>
    </div>
  </section>;
}
