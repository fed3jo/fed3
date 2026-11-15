'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { alternatives, type Criterion } from '@/lib/fed3/alternatives';
import { comparisonGroups, type ComparisonGroupId } from '@/lib/fed3/comparison-layout';
import { fed3, type Locale } from '@/lib/fed3/config';
import styles from './alternatives.module.css';
import { JourneyNavigation } from '@/components/shared/JourneyNavigation';
import { SmoothScrolling } from './SmoothScrolling';
import { AlternativesHeader } from './AlternativesHeader';
import { ComparisonPanel } from './ComparisonPanel';
import { GameLauncher } from '@/components/game/GameLauncher';
import { AlternativesIntro } from './AlternativesIntro';
import { AlternativeShowcase } from './AlternativeShowcase';
import redesign from './showcase.module.css';
import comparisonStyles from './comparison.module.css';

const copy = {
  ar: {
    skip: 'انتقل إلى المحتوى', catalogEyebrow: '01 / اكتشف', catalogTitle: 'تعرّف على التطبيقات البديلة.',
    footer: 'بياناتك. قرارك.', footerNote: 'Fed3 من مبادرة السيادة الرقمية', top: 'إلى الأعلى', motion: 'تقليل الحركة',
    copied: 'تم نسخ الرابط', copyFailed: 'تعذّر النسخ. انسخ الرابط من شريط العنوان.',
  },
  en: {
    skip: 'Skip to content', catalogEyebrow: '01 / Discover', catalogTitle: 'Explore the alternatives.',
    footer: 'Your data. Your decision.', footerNote: 'Fed3, a Digital Sovereignty Initiative', top: 'Back to top', motion: 'Reduce motion',
    copied: 'Link copied', copyFailed: 'Could not copy. Copy the link from your address bar.',
  },
};

export function AlternativesPage({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const other = locale === 'ar' ? 'en' : 'ar';
  const [selectedId, setSelectedId] = useState('signal');
  const [openGroup, setOpenGroup] = useState<ComparisonGroupId>('privacy');
  const [activeCriterion, setActiveCriterion] = useState<Criterion>('encryption');
  const [reduced, setReduced] = useState(false);
  const [systemReduced, setSystemReduced] = useState(false);
  const [shareState, setShareState] = useState('');
  const comparison = useRef<HTMLElement>(null);
  const app = alternatives.find(item => item.id === selectedId) || alternatives[0];
  const calm = reduced || systemReduced;

  useEffect(() => {
    const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setSystemReduced(motionQuery.matches);
    update(); motionQuery.addEventListener('change', update);
    try { setReduced(localStorage.getItem('fed3-reduced-motion') === 'true'); } catch { /* Preferences are optional. */ }
    const readUrl = () => {
      const params = new URLSearchParams(location.search);
      const id = params.get('app');
      setSelectedId(alternatives.some(item => item.id === id) ? id! : 'signal');
      const group = params.get('group');
      const selectedGroup = comparisonGroups.find(item => item.id === group) ?? comparisonGroups[0];
      setOpenGroup(selectedGroup.id);
      const topic = params.get('criterion');
      setActiveCriterion(selectedGroup.criteria.find(key => key === topic) ?? selectedGroup.criteria[0]);
      setShareState('');
    };
    readUrl(); window.addEventListener('popstate', readUrl);
    return () => { motionQuery.removeEventListener('change', update); window.removeEventListener('popstate', readUrl); };
  }, []);

  const scrollTo = (target: HTMLElement) => {
    const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - 124);
    if (!calm && window.fed3Lenis) window.fed3Lenis.scrollTo(top, { duration: 1.4 });
    else window.scrollTo({ top, behavior: calm ? 'instant' : 'smooth' });
  };
  const anchorClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as Element).closest('a[href^="#"]');
    if (!anchor) return;
    const hash = anchor.getAttribute('href')!;
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    event.preventDefault(); history.pushState(null, '', hash); scrollTo(target);
    target.focus({ preventScroll: true });
  };
  const updateUrl = (id: string, group: ComparisonGroupId, hash?: string, criterion?: Criterion) => {
    const url = new URL(location.href);
    url.searchParams.set('app', id);
    url.searchParams.set('group', group);
    url.searchParams.set('criterion', criterion ?? comparisonGroups.find(item => item.id === group)!.criteria[0]);
    url.searchParams.delete('view');
    if (hash) url.hash = hash;
    history.replaceState(null, '', url);
    setShareState('');
  };
  const choose = (id: string) => {
    setSelectedId(id); setOpenGroup('privacy'); setActiveCriterion('encryption'); updateUrl(id, 'privacy', '#comparison');
    if (comparison.current) scrollTo(comparison.current);
    comparison.current?.focus({ preventScroll: true });
  };
  const share = async () => {
    updateUrl(app.id, openGroup, '#comparison', activeCriterion);
    try { await navigator.clipboard.writeText(location.href); setShareState(c.copied); }
    catch { setShareState(c.copyFailed); }
  };
  const localeUrl = `/${other}/alternatives/?app=${app.id}&group=${openGroup}&criterion=${activeCriterion}`;

  return <div className={`${styles.page} ${redesign.page}`} data-motion={calm ? 'reduced' : 'full'} onClick={anchorClick}>
    <SmoothScrolling enabled={!calm} />
    <a className={styles.skip} href="#alternatives-main">{c.skip}</a>
    <AlternativesHeader locale={locale} languageHref={localeUrl} inDirectory homeStyle />
    <main id="alternatives-main" tabIndex={-1}>
      <AlternativesIntro locale={locale} reduceMotion={calm} explore={() => {
        const catalog = document.getElementById('catalog');
        if (catalog) { history.pushState(null, '', '#catalog'); scrollTo(catalog); catalog.focus({ preventScroll: true }); }
      }} />
      <div className={redesign.content}>
        <section id="catalog" tabIndex={-1} className={styles.catalog}>
          <div className={redesign.catalogHeading}><p>{c.catalogEyebrow}</p><h2>{c.catalogTitle}</h2></div>
          <AlternativeShowcase locale={locale} items={alternatives} selectedId={selectedId}
            onSelect={id => { setSelectedId(id); setOpenGroup('privacy'); setActiveCriterion('encryption'); updateUrl(id, 'privacy'); }} onCompare={choose} />
        </section>
        <section id="comparison" ref={comparison} tabIndex={-1} className={comparisonStyles.section} aria-labelledby="comparison-heading">
          <ComparisonPanel key={app.id} locale={locale} app={app} openGroup={openGroup} activeCriterion={activeCriterion} onGroupChange={id => {
            if (id === openGroup) return;
            setOpenGroup(id);
            const first = comparisonGroups.find(group => group.id === id)!.criteria[0];
            setActiveCriterion(first); updateUrl(app.id, id, undefined, first);
          }} onCriterionChange={id => { setActiveCriterion(id); updateUrl(app.id, openGroup, undefined, id); }} onSelect={choose} onShare={share} shareStatus={shareState} />
        </section>
        <GameLauncher locale={locale} />
        <JourneyNavigation locale={locale} current="alternatives" currentHref="#catalog" />
      </div>
    </main>
    <footer className={styles.footer}>
      <div><Link href={fed3.routes[locale].home} className={styles.footerBrand}>Fed3<span>.</span></Link><p>{c.footerNote}</p></div>
      <p className={styles.footerStatement}>{c.footer}</p>
      <a href="#alternatives-main">{c.top}<span aria-hidden="true">↑</span></a>
      <div className={redesign.footerTools}><button className={styles.motion} aria-pressed={calm} disabled={systemReduced} onClick={() => {
        const next = !reduced; setReduced(next);
        try { localStorage.setItem('fed3-reduced-motion', String(next)); } catch { /* Optional preference. */ }
      }}><span className={styles.tinySwitch} />{c.motion}</button></div>
      <p className={styles.localNote}>{locale === 'ar' ? 'نحفظ تفضيل الحركة واللغة محليًا على جهازك.' : 'Motion and language preferences are saved locally on your device.'}</p>
    </footer>
  </div>;
}
