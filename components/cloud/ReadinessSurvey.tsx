'use client';

import Link from 'next/link';
import { useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import type { Locale } from '@/lib/fed3/config';
import { analysisLabels, validateAnswers, type Answers, type Analysis, type FormDefinition, type PublicForm } from '@/lib/engagement/model';
import { FeatureIcon } from '@/components/shared/FeatureIcon';
import styles from './readiness.module.css';

export function ReadinessSurvey({ locale, preview }: { locale: Locale; preview?: FormDefinition }) {
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const formId = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const formElement = useRef<HTMLFormElement>(null);
  const pendingPanel = useRef<HTMLDivElement>(null);
  const trialAnchor = useRef<{ section: HTMLElement; top: number } | null>(null);
  const submitting = useRef(false);
  const [form, setForm] = useState<PublicForm | null>(null);
  const [loading, setLoading] = useState(!preview);
  const [loadFailed, setLoadFailed] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [fieldError, setFieldError] = useState<{ id: string; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [result, setResult] = useState<{ id: string; analysis: Analysis } | null>(null);

  const load = async (signal?: AbortSignal) => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const response = await fetch('/api/engagement/form/', { cache: 'no-store', signal });
      if (!response.ok) throw new Error('Survey unavailable');
      const data = await response.json();
      if (!signal?.aborted) setForm(data.form);
    } catch {
      if (!signal?.aborted) setLoadFailed(true);
    } finally {
      if (!signal?.aborted) {
        const trial = location.hash === '#cloud-trial' ? document.getElementById('cloud-trial') : null;
        const top = trial?.getBoundingClientRect().top;
        if (trial && top !== undefined && top >= 0 && top < innerHeight) trialAnchor.current = { section: trial, top };
        setLoading(false);
      }
    }
  };

  useLayoutEffect(() => {
    const anchor = trialAnchor.current;
    if (loading || !anchor) return;
    trialAnchor.current = null;
    window.scrollBy({ top: anchor.section.getBoundingClientRect().top - anchor.top, behavior: 'instant' });
  }, [loading]);

  const isPreview = Boolean(preview);
  useEffect(() => {
    if (isPreview) return;
    const controller = new AbortController();
    const panel = pendingPanel.current;
    if (!panel || !('IntersectionObserver' in window)) {
      void load(controller.signal);
      return () => controller.abort();
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      void load(controller.signal);
    }, { rootMargin: '320px' });
    observer.observe(panel);
    return () => { observer.disconnect(); controller.abort(); };
  }, [isPreview]);

  const focusHeading = () => requestAnimationFrame(() => heading.current?.focus());
  const definition = preview ?? form?.definition;
  const contact = <Link className={styles.textLink} href={`/${locale}/contact/`}>{t('تواصلوا مع الفريق', 'Contact the team')}</Link>;

  if (!preview && (loading || loadFailed || !definition)) return <div ref={pendingPanel} className={styles.statusPanel}>
    <p role={loadFailed ? 'alert' : 'status'}>{loading ? t('جارٍ تحميل الاستبيان…', 'Loading survey…') : loadFailed
      ? t('تعذّر تحميل الاستبيان. جرّبوا من جديد.', 'The survey could not load. Please try again.')
      : t('استقبال الردود مغلق حاليًا. تقدروا تستفسروا من فريق المبادرة.', 'The survey is currently closed. You can contact the team with questions.')}</p>
    {!loading && <div className={styles.actions}>
      {loadFailed && <button type="button" className={styles.primary} onClick={() => void load()}>{t('إعادة المحاولة', 'Retry')}</button>}
      {contact}
    </div>}
  </div>;

  if (!definition) return null;

  if (result) return <section className={`${styles.statusPanel} ${styles.result}`} data-survey-success aria-labelledby={`${formId}-result`}>
    <FeatureIcon name="check" size={33} />
    <p>{t('وصلنا ردّكم', 'Your response was received')}</p>
    <h3 id={`${formId}-result`} ref={heading} tabIndex={-1}>{analysisLabels[result.analysis.band][locale]}</h3>
    {result.analysis.score !== null && <>
      <p className={styles.resultScore}><bdi>{result.analysis.score}%</bdi> {t('درجة الجاهزية الأولية', 'initial readiness score')}</p>
      <details>
        <summary>{t('كيف حسبنا النتيجة؟', 'How is this calculated?')}</summary>
        <p>{t('الدرجة هي نقاط الاختيارات مقسومة على أعلى نقاطها الممكنة. أقل من 40٪ يحتاج تجهيزًا، ومن 40 إلى 74٪ يحتاج مراجعة، ومن 75٪ جاهزية أولية للمراجعة التقنية.', 'The score divides selected points by the maximum possible points. Below 40% needs preparation, 40–74% needs review, and 75% or higher indicates initial readiness for technical review.')}</p>
      </details>
    </>}
    <p>{t('النتيجة مبنية على إجاباتكم. تحديد الجاهزية الفعلية والتجهيز يحتاج مراجعة تقنية.', 'The result is based on your answers. Confirming readiness and arranging setup require a technical review.')}</p>
    {result.analysis.recommendations.length > 0 && <>
      <h4>{t('جوانب تستحق المراجعة', 'Areas to review')}</h4>
      <ul>{result.analysis.recommendations.map(id => <li key={id}>{definition.questions.find(question => question.id === id)?.label[locale]}</li>)}</ul>
    </>}
    <p>{t('مرجع الرد', 'Response reference')} <strong><bdi>{result.id}</bdi></strong></p>
    <p>{t('احتفظوا بالمرجع للاستفسار أو لطلب حذف ردّكم.', 'Keep this reference to ask about or request deletion of your response.')}</p>
    <div className={styles.actions}>
      <button className={styles.primary} type="button" onClick={() => {
        setAnswers({}); setConsent(false); setWebsite(''); setStep(0); setResult(null); void load();
      }}>{t('رد جديد', 'New response')}</button>
      {contact}
    </div>
  </section>;

  const current = Math.min(step, definition.groups.length - 1);
  const group = definition.groups[current];
  const fields = definition.questions.filter(question => question.groupId === group.id);
  const last = current === definition.groups.length - 1;

  const move = (next: number) => {
    setFieldError(null);
    setSubmissionError('');
    setStep(next);
    focusHeading();
  };

  const update = (id: string, value: string | string[]) => {
    setAnswers(previous => ({ ...previous, [id]: value }));
    if (fieldError?.id === id) setFieldError(null);
    setSubmissionError('');
  };

  const validateSection = () => {
    for (const question of fields) {
      const value = answers[question.id];
      const input = value === undefined ? {} : { [question.id]: value };
      try {
        validateAnswers({ ...definition, questions: [question] }, input, locale);
      } catch (error) {
        setFieldError({ id: question.id, message: error instanceof Error ? error.message : t('راجعوا الإجابة.', 'Check this answer.') });
        formElement.current?.querySelector<HTMLElement>(`[data-question-id="${question.id}"] :is(input,textarea)`)?.focus();
        return false;
      }
    }
    return true;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current || !validateSection()) return;
    if (!last) { move(current + 1); return; }
    if (!form || preview) return;
    if (!consent) {
      setSubmissionError(t('وافقوا على إرسال الإجابات للمتابعة.', 'Agree to send your answers before submitting.'));
      formElement.current?.querySelector<HTMLElement>('[data-survey-consent]')?.focus();
      return;
    }
    setSubmissionError('');
    submitting.current = true;
    setBusy(true);
    const fallback = t('تعذّر الإرسال. جرّبوا من جديد.', 'Submission failed. Please try again.');
    try {
      const validated = validateAnswers(definition, answers, locale);
      const response = await fetch('/api/engagement/form/submit/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: form.token, locale, answers: validated, consent, website }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(locale === 'ar' || response.status === 422 ? data.error || fallback : fallback);
      setResult(data);
      focusHeading();
    } catch (error) {
      setSubmissionError(error instanceof Error && !(error instanceof TypeError || error instanceof SyntaxError) ? error.message : fallback);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };

  return <div className={styles.survey} data-readiness-survey>
    <aside className={styles.sidebar}>
      <p className={styles.sidebarTitle}>{preview ? t('معاينة المسودة', 'Draft preview') : definition.title[locale]}</p>
      <nav aria-label={t('أقسام الاستبيان', 'Survey sections')}>
        <ol className={styles.steps}>{definition.groups.map((item, index) => <li key={item.id}>
          <button type="button" aria-current={current === index ? 'step' : undefined} disabled={busy || index > current} onClick={() => move(index)}>
            <span className={styles.stepNumber} aria-hidden="true">{index < current ? <FeatureIcon name="check" size={18} /> : index + 1}</span>
            <span>{item.title[locale]}</span>
          </button>
        </li>)}</ol>
      </nav>
      <p className={styles.privacyNote}><FeatureIcon name="encryption" size={21} />{t('الردود يراجعها المدير المخوّل فقط.', 'Only authorized managers review responses.')}</p>
    </aside>
    <form ref={formElement} className={styles.form} autoComplete="off" noValidate onSubmit={submit}>
      <p className={styles.stepLabel}>{t('القسم', 'Section')} <bdi>{current + 1} / {definition.groups.length}</bdi></p>
      <h3 ref={heading} tabIndex={-1}>{group.title[locale]}</h3>
      {current === 0 && <p className={styles.description}>{definition.description[locale]}</p>}
      <fieldset className={styles.fields} disabled={busy}>
        {fields.map(question => {
          const error = fieldError?.id === question.id ? fieldError.message : undefined;
          const fieldId = `${formId}-${question.id}`;
          const help = question.help[locale];
          const describedBy = [help && `${fieldId}-help`, error && `${fieldId}-error`].filter(Boolean).join(' ') || undefined;
          const value = answers[question.id];
          return <fieldset key={question.id} className={styles.question} data-survey-question data-question-id={question.id}>
            <legend>{question.label[locale]} <span className={styles.required} data-required={question.required}>{question.required ? t('مطلوب', 'Required') : t('اختياري', 'Optional')}</span></legend>
            {help && <p className={styles.help} id={`${fieldId}-help`}>{help}</p>}
            {(question.type === 'single' || question.type === 'multi') ? <div className={styles.options}>
              {question.options.map(option => {
                const multi = question.type === 'multi';
                const selectedValues = Array.isArray(value) ? value : [];
                const checked = multi ? selectedValues.includes(option.id) : value === option.id;
                const changeOption = () => {
                  if (!multi) {
                    update(question.id, option.id);
                    return;
                  }
                  const next = checked ? selectedValues.filter(id => id !== option.id) : [...selectedValues, option.id];
                  update(question.id, next);
                };
                return <label key={option.id} data-selected={checked}>
                  <input type={multi ? 'checkbox' : 'radio'} name={fieldId} value={option.id} checked={checked} aria-invalid={Boolean(error)} aria-describedby={describedBy} onChange={changeOption} />
                  <span>{option.label[locale]}{option.score !== null && <small> ({option.score} / {Math.max(...question.options.map(item => item.score ?? 0))} {t('نقاط', 'points')})</small>}</span>
                </label>;
              })}
            </div> : question.type === 'textarea' ? <textarea aria-label={question.label[locale]} required={question.required} aria-invalid={Boolean(error)} aria-describedby={describedBy}
              value={String(value ?? '')} onChange={event => update(question.id, event.target.value)} rows={4} maxLength={2000} />
              : <input aria-label={question.label[locale]} type={question.type} required={question.required} aria-invalid={Boolean(error)} aria-describedby={describedBy}
                min={question.type === 'number' ? 0 : undefined} max={question.type === 'number' ? 99999999 : undefined}
                value={String(value ?? '')} onChange={event => update(question.id, event.target.value)} maxLength={240} />}
            {error && <p id={`${fieldId}-error`} className={styles.error} role="alert">{error}</p>}
          </fieldset>;
        })}
        <div aria-hidden="true" className="sr-only"><label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} /></label></div>
        {last && <div className={styles.consent}>
          <label><input type="checkbox" data-survey-consent checked={consent} onChange={event => { setConsent(event.target.checked); setSubmissionError(''); }} />
            <span>{t('أوافق على إرسال إجاباتي وبيانات التواصل لفريق Fed3 للمراجعة والمتابعة، وحفظ التفاصيل لمدة سنة لدى Supabase في سنغافورة. تبقى مجاميع الإجابات بدون نصوص أو أسماء بعد حذف التفاصيل.', 'I agree to send my answers and contact details to Fed3 for review and follow-up, and retain details for one year with Supabase in Singapore. Aggregated choice counts remain without text or names after details are deleted.')}</span>
          </label>
          <Link className={styles.textLink} href={`/${locale}/privacy/`}>{t('سياسة الخصوصية', 'Privacy policy')}</Link>
        </div>}
        {submissionError && <p className={styles.error} role="alert">{submissionError}</p>}
        <div className={styles.actions}>
          {current > 0 && <button type="button" className={styles.back} onClick={() => move(current - 1)}>{t('السابق', 'Previous')}</button>}
          <button type="submit" className={styles.primary} disabled={busy || (last && isPreview)}>{!last ? t('القسم التالي', 'Next section') : busy ? t('جارٍ الإرسال…', 'Sending…') : preview ? t('الإرسال متوقف في المعاينة', 'Submission disabled in preview') : t('إرسال الإجابات', 'Send answers')}</button>
        </div>
      </fieldset>
      <p className={styles.memoryNote}>{preview ? t('هذه معاينة للأسئلة قبل النشر.', 'Preview of the draft questions before publication.') : t('بتظل إجاباتكم في ذاكرة الصفحة لحين الإرسال. بعد الإرسال بيظهر مرجع الرد للمراجعة.', 'Answers stay in page memory until submission. After sending, you’ll see a reference for follow-up.')}</p>
    </form>
  </div>;
}
