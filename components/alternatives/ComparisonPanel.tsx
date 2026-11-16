'use client';
import { useCatalog } from './CatalogContext';

import { useRef, useState } from 'react';
import type { Locale } from '@/lib/fed3/config';
import { criteria, reviewDate, type Alternative, type Criterion } from '@/lib/fed3/alternatives';
import { comparisonGroups, type ComparisonGroupId } from '@/lib/fed3/comparison-layout';
import { criterionQuestions } from '@/lib/fed3/narrative';
import { FeatureIcon } from '@/components/shared/FeatureIcon';
import { AppLogo } from './AppLogo';
import { DownloadIcon } from './DirectionalArrow';
import styles from './comparison.module.css';
import { ComparisonAppPicker } from './ComparisonAppPicker';
import { PlainText } from './PlainText';
import { ComparisonAutoAdvance } from './ComparisonAutoAdvance';

const topicLabels: Record<Criterion, { ar: string; en: string }> = {
  encryption: { ar: 'التشفير', en: 'Encryption' }, collection: { ar: 'البيانات', en: 'Data' },
  ads: { ar: 'الإعلانات', en: 'Ads' }, control: { ar: 'التحكّم', en: 'Control' }, account: { ar: 'الحساب', en: 'Account' },
  features: { ar: 'المزايا', en: 'Features' }, platforms: { ar: 'الأجهزة', en: 'Devices' }, cost: { ar: 'الخطط والتكلفة', en: 'Plans & cost' },
  portability: { ar: 'نقل البيانات', en: 'Moving data' }, limitations: { ar: 'الحدود', en: 'Limits' },
};
const groupIcons = ['encryption', 'platforms', 'cost', 'backup'];

export function ComparisonPanel({ locale, app, openGroup, activeCriterion, onGroupChange, onCriterionChange, onSelect, onShare, shareStatus, reduceMotion = false }: {
  locale: Locale; app: Alternative; openGroup: ComparisonGroupId; activeCriterion: Criterion;
  onGroupChange: (id: ComparisonGroupId) => void; onCriterionChange: (id: Criterion) => void;
  onSelect: (id: string) => void; onShare: () => void; shareStatus: string;
  reduceMotion?: boolean;
}) {
  const { appStart, comparisonBriefs } = useCatalog();
  const ar = locale === 'ar';
  const start = appStart[app.id];
  const readingArea = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [expanded, setExpanded] = useState<Set<Criterion>>(() => new Set());
  const topics = comparisonGroups.find(group => group.id === openGroup)!.criteria as readonly Criterion[];
  const activeRow = app.rows.find(row => row.key === activeCriterion)!;
  const brief = comparisonBriefs[app.id]?.[activeCriterion];
  const words = `${brief?.current[locale] ?? activeRow.current[locale]} ${brief?.alternative[locale] ?? activeRow.alternative[locale]}`.trim().split(/\s+/).length;
  const readingTime = Math.min(24000, Math.max(12000, words * 375 + 3000));
  return <div className={styles.panel} data-compact-comparison data-visual-comparison>
    <div className={styles.heading}>
      <div><p>{ar ? '02 / المقارنة' : '02 / COMPARE'}</p><h2 id="comparison-heading">{ar ? 'شوف الفرق.' : 'See the difference.'}</h2></div>
      <ComparisonAppPicker locale={locale} selectedId={app.id} onSelect={onSelect} />
    </div>
    <div className={styles.groupTabs} role="tablist" aria-label={ar ? 'مجالات المقارنة' : 'Comparison categories'} onPointerDown={() => setPaused(true)} onKeyDown={event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      setPaused(true);
      const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role=tab]'));
      const current = buttons.indexOf(event.target as HTMLButtonElement);
      const direction = (event.key === 'ArrowRight' ? 1 : -1) * (ar ? -1 : 1);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (current + direction + buttons.length) % buttons.length;
      buttons[next].focus(); onGroupChange(comparisonGroups[next].id);
    }}>
      {comparisonGroups.map((group, index) => <button key={group.id} type="button" role="tab" id={`group-${app.id}-${group.id}`} data-comparison-group={group.id}
        aria-selected={openGroup === group.id} tabIndex={openGroup === group.id ? 0 : -1} aria-controls={`panel-${app.id}-${group.id}`} onClick={() => { setPaused(true); onGroupChange(group.id); }}>
        <FeatureIcon name={groupIcons[index]} size={21} /><span>{group.title[locale]}</span>
      </button>)}
    </div>
    <div className={styles.arena} ref={readingArea} onPointerUp={() => {
      if (window.getSelection()?.toString().trim()) setPaused(true);
    }}>
      <div className={styles.pairBar} data-comparison-pair>
        <div className={styles.pairApp}><span className={styles.logo}><AppLogo name={app.current} size={54} /></span><div><small>{ar ? 'التطبيق الحالي' : 'Current app'}</small><h3 data-app-name dir="ltr">{app.current}</h3></div></div>
        <span className={styles.versus}>{ar ? 'مقابل' : 'vs'}</span>
        <div className={`${styles.pairApp} ${styles.alternative}`}><span className={styles.logo}><AppLogo name={app.name} size={54} /></span><div><small>{ar ? 'البديل المقترح' : 'Alternative'}</small><h3 data-app-name dir="ltr">{app.name}</h3><a data-download className={styles.quickDownload} href={app.download} target="_blank" rel="noopener noreferrer" aria-label={start.downloadLabel[locale]}><DownloadIcon />{ar ? 'تنزيل التطبيق' : 'Download app'}</a></div></div>
      </div>
      {comparisonGroups.map(group => {
        const rows = app.rows.filter(row => (group.criteria as readonly string[]).includes(row.key));
        return <section key={group.id} id={`panel-${app.id}-${group.id}`} role="tabpanel" aria-labelledby={`group-${app.id}-${group.id}`} hidden={openGroup !== group.id} className={styles.groupPanel}>
          <div className={styles.topicNav} role="group" aria-label={ar ? 'اختر نقطة المقارنة' : 'Choose a comparison point'}>
            {rows.map(row => <button type="button" key={row.key} data-comparison-topic={row.key} aria-pressed={activeCriterion === row.key} onClick={() => { setPaused(true); onCriterionChange(row.key); }}>{topicLabels[row.key][locale]}</button>)}
          </div>
          {openGroup === group.id && topics.length > 1 && !reduceMotion && <ComparisonAutoAdvance key={`${app.id}-${openGroup}-${activeCriterion}`} locale={locale} readingArea={readingArea} criterion={activeCriterion} duration={readingTime} paused={paused} expanded={expanded.has(activeCriterion)} onPause={() => setPaused(value => !value)} onNext={() => onCriterionChange(topics[(topics.indexOf(activeCriterion) + 1) % topics.length])} />}
          {rows.map(row => <article key={`${app.id}-${row.key}`} hidden={activeCriterion !== row.key} className={styles.criterion} data-comparison-row={row.key}>
            <div className={styles.question}><span className={styles.topicIcon}><FeatureIcon name={['ads', 'account', 'portability', 'limitations'].includes(row.key) ? groupIcons[comparisonGroups.indexOf(group)] : row.key} size={24} /></span><h4>{criterionQuestions[row.key][locale]}</h4><span className={styles.criterionLabel}>{criteria[row.key][locale]}</span></div>
            <div className={styles.facts}>
              <div data-comparison-current><span className={styles.cellLabel}><bdi>{app.current}</bdi></span><p><PlainText text={comparisonBriefs[app.id]?.[row.key]?.current[locale] ?? row.current[locale]} /></p></div>
              <div className={styles.alternativeFact} data-comparison-alternative><span className={styles.cellLabel}><bdi>{app.name}</bdi></span><p><PlainText text={comparisonBriefs[app.id]?.[row.key]?.alternative[locale] ?? row.alternative[locale]} /></p></div>
            </div>
            <details className={styles.rowSources} onToggle={event => {
              const open = event.currentTarget.open;
              setExpanded(previous => {
                const next = new Set(previous);
                if (open) next.add(row.key); else next.delete(row.key);
                return next;
              });
            }}><summary>{ar ? 'التفاصيل والمصادر الرسمية' : 'Details & official sources'}<span aria-hidden="true">↗</span></summary><div className={styles.fullFacts}><div data-comparison-full="current"><bdi>{app.current}</bdi><p>{row.current[locale]}</p></div><div data-comparison-full="alternative"><bdi>{app.name}</bdi><p>{row.alternative[locale]}</p></div></div><ul>{row.sources.map(number => <li key={number}><a href={app.sources[number].url} target="_blank" rel="noopener noreferrer">{app.sources[number].name[locale]}<span aria-hidden="true">↗</span></a></li>)}</ul></details>
          </article>)}
        </section>;
      })}
    </div>
    <div className={styles.boardFooter}><span>{ar ? 'اختَر ما يناسب احتياجك.' : 'Choose what fits your needs.'}</span><button className={styles.share} type="button" onClick={onShare}>{ar ? 'نسخ رابط المقارنة' : 'Copy comparison link'}<span aria-hidden="true">↗</span></button></div>
    <p className={styles.shareStatus} role="status">{shareStatus}</p>
    <div className={styles.takeaways} data-comparison-takeaways>
      <div><h3>{ar ? 'شو بتستفيد؟' : 'What do you gain?'}</h3><p><PlainText text={start.benefit[locale]} /></p></div>
      <div><h3>{ar ? 'قبل ما تعتمد البديل' : 'Before you switch'}</h3><p><PlainText text={start.remember[locale]} /></p></div>
    </div>
    <details className={styles.about}>
      <summary>{ar ? 'عن المقارنة وطريقة قراءتها' : 'About this comparison'}<span aria-hidden="true">+</span></summary>
      <div><p>{ar ? 'المعلومات مستندة إلى وثائق الناشرين، وليست تدقيقًا أمنيًا مستقلًا. قد تختلف الخصائص بحسب الإصدار والخطة والمنطقة.' : 'This information is based on publisher documentation, not an independent security audit. Features may vary by version, plan and region.'}</p>
        <p>{ar ? 'التشفير يحمي المحتوى ضمن نطاق محدد، ولا يمنع كل جمع للبيانات الوصفية.' : 'Encryption protects content within a defined scope. It does not prevent all metadata collection.'}</p>
        <p>{ar ? 'الاستضافة الذاتية تمنحك اختيار المشغّل، وتنقل إليك مسؤولية الصيانة والنسخ والاستعادة.' : 'Self-hosting lets you choose the operator and makes you responsible for maintenance, backups and recovery.'}</p>
        <p>{ar ? 'لا توجد درجة أمان واحدة تناسب الجميع. اختبر ما تحتاجه قبل نقل بياناتك المهمة.' : 'There is no single security score for everyone. Test your needs before moving important data.'}</p>
        <p className={styles.reviewed}>{ar ? 'مراجعة المصادر' : 'Sources reviewed'}: <time dateTime={app.reviewedOn ?? '2026-10-24'}>{app.reviewedOn ?? reviewDate[locale]}</time></p>
      </div>
    </details>
  </div>;
}
