'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type PointerEvent } from 'react';
import type { Locale } from '@/lib/fed3/config';
import { companyNames, policyPreviews, privacyCases, privacyFileHref, privacyPolicies, privacyTeasers, type PrivacyCompany } from '@/lib/fed3/privacy-cases';
import { PrivacyBrandMark, PrivacyText } from './PrivacyText';
import styles from './privacy-files.module.css';

const interval = 9_000;
const companies: PrivacyCompany[] = ['meta', 'google', 'microsoft'];
const cases = privacyCases.filter(file => file.kind === 'case');
const copy = {
  ar: {
    eyebrow: 'قضايا موثّقة', title: 'وين بتروح بياناتك؟', intro: 'قضايا حقيقية بتوضح كيف تعاملت التطبيقات مع بيانات الناس. افتح أي ملف واقرأ القصة ومصادرها.',
    all: 'الكل', next: 'الملف التالي', previous: 'الملف السابق', pause: 'إيقاف التبديل التلقائي', play: 'تشغيل التبديل التلقائي',
    carousel: 'قضايا الخصوصية', details: 'القصة والدليل', jump: 'اعرض الملف',
    policyEyebrow: 'قبل ما توافق', policyTitle: 'شو بتسمح سياسة الخصوصية؟', policyLink: 'افهم السياسة',
    fine: 'القيمة والحالة بحسب المصدر. التفاصيل داخل كل ملف.',
  },
  en: {
    eyebrow: 'DOCUMENTED CASES', title: 'Where does your data go?', intro: 'Real cases show how apps handled people’s data. Open a case to read what happened and see the sources.',
    all: 'All', next: 'Next file', previous: 'Previous file', pause: 'Pause automatic rotation', play: 'Start automatic rotation',
    carousel: 'Privacy cases', details: 'Story and evidence', jump: 'Show file',
    policyEyebrow: 'BEFORE YOU AGREE', policyTitle: 'What does the privacy policy allow?', policyLink: 'Understand the policy',
    fine: 'Amounts and status follow the sources. Open a file for details.',
  },
};

function Chevron({ right = false }: { right?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={right ? 'm9 5 7 7-7 7' : 'm15 5-7 7 7 7'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function PrivacyFiles({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const sectionRef = useRef<HTMLElement>(null);
  const pointerStart = useRef<{ id: number; x: number; y: number; dragging: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [filter, setFilter] = useState<PrivacyCompany | 'all'>('all');
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(true);
  const files = filter === 'all' ? cases : cases.filter(file => file.company === filter);
  const canRotate = files.length > 1 && !paused && !hovered && !focused && !dragging && visible && pageVisible && !reducedMotion;

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(media.matches);
    const updateVisibility = () => setPageVisible(document.visibilityState === 'visible');
    updateMotion();
    updateVisibility();
    media.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    const observer = new IntersectionObserver(entries => setVisible(entries[0].isIntersecting));
    const carousel = sectionRef.current?.querySelector('[data-privacy-carousel]');
    if (carousel) observer.observe(carousel);
    return () => {
      media.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!canRotate) return;
    const timer = window.setTimeout(() => setActive(current => (current + 1) % files.length), interval);
    return () => window.clearTimeout(timer);
  }, [canRotate, active, files.length, filter]);

  function show(index: number) {
    setActive((index + files.length) % files.length);
    setPaused(true);
  }
  function selectCompany(company: PrivacyCompany | 'all') {
    setFilter(company);
    setActive(0);
    setPaused(true);
  }
  function onBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  }
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    show(active + (event.key === 'ArrowRight' ? 1 : -1));
  }

  function startPointer(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0 || files.length < 2) return;
    pointerStart.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dragging: false };
  }
  function movePointer(event: PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.dragging) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
        pointerStart.current = null;
        return;
      }
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
      start.dragging = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
      setPaused(true);
    }
    const limit = event.currentTarget.clientWidth * .6;
    setDragOffset(Math.max(-limit, Math.min(limit, dx)));
  }
  function endPointer(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    const start = pointerStart.current;
    if (!start || start.id !== event.pointerId) return;
    pointerStart.current = null;
    if (start.dragging) {
      suppressClick.current = true;
      window.setTimeout(() => { suppressClick.current = false; }, 0);
      const dx = event.clientX - start.x;
      const threshold = Math.max(40, Math.min(85, event.currentTarget.clientWidth * .13));
      if (!cancelled && Math.abs(dx) > threshold) show(active + (dx > 0 ? 1 : -1));
    }
    setDragging(false);
    setDragOffset(0);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return <section id="privacy-files" ref={sectionRef} className={styles.section} dir={locale === 'ar' ? 'rtl' : 'ltr'} aria-labelledby="privacy-files-heading" data-privacy-files>
    <div className={styles.headingRow}><div><p className={styles.eyebrow}><span />{t.eyebrow}</p><h2 id="privacy-files-heading">{t.title}</h2></div><p className={styles.intro}>{t.intro}</p></div>
    <div className={styles.filters} role="group" aria-label={locale === 'ar' ? 'تصفية حسب الشركة' : 'Filter by company'}>
      <button type="button" aria-pressed={filter === 'all'} onClick={() => selectCompany('all')}>{t.all}<span>{String(cases.length).padStart(2, '0')}</span></button>
      {companies.map(company => <button type="button" key={company} aria-pressed={filter === company} onClick={() => selectCompany(company)}><PrivacyBrandMark company={company} />{companyNames[company][locale]}</button>)}
    </div>
    <div className={styles.carousel} data-privacy-carousel role="region" aria-roledescription={locale === 'ar' ? 'عرض شرائح' : 'carousel'} aria-label={t.carousel}
      onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true); }} onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={onBlur} onKeyDown={onKeyDown}>
      <div className={styles.stage}>
      <div className={styles.slides} data-dragging={dragging} aria-live={paused || focused || reducedMotion ? 'polite' : 'off'}
        onPointerDown={startPointer} onPointerMove={movePointer} onPointerUp={event => endPointer(event)} onPointerCancel={event => endPointer(event, true)}
        onLostPointerCapture={event => { if (event.target === event.currentTarget) endPointer(event, true); }} onPointerLeave={() => { if (!pointerStart.current?.dragging) pointerStart.current = null; }}
        onDragStart={event => event.preventDefault()} onClickCapture={event => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); } }}>
        {files.map((file, index) => {
          const c = file.copy[locale];
          const teaser = privacyTeasers[file.id][locale];
          let offset = (active - index + files.length) % files.length;
          if (offset > files.length / 2) offset -= files.length;
          return <article key={file.id} className={`${styles.slide} ${index === active ? styles.active : ''}`} style={{ transform: `translateX(calc(${offset * 105}% + ${dragOffset}px))` }}
            aria-hidden={index !== active} inert={index !== active} role="group" aria-roledescription={locale === 'ar' ? 'شريحة' : 'slide'} aria-label={`${index + 1} / ${files.length}`} data-privacy-file={file.id}>
            <Image className={styles.cover} src={file.image} alt={file.imageAlt[locale]} fill sizes="(max-width: 800px) 95vw, 65vw" draggable={false} unoptimized />
            <div className={styles.shade} />
            <div className={styles.cardTop}><span className={styles.product}>{teaser.product}</span><span className={styles.cardYear}>{file.dateTime?.slice(0, 4)}</span></div>
            <div className={styles.cardCopy}>
              <div className={styles.stat} dir="ltr">{c.stat}</div>
              <p className={styles.metric}>{teaser.metric}</p>
              <h3><PrivacyText text={teaser.title} /></h3>
              <Link className={styles.detailLink} href={privacyFileHref(locale, file.id)}>{t.details}<span aria-hidden="true">{locale === 'ar' ? '←' : '→'}</span></Link>
            </div>
          </article>;
        })}
      </div>
      <button type="button" className={`${styles.sideArrow} ${styles.leftArrow}`} aria-label={t.previous} disabled={files.length < 2} onClick={() => show(active - 1)}><Chevron /></button>
      <button type="button" className={`${styles.sideArrow} ${styles.rightArrow}`} aria-label={t.next} disabled={files.length < 2} onClick={() => show(active + 1)}><Chevron right /></button>
      </div>
      <div className={styles.controls}>
        <bdi className={styles.position} dir="ltr"><strong>{String(active + 1).padStart(2, '0')}</strong><span> / {String(files.length).padStart(2, '0')}</span></bdi>
        <div className={styles.dots} role="group" aria-label={locale === 'ar' ? 'اختيار ملف' : 'Choose a file'}>{files.map((file, index) => <button type="button" key={file.id} aria-label={`${t.jump} ${index + 1}: ${privacyTeasers[file.id][locale].product}`} aria-current={active === index ? 'true' : undefined} onClick={() => show(index)}><span /></button>)}</div>
        <div className={styles.playback}>
          <button type="button" className={styles.play} aria-label={paused ? t.play : t.pause} aria-pressed={paused} disabled={reducedMotion || files.length < 2} onClick={() => { setPaused(value => !value); setFocused(false); }}>{paused || reducedMotion ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 10 7-10 7Z" fill="currentColor" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3v14H7zm7 0h3v14h-3z" fill="currentColor" /></svg>}</button>
        </div>
      </div>
      <div className={styles.progress} aria-hidden="true"><span key={`${filter}-${active}-${canRotate}`} data-running={canRotate} style={{ animationDuration: `${interval}ms` }} /></div>
    </div>
    <p className={styles.note}>{t.fine}</p>

    <section className={styles.policies} aria-labelledby="privacy-policies-heading" data-privacy-policies>
      <p className={styles.eyebrow}><span />{t.policyEyebrow}</p>
      <h2 id="privacy-policies-heading">{t.policyTitle}</h2>
      <div className={styles.policyGrid}>{privacyPolicies.map(policy => {
        const preview = policyPreviews[policy.company];
        const p = preview[locale];
        return <Link key={policy.company} className={styles.policyCard} href={privacyFileHref(locale, `policy-${policy.company}`)} data-policy={policy.company}>
          <div className={styles.policyImage}><Image src={preview.image} alt="" fill sizes="(max-width: 700px) 90vw, 30vw" unoptimized /><span className={styles.policyBrand}><PrivacyBrandMark company={policy.company} />{companyNames[policy.company][locale]}</span></div>
          <div className={styles.policyCopy}><h3><PrivacyText text={p.title} /></h3>
            <div className={styles.dataFlow} aria-label={`${p.from} ${locale === 'ar' ? 'إلى' : 'to'} ${p.to}`}><span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 3h9l4 4v14H6Z" /><path d="M9 11h7M9 15h7" /></svg>{p.from}</span><span className={styles.flowArrow} aria-hidden="true">{locale === 'ar' ? '←' : '→'}</span><span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="4" width="16" height="6" rx="2" /><rect x="4" y="14" width="16" height="6" rx="2" /><path d="M8 7h1M8 17h1" /></svg>{p.to}</span></div>
            <p>{p.note}</p><span className={styles.policyCta}>{t.policyLink}<span aria-hidden="true">↗</span></span>
          </div>
        </Link>;
      })}</div>
    </section>
  </section>;
}
