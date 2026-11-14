'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { alternatives, categories, criteria, privacyCriteria, reviewDate, type Category, type Copy } from '@/lib/fed3/alternatives';
import { fed3, type Locale } from '@/lib/fed3/config';
import styles from './alternatives.module.css';
import { JourneyNavigation } from '@/components/shared/JourneyNavigation';
import { AppLogo } from './AppLogo';
import { SmoothScrolling } from './SmoothScrolling';
import { AlternativesHeader } from './AlternativesHeader';
import { DirectionalArrow, DownloadIcon } from './DirectionalArrow';
import { ComparisonExplorer } from './ComparisonExplorer';
import { GameLauncher } from '@/components/game/GameLauncher';
import { AlternativesIntro } from './AlternativesIntro';
import { AlternativeShowcase } from './AlternativeShowcase';
import redesign from './showcase.module.css';

type View = 'all' | 'privacy';
const copy = {
  ar: {
    home: 'الرئيسية', directory: 'دليل البدائل', compare: 'المقارنة', game: 'اللعبة', language: 'English', languageLabel: 'Switch to English',
    eyebrow: 'المحطة الأولى / البدائل الرقمية', title: 'نفس احتياجك.', titleAccent: 'خيارات أكثر لبياناتك.',
    lead: 'ابدأ بالتطبيق الذي تستخدمه. تعرّف على بديله، وقارن الخصوصية والمزايا والحدود، ثم جرّب خطوة تناسبك.',
    explore: 'اكتشف البدائل', gameLink: 'العب بكرا الافتتاح', heroNote: 'اختيار أوضح يبدأ بفهم ما تشاركه.',
    heroOld: 'التطبيق الذي تعرفه', heroNew: 'خيارك التالي', data: 'بياناتك', decision: 'قرارك', five: '05', tools: 'بدائل مختارة', dimensions: '10', dimensionsLabel: 'محاور للمقارنة', languages: 'AR / EN', languagesLabel: 'بلغتك، وبوضوح',
    catalogEyebrow: '01 / اكتشف', catalogTitle: 'تعرّف على التطبيقات البديلة.', catalogLead: 'تصفّح التطبيقات، تعرّف على البديل وما يستبدله، ثم افتح المقارنة لتختار ما يناسبك.',
    search: 'ابحث باسم التطبيق أو البديل', searchHint: 'مثل: واتساب، Gmail، تخزين…', all: 'الكل', results: 'نتائج', noResults: 'لم نجد تطبيقًا بهذا الاسم.', reset: 'مسح البحث والفلاتر', replacement: 'بديل لـ', openCompare: 'قارن الآن', selected: 'المقارنة المفتوحة',
    compareEyebrow: '02 / قارن قبل أن تختار', compareTitle: 'التفاصيل تصنع فرقًا.', compareLead: 'مقارنة للإصدارات الشخصية الشائعة، مع توضيح الحالات التي تحتاج إعدادًا أو خطة مختلفة.', current: 'التطبيق الحالي', alternative: 'البديل المقترح', vs: 'مقابل', gain: 'ما الذي تكسبه؟', tradeoff: 'ما الذي تحتاج معرفته؟', allCriteria: 'كل المحاور', privacyOnly: 'الخصوصية والبيانات', share: 'نسخ رابط المقارنة', copied: 'تم نسخ الرابط', copyFailed: 'تعذّر النسخ. انسخ الرابط من شريط العنوان.', criterion: 'محور المقارنة', sources: 'المصادر الرسمية', reviewed: 'مراجعة المصادر', sourceNote: 'المعلومات أدناه مستندة إلى وثائق الناشرين، وليست تدقيقًا أمنيًا مستقلًا. قد تختلف الخصائص بحسب الإصدار والخطة والمنطقة.',
    guideEyebrow: '03 / جرّب خطوة', guideTitle: 'ابدأ بتجربة صغيرة.', download: 'افتح الموقع الرسمي', guideNote: 'الرابط يفتح موقع الناشر. Fed3 لا ينقل حسابك أو ملفاتك نيابةً عنك.', cloud: 'تعرّف على Home-Cloud',
    gameEyebrow: 'التجربة التفاعلية', soon: 'قريبًا', gameTitle: 'قرارك التالي', gameDescription: 'ماذا تكشف أذونات تطبيق؟ وما الذي تحكيه صورة؟ تجربة قادمة بقرارات وشخصيات افتراضية تساعدك تفهم أثر المشاركة.', gameOne: 'أذونات التطبيق', gameTwo: 'صورة قبل النشر', gameThree: 'أثر يبقى بعد الحذف', gameNote: 'اللعبة قيد الإعداد. يمكنك استكشاف البدائل والمقارنة الآن.',
    methodTitle: 'كيف تقرأ هذه المقارنة؟', methodOne: 'التشفير يحمي المحتوى ضمن نطاق محدد، ولا يمنع كل جمع للبيانات الوصفية.', methodTwo: 'الاستضافة الذاتية تمنحك اختيار المشغّل، وتنقل إليك مسؤولية الصيانة والنسخ والاستعادة.', methodThree: 'لا توجد درجة أمان واحدة تناسب الجميع. اختبر ما تحتاجه قبل نقل بياناتك المهمة.',
    footer: 'بياناتك. قرارك.', footerNote: 'Fed3 من مبادرة السيادة الرقمية', top: 'إلى الأعلى', privacyNote: 'البحث والفلاتر يعملان على جهازك. نحفظ تفضيل الحركة واللغة محليًا فقط.',
    motion: 'تقليل الحركة', skip: 'انتقل إلى المحتوى', choosePair: 'اختر المقارنة', pairHint: 'التطبيق الحالي وبديله في مكان واحد', overview: 'نظرة سريعة', detailed: 'مقارنة تفصيلية', showDetails: 'اعرض المقارنة كجدول', hideDetails: 'أخفِ الجدول', sourceCount: 'المراجع',
    getApp: 'تنزيل التطبيق', appPage: 'صفحة التطبيق', publisher: 'من المصدر الرسمي', journeyTitle: 'كمّل رحلتك مع Fed3.', journeyLead: 'استكشف السحابة المحلية والمجتمعات، أو ارجع إلى بداية الرحلة.', returnHome: 'العودة إلى الرئيسية', stationsLabel: 'محطات المبادرة', here: 'أنت هنا', stationAction: 'استكشف المحطة', nextcloudNote: 'على صفحة Nextcloud، اختر تطبيق جهازك للمزامنة، أو راجع Home-Cloud إذا كنت تجهّز خادمًا.',
  },
  en: {
    home: 'Home', directory: 'Alternatives', compare: 'Compare', game: 'The game', language: 'العربية', languageLabel: 'التبديل إلى العربية',
    eyebrow: 'Station one / Digital alternatives', title: 'Same needs.', titleAccent: 'More choice for your data.',
    lead: 'Start with an app you use. Explore an alternative, compare privacy, features and limitations, then try a step that works for you.',
    explore: 'Explore alternatives', gameLink: 'Play Opening Tomorrow', heroNote: 'A clearer choice starts with what you share.',
    heroOld: 'The app you know', heroNew: 'Your next option', data: 'Your data', decision: 'Your decision', five: '05', tools: 'Selected alternatives', dimensions: '10', dimensionsLabel: 'Comparison criteria', languages: 'AR / EN', languagesLabel: 'In your language',
    catalogEyebrow: '01 / Discover', catalogTitle: 'Explore the alternatives.', catalogLead: 'Browse each app, see what it replaces, then compare the details to find what suits you.',
    search: 'Search by app or alternative', searchHint: 'Try: WhatsApp, Gmail, storage…', all: 'All', results: 'results', noResults: 'No matching apps found.', reset: 'Clear search and filters', replacement: 'Alternative to', openCompare: 'Compare now', selected: 'Open comparison',
    compareEyebrow: '02 / Compare before choosing', compareTitle: 'The details make a difference.', compareLead: 'A comparison of common personal editions, with conditions that require a different setup or plan made explicit.', current: 'Current app', alternative: 'Suggested alternative', vs: 'vs', gain: 'What do you gain?', tradeoff: 'What should you know?', allCriteria: 'All criteria', privacyOnly: 'Privacy & data', share: 'Copy comparison link', copied: 'Link copied', copyFailed: 'Could not copy. Copy the link from your address bar.', criterion: 'Criterion', sources: 'Official sources', reviewed: 'Sources reviewed', sourceNote: 'The information below is based on publisher documentation, not an independent security audit. Features may vary by version, plan and region.',
    guideEyebrow: '03 / Take a step', guideTitle: 'Start with a small test.', download: 'Open official website', guideNote: 'This link opens the publisher’s site. Fed3 does not move your account or files for you.', cloud: 'Discover Home-Cloud',
    gameEyebrow: 'The interactive experience', soon: 'Coming soon', gameTitle: 'Your next decision', gameDescription: 'What do app permissions reveal? What can a photo tell? An upcoming experience uses fictional characters and choices to explain the effects of sharing.', gameOne: 'App permissions', gameTwo: 'Before posting a photo', gameThree: 'Traces after deletion', gameNote: 'The game is in development. Explore alternatives and comparisons now.',
    methodTitle: 'How to read this comparison', methodOne: 'Encryption protects content within a defined scope. It does not prevent all metadata collection.', methodTwo: 'Self-hosting lets you choose the operator and makes you responsible for maintenance, backups and recovery.', methodThree: 'There is no single security score for everyone. Test your needs before moving important data.',
    footer: 'Your data. Your decision.', footerNote: 'Fed3, a Digital Sovereignty Initiative', top: 'Back to top', privacyNote: 'Search and filters run on your device. Motion and language preferences are stored locally only.',
    motion: 'Reduce motion', skip: 'Skip to content', choosePair: 'Choose a comparison', pairHint: 'Your current app and its alternative, together', overview: 'At a glance', detailed: 'Detailed comparison', showDetails: 'View comparison table', hideDetails: 'Hide table', sourceCount: 'Sources',
    getApp: 'Download app', appPage: 'App details', publisher: 'From the official publisher', journeyTitle: 'Continue your Fed3 journey.', journeyLead: 'Explore local storage and communities, or return to the start of the journey.', returnHome: 'Back to home', stationsLabel: 'Initiative stations', here: 'You are here', stationAction: 'Explore station', nextcloudNote: 'On Nextcloud’s page, choose your device’s sync client, or review Home-Cloud if you are setting up a server.',
  },
};

function Icon({ name }: { name: 'arrow' | 'search' | 'shield' | 'link' | 'check' | 'data' | 'server' | 'settings' | 'globe' }) {
  const paths = {
    arrow: <path d="M5 19 19 5M5 5h14v14" />,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
    data: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v7c0 4 16 4 16 0V5M4 12v7c0 4 16 4 16 0v-7" /></>,
    server: <><rect x="3" y="3" width="18" height="7" rx="2" /><rect x="3" y="14" width="18" height="7" rx="2" /><path d="M7 6.5h.01M7 17.5h.01M12 10v4" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m9 3-1 3-3 1 1 3-2 2 2 2-1 3 3 1 1 3h6l1-3 3-1-1-3 2-2-2-2 1-3-3-1-1-3Z" /></>,
    globe: <><circle cx="12" cy="12" r="8.3" /><path d="M3.7 12h16.6M12 3.7c4 4.3 4 12.3 0 16.6-4-4.3-4-12.3 0-16.6Z" /></>,
    shield: <><path d="m12 3 8 3v5c0 5-8 10-8 10S4 16 4 11V6Z" /><path d="m8.5 11.5 2.5 2.5 4.5-5" /></>,
    link: <><path d="m10 14 4-4m-5 7-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2-2 2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 0)" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const aliases: Record<string, string> = { signal: 'سيغنال سيجنال واتساب واتس اب محادثات', brave: 'بريف برايف كروم متصفح', 'proton-mail': 'بروتون جيميل ايميل إيميل', nextcloud: 'نكست كلاود نكستكلاود درايف سحابة ملفات', onlyoffice: 'اونلي أوفيس أونلي اوفيس دوكس مستندات' };

export function AlternativesPage({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const other = locale === 'ar' ? 'en' : 'ar';
  const pick = (value: Copy) => value[locale];
  const [selectedId, setSelectedId] = useState('signal');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<View>('all');
  const [expanded, setExpanded] = useState(false);
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
    try {
      setReduced(localStorage.getItem('fed3-reduced-motion') === 'true');
    } catch { /* Preferences are optional when browser storage is unavailable. */ }
    const readUrl = () => {
      const params = new URLSearchParams(location.search);
      const id = params.get('app');
      setSelectedId(alternatives.some(item => item.id === id) ? id! : 'signal');
      setView(params.get('view') === 'privacy' ? 'privacy' : 'all');
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

  const updateUrl = (id: string, nextView: View, hash?: string) => {
    const url = new URL(location.href); url.searchParams.set('app', id);
    if (hash) url.hash = hash;
    if (nextView === 'privacy') url.searchParams.set('view', nextView); else url.searchParams.delete('view');
    history.replaceState(null, '', url);
    setShareState('');
  };
  const choose = (id: string) => {
    setSelectedId(id); setExpanded(false); updateUrl(id, view, '#comparison');
    if (comparison.current) scrollTo(comparison.current);
    comparison.current?.focus({ preventScroll: true });
  };
  const share = async () => {
    updateUrl(app.id, view, '#comparison');
    try { await navigator.clipboard.writeText(location.href); setShareState(c.copied); }
    catch { setShareState(c.copyFailed); }
  };
  const normalized = query.toLocaleLowerCase().trim();
  const filtered = alternatives.filter(item => (category === 'all' || item.category === category) && `${item.name} ${item.current} ${categories[item.category].ar} ${categories[item.category].en} ${aliases[item.id]}`.toLocaleLowerCase().includes(normalized));
  const rows = app.rows.filter(row => view === 'all' || privacyCriteria.includes(row.key));
  const spotlights = app.rows.filter(row => ['encryption', 'collection', 'control'].includes(row.key));
  const localeUrl = `/${other}/alternatives/?app=${app.id}${view === 'privacy' ? '&view=privacy' : ''}`;

  return <div className={`${styles.page} ${redesign.page}`} data-motion={calm ? 'reduced' : 'full'} onClick={anchorClick}>
    <SmoothScrolling enabled={!calm} />
    <a className={styles.skip} href="#alternatives-main">{c.skip}</a>
    <AlternativesHeader locale={locale} languageHref={localeUrl} inDirectory homeStyle />

    <main id="alternatives-main" tabIndex={-1}>
      <AlternativesIntro locale={locale} explore={() => {
        const catalog = document.getElementById('catalog');
        if (catalog) { history.pushState(null, '', '#catalog'); scrollTo(catalog); catalog.focus({ preventScroll: true }); }
      }} />
      <div className={redesign.content}>
      <section id="catalog" tabIndex={-1} className={styles.catalog}>
        <p className={styles.eyebrow}>{c.catalogEyebrow}</p><div className={styles.sectionHeading}><h2>{c.catalogTitle}</h2><p>{c.catalogLead}</p></div>
        <div className={styles.filters}><label className={styles.search}><Icon name="search" /><span className="sr-only">{c.search}</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={c.searchHint} /></label><div className={styles.categories} role="group" aria-label={locale === 'ar' ? 'فئة التطبيق' : 'App category'}><button aria-pressed={category === 'all'} onClick={() => setCategory('all')}>{c.all}</button>{(Object.keys(categories) as Category[]).map(key => <button key={key} aria-pressed={category === key} onClick={() => setCategory(key)}>{pick(categories[key])}</button>)}</div></div>
        <div className={redesign.catalogTools}><p role="status" aria-live="polite">{filtered.length} / 5 {c.results}</p><button className={styles.motion} aria-pressed={calm} disabled={systemReduced} onClick={() => { const next = !reduced; setReduced(next); try { localStorage.setItem('fed3-reduced-motion', String(next)); } catch { /* Optional preference. */ } }}><span className={styles.tinySwitch} />{c.motion}</button></div>
        <AlternativeShowcase locale={locale} items={filtered} selectedId={selectedId}
          onSelect={id => { setSelectedId(id); setExpanded(false); updateUrl(id, view); }} onCompare={choose} />
        {!filtered.length && <div className={styles.empty}><Icon name="search" /><p>{c.noResults}</p><button onClick={() => { setQuery(''); setCategory('all'); }}>{c.reset}</button></div>}
      </section>

      <section id="comparison" ref={comparison} tabIndex={-1} className={styles.comparison} aria-labelledby="comparison-heading">
        <p className={styles.eyebrow}>{c.compareEyebrow}</p><div className={styles.sectionHeading}><h2 id="comparison-heading">{c.compareTitle}</h2><p>{c.compareLead}</p></div>
        <div className={styles.pairPicker}>
          <div className={styles.pickerLabel}><span>{c.choosePair}</span><small>{c.pairHint}</small></div>
          <div className={styles.pairOptions} role="group" aria-label={c.choosePair}>{alternatives.map(item => <button key={item.id} aria-pressed={item.id === selectedId} aria-label={`${item.current} / ${item.name}`} onClick={() => { setSelectedId(item.id); setExpanded(false); updateUrl(item.id, view); }}><span className={styles.pairLogos}><AppLogo name={item.current} size={25} /><DirectionalArrow /><AppLogo name={item.name} size={25} /></span><span dir="ltr">{item.name}</span></button>)}</div>
        </div>
        <label className={styles.compareSelect}>{c.compare}<select value={selectedId} onChange={e => { setSelectedId(e.target.value); setExpanded(false); updateUrl(e.target.value, view); }}>{alternatives.map(item => <option key={item.id} value={item.id}>{item.current} → {item.name}</option>)}</select></label>
        <div className={styles.comparisonWorkspace}>
        <div className={styles.matchup}>
          <div className={styles.contender}><span className={styles.largeLogo}><AppLogo name={app.current} size={58} /></span><div><small>{c.current}</small><h3 data-app-name dir="ltr">{app.current}</h3></div></div>
          <span className={styles.switchBridge} aria-hidden="true"><span /><DirectionalArrow /><span /></span>
          <div className={`${styles.contender} ${styles.matchupAlternative}`}><div className={styles.contenderIdentity}><span className={styles.largeLogo}><AppLogo name={app.name} size={58} /></span><div><small>{c.alternative}</small><h3 data-app-name dir="ltr">{app.name}</h3></div></div><div className={styles.matchupActions}><a data-download href={app.download} target="_blank" rel="noopener noreferrer" aria-label={`${c.getApp}: ${app.name}`}><DownloadIcon />{c.getApp}</a><Link href={`/${locale}/apps/${app.id}/`} aria-label={`${c.appPage}: ${app.name}`}>{c.appPage}<DirectionalArrow /></Link></div><span className={styles.alternativeBadge}><Icon name="shield" /></span></div>
        </div>
        <div className={styles.workspaceLabel}><span>{c.overview}</span><span>03 / {c.privacyOnly}</span></div>
        <div className={styles.spotlights} key={app.id}>{spotlights.map((row, index) => <article data-privacy-card className={styles.spotlight} key={row.key}>
          <div className={styles.spotlightHeading}><span className={styles.criterionIcon}><Icon name={(['shield', 'data', 'server'] as const)[index]} /></span><h4>{pick(criteria[row.key])}</h4><small>0{index + 1}</small></div>
          <div className={styles.spotlightCurrent}><span className={styles.appLabel}><AppLogo name={app.current} size={20} /><bdi>{app.current}</bdi></span><p>{pick(row.current)}</p></div>
          <div className={styles.spotlightAlternative}><span className={styles.appLabel}><AppLogo name={app.name} size={20} /><bdi>{app.name}</bdi></span><p>{pick(row.alternative)}</p></div>
          <span className={styles.spotlightSources}>{row.sources.map(number => <a key={number} href={app.sources[number].url} target="_blank" rel="noopener noreferrer" aria-label={pick(app.sources[number].name)}>[{number + 1}]</a>)}</span>
        </article>)}</div>
        <div className={styles.takeaways}><div><span className={styles.takeawayLabel}>{c.gain}</span><p>{pick(app.gain)}</p></div><div><span className={styles.takeawayLabel}>{c.tradeoff}</span><p>{pick(app.tradeoff)}</p></div></div>
        </div>
        <div className={styles.detailHeading}><div><p className={styles.eyebrow}>{c.detailed}</p><h3>{c.criterion}</h3></div><span>10 <span>/</span> {c.dimensionsLabel}</span></div>
        <div className={styles.tableToolbar}><div className={styles.segment} role="group" aria-label={locale === 'ar' ? 'محاور المقارنة' : 'Comparison criteria'}><button aria-pressed={view === 'all'} onClick={() => { setView('all'); updateUrl(app.id, 'all'); }}>{c.allCriteria}</button><button aria-pressed={view === 'privacy'} onClick={() => { setView('privacy'); updateUrl(app.id, 'privacy'); }}>{c.privacyOnly}</button></div><button className={styles.share} onClick={share}><Icon name="link" />{c.share}</button><span className={styles.shareStatus} role="status">{shareState}</span></div>
        <ComparisonExplorer app={app} rows={rows} locale={locale} />
        <button className={styles.tableToggle} aria-expanded={expanded} aria-controls="full-comparison" onClick={() => setExpanded(!expanded)}>{expanded ? c.hideDetails : c.showDetails}<span aria-hidden="true">{expanded ? '−' : '+'}</span></button>
        <div id="full-comparison" hidden={!expanded}>
        <div className={styles.tableWrap}><table className={styles.table}><caption className="sr-only">{app.current} {c.vs} {app.name} / {c.reviewed}: {reviewDate[locale]}</caption><thead><tr><th scope="col">{c.criterion}</th><th scope="col"><bdi>{app.current}</bdi></th><th scope="col"><bdi>{app.name}</bdi></th></tr></thead><tbody>{rows.map(row => <tr key={`${app.id}-${row.key}`}><th scope="row">{pick(criteria[row.key])}<span className={styles.rowSources}>{row.sources.map(number => <a key={number} href={app.sources[number].url} target="_blank" rel="noopener noreferrer" aria-label={`${pick(app.sources[number].name)} (${locale === 'ar' ? 'يفتح في تبويب جديد' : 'opens a new tab'})`}>[{number + 1}]</a>)}</span></th><td>{pick(row.current)}</td><td>{pick(row.alternative)}</td></tr>)}</tbody></table></div>
        </div>
        <div className={styles.evidence}><div><Icon name="shield" /><p>{c.sourceNote}</p></div><span>{c.reviewed}<time dateTime="2026-10-24">{reviewDate[locale]}</time></span></div>
        <details className={styles.sources} key={app.id}><summary>{c.sources}<span>{app.sources.length} ↗</span></summary><ol>{app.sources.map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{pick(s.name)}<span aria-hidden="true"> ↗</span></a></li>)}</ol></details>

        <div className={styles.guide}><div><p className={styles.eyebrow}>{c.guideEyebrow}</p><h2>{c.guideTitle}</h2><p className={styles.guideFirst}>{pick(app.firstStep)}</p><div className={styles.guideActions}><a data-download className={styles.primary} href={app.download} target="_blank" rel="noopener noreferrer" aria-label={`${c.getApp}: ${app.name}`}><DownloadIcon />{c.getApp}</a><Link className={styles.textLink} href={`/${locale}/apps/${app.id}/`}>{c.appPage}<DirectionalArrow /></Link></div><a className={styles.publisherLink} href={app.official} target="_blank" rel="noopener noreferrer">{c.download} ↗</a><p className={styles.guideNote}>{app.id === 'nextcloud' ? c.nextcloudNote : c.guideNote}</p>{app.id === 'nextcloud' && <Link className={styles.textLink} href={fed3.routes[locale]['home-cloud']}>{c.cloud}<DirectionalArrow /></Link>}</div><ol>{app.steps.map((step, index) => <li key={`${app.id}-${index}`}><span aria-hidden="true">0{index + 1}</span><p>{pick(step)}</p></li>)}</ol></div>
      </section>

      <GameLauncher locale={locale} />
      <section className={styles.method}><h2>{c.methodTitle}</h2><div><p>{c.methodOne}</p><p>{c.methodTwo}</p><p>{c.methodThree}</p></div></section>
      <JourneyNavigation locale={locale} current="alternatives" currentHref="#catalog" />
      </div>
    </main>
    <footer className={styles.footer}><div><Link href={fed3.routes[locale].home} className={styles.footerBrand}>Fed3<span>.</span></Link><p>{c.footerNote}</p></div><p className={styles.footerStatement}>{c.footer}</p><a href="#alternatives-main">{c.top}<Icon name="arrow" /></a><p className={styles.localNote}>{c.privacyNote}</p></footer>
  </div>;
}
