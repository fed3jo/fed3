'use client';

import Link from 'next/link';
import { Fragment } from 'react';
import type { Locale } from '@/lib/fed3/config';
import { alternatives, criteria, reviewDate, type Alternative } from '@/lib/fed3/alternatives';
import { comparisonEmphasis, comparisonGroups, type ComparisonGroupId } from '@/lib/fed3/comparison-layout';
import { AppLogo } from './AppLogo';
import { DirectionalArrow, DownloadIcon } from './DirectionalArrow';
import styles from './comparison.module.css';

function Emphasis({ text, phrases }: { text: string; phrases: readonly string[] }) {
  const matches = phrases.flatMap(phrase => {
    const start = text.indexOf(phrase);
    return start < 0 ? [] : [{ start, end: start + phrase.length }];
  }).sort((a, b) => a.start - b.start);
  let cursor = 0;
  return <>{matches.map(({ start, end }) => {
    if (start < cursor) return null;
    const before = text.slice(cursor, start);
    cursor = end;
    return <Fragment key={start}>{before}<mark className={styles.highlight}>{text.slice(start, end)}</mark></Fragment>;
  })}{text.slice(cursor)}</>;
}

export function ComparisonPanel({ locale, app, openGroup, onGroupChange, onSelect, onShare, shareStatus }: {
  locale: Locale; app: Alternative; openGroup: ComparisonGroupId | null;
  onGroupChange: (id: ComparisonGroupId) => void; onSelect: (id: string) => void; onShare: () => void; shareStatus: string;
}) {
  const ar = locale === 'ar';
  const emphasis = comparisonEmphasis[app.id]?.[locale] ?? [];
  const toggleGroup = (group: ComparisonGroupId) => {
    onGroupChange(group);
    requestAnimationFrame(() => {
      const element = document.querySelector<HTMLElement>(`[data-comparison-group="${group}"]`);
      const bar = document.querySelector<HTMLElement>('[data-comparison-pair]');
      if (!element || !bar) return;
      const limit = parseFloat(getComputedStyle(bar).top) + bar.getBoundingClientRect().height + 12;
      const bounds = element.querySelector('h3')!.getBoundingClientRect();
      if (bounds.top >= limit && bounds.bottom <= innerHeight - 20) return;
      const top = Math.max(0, bounds.top + scrollY - limit);
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || element.closest('[data-motion]')?.getAttribute('data-motion') === 'reduced';
      if (window.fed3Lenis && !reduced) window.fed3Lenis.scrollTo(top, { duration: .45 });
      else window.scrollTo({ top, behavior: reduced ? 'instant' : 'smooth' });
    });
  };
  return <div className={styles.panel} data-compact-comparison>
    <div className={styles.heading}>
      <div><p>{ar ? '02 / المقارنة' : '02 / COMPARE'}</p><h2 id="comparison-heading">{ar ? 'قارن ما يهمّك.' : 'Compare what matters.'}</h2></div>
      <button className={styles.share} type="button" onClick={onShare}>{ar ? 'نسخ رابط المقارنة' : 'Copy comparison link'}<span aria-hidden="true">↗</span></button>
    </div>
    <p className={styles.shareStatus} role="status">{shareStatus}</p>
    <div className={styles.pairBar} data-comparison-pair>
      <div className={styles.pairIdentity}>
        <div className={styles.pairApp}><AppLogo name={app.current} size={34} /><div><small>{ar ? 'التطبيق الحالي' : 'Current app'}</small><h3 data-app-name dir="ltr">{app.current}</h3></div></div>
        <span className={styles.versus}>{ar ? 'مقابل' : 'vs'}</span>
        <div className={`${styles.pairApp} ${styles.alternative}`}><AppLogo name={app.name} size={34} /><div><small>{ar ? 'البديل المقترح' : 'Alternative'}</small><h3 data-app-name dir="ltr">{app.name}</h3></div></div>
      </div>
      <label className={styles.changeApp}><span>{ar ? 'تغيير التطبيق' : 'Change app'}<span aria-hidden="true">⌄</span></span><select aria-label={ar ? 'اختر المقارنة' : 'Choose a comparison'} value={app.id} onChange={event => onSelect(event.target.value)}>
        {alternatives.map(item => <option key={item.id} value={item.id}>{item.current} / {item.name}</option>)}
      </select></label>
    </div>

    <div className={styles.groups}>
      {comparisonGroups.map((group, index) => {
        const rows = app.rows.filter(row => (group.criteria as readonly string[]).includes(row.key));
        const expanded = openGroup === group.id;
        const id = `comparison-${app.id}-${group.id}`;
        return <section className={styles.group} key={group.id} data-comparison-group={group.id} data-open={expanded}>
          <h3><button type="button" id={`${id}-toggle`} aria-expanded={expanded} aria-controls={id} onClick={() => toggleGroup(group.id)}>
            <span className={styles.groupNumber} aria-hidden="true">0{index + 1}</span><span>{group.title[locale]}</span><span className={styles.groupCount}>{ar ? rows.length === 1 ? 'محور واحد' : rows.length === 2 ? 'محوران' : `${rows.length} محاور` : `${rows.length} ${rows.length === 1 ? 'criterion' : 'criteria'}`}</span><span className={styles.expand} aria-hidden="true">{expanded ? '−' : '+'}</span>
          </button></h3>
          <div id={id} hidden={!expanded} role="region" aria-labelledby={`${id}-toggle`}>
            <div className={styles.columnLabels} aria-hidden="true"><bdi>{app.current}</bdi><bdi>{app.name}</bdi></div>
            {rows.map(row => <article className={styles.criterion} key={`${app.id}-${row.key}`} data-comparison-row={row.key}>
              <h4>{criteria[row.key][locale]}</h4>
              <div className={styles.facts}>
                <div data-comparison-current><span className={styles.cellLabel}><bdi>{app.current}</bdi></span><p><Emphasis text={row.current[locale]} phrases={emphasis} /></p></div>
                <div className={styles.alternativeFact} data-comparison-alternative><span className={styles.cellLabel}><bdi>{app.name}</bdi></span><p><Emphasis text={row.alternative[locale]} phrases={emphasis} /></p></div>
              </div>
              <details className={styles.rowSources}><summary>{ar ? 'مصادر هذه النقطة' : 'Sources for this point'}<span aria-hidden="true">↗</span></summary><ul>{row.sources.map(number => <li key={number}><a href={app.sources[number].url} target="_blank" rel="noopener noreferrer">{app.sources[number].name[locale]}<span aria-hidden="true">↗</span></a></li>)}</ul></details>
            </article>)}
          </div>
        </section>;
      })}
    </div>

    <div className={styles.takeaways} data-comparison-takeaways>
      <div><h3>{ar ? 'ما الذي تكسبه؟' : 'What do you gain?'}</h3><p><Emphasis text={app.gain[locale]} phrases={emphasis} /></p></div>
      <div><h3>{ar ? 'ما الذي تحتاج معرفته؟' : 'What should you know?'}</h3><p><Emphasis text={app.tradeoff[locale]} phrases={emphasis} /></p></div>
    </div>
    <div className={styles.tryApp}>
      <div><h3>{ar ? 'ابدأ بتجربة صغيرة.' : 'Start with a small test.'}</h3><p>{app.firstStep[locale]}</p></div>
      <a data-download className={styles.download} href={app.download} target="_blank" rel="noopener noreferrer" aria-label={`${ar ? 'جرّب' : 'Try'} ${app.name}`}><DownloadIcon />{ar ? 'جرّب' : 'Try'} <bdi>{app.name}</bdi></a>
      <Link className={styles.appDetails} href={`/${locale}/apps/${app.id}/`} aria-label={`${ar ? 'صفحة التطبيق' : 'App details'}: ${app.name}`}>{ar ? 'خطوات البداية والتفاصيل' : 'Getting started & details'}<DirectionalArrow /></Link>
    </div>
    <details className={styles.about}>
      <summary>{ar ? 'عن المقارنة وطريقة قراءتها' : 'About this comparison'}<span aria-hidden="true">+</span></summary>
      <div><p>{ar ? 'المعلومات مستندة إلى وثائق الناشرين، وليست تدقيقًا أمنيًا مستقلًا. قد تختلف الخصائص بحسب الإصدار والخطة والمنطقة.' : 'This information is based on publisher documentation, not an independent security audit. Features may vary by version, plan and region.'}</p>
        <p>{ar ? 'التشفير يحمي المحتوى ضمن نطاق محدد، ولا يمنع كل جمع للبيانات الوصفية.' : 'Encryption protects content within a defined scope. It does not prevent all metadata collection.'}</p>
        <p>{ar ? 'الاستضافة الذاتية تمنحك اختيار المشغّل، وتنقل إليك مسؤولية الصيانة والنسخ والاستعادة.' : 'Self-hosting lets you choose the operator and makes you responsible for maintenance, backups and recovery.'}</p>
        <p>{ar ? 'لا توجد درجة أمان واحدة تناسب الجميع. اختبر ما تحتاجه قبل نقل بياناتك المهمة.' : 'There is no single security score for everyone. Test your needs before moving important data.'}</p>
        <p className={styles.reviewed}>{ar ? 'مراجعة المصادر' : 'Sources reviewed'}: <time dateTime="2026-10-24">{reviewDate[locale]}</time></p>
      </div>
    </details>
  </div>;
}
