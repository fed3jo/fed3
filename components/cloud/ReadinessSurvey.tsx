'use client';
import { useRef, useState } from 'react';
import type { Locale } from '@/lib/fed3/config';
import { cloudCopy, cloudSurvey } from '@/lib/fed3/cloud';
import { FeatureIcon } from '@/components/shared/FeatureIcon';
import styles from './cloud.module.css';

export function ReadinessSurvey({ locale }: { locale: Locale }) {
  const c = cloudCopy[locale];
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const heading = useRef<HTMLHeadingElement>(null);
  const move = (next: number) => {
    setStep(next);
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
  };
  const update = (id: string, value: string | string[]) => setAnswers(current => ({ ...current, [id]: value }));
  const selected = (id: string, index: number) => Array.isArray(answers[id]) ? answers[id].includes(String(index)) : answers[id] === String(index);
  return <div className={styles.survey} data-readiness-survey>
    <aside className={styles.surveyIntro}><span className={styles.surveySymbol}><FeatureIcon name="check" size={40} /></span><p>{c.preview}</p><h3>{locale === 'ar' ? 'نتعرّف عليكم، قبل التجهيز.' : 'Understand your team before setup.'}</h3><nav aria-label={c.preview}>{c.surveyGroups.map((name, index) => <button key={name} type="button" aria-label={name} aria-current={step === index ? 'step' : undefined} onClick={() => move(index)}><span>0{index + 1}</span>{name}</button>)}</nav><p className={styles.previewNote}><FeatureIcon name="encryption" size={18} />{c.previewNote}</p></aside>
    <form className={styles.surveyForm} onSubmit={event => event.preventDefault()} autoComplete="off" data-survey-preview>
      <div className={styles.surveyHeading}><div><p>{c.progress} {step + 1} {c.of} 3</p><h3 ref={heading} tabIndex={-1}>{c.surveyGroups[step]}</h3></div><span className={styles.soon}>{c.soon}</span></div>
      <div className={styles.surveyProgress} aria-hidden="true">{[0,1,2].map(i => <span key={i} data-complete={i <= step} />)}</div>
      {cloudSurvey[step].map((field, index) => <fieldset key={field.id} className={styles.question} data-survey-question>
        <legend><small>{String(cloudSurvey.slice(0, step).flat().length + index + 1).padStart(2, '0')}</small>{field.label[locale]}{field.optional && <span>{c.optional}</span>}</legend>
        {field.type === 'text' ? <input aria-label={field.label[locale]} value={String(answers[field.id] || '')} onChange={event => update(field.id, event.target.value)} maxLength={240} /> : field.type === 'textarea' ? <textarea aria-label={field.label[locale]} value={String(answers[field.id] || '')} onChange={event => update(field.id, event.target.value)} rows={4} maxLength={2000} /> : <>
          {field.type === 'checkbox' && <p className={styles.multiHint}>{c.multi}</p>}
          <div className={styles.options}>{field.options?.map((option, i) => <label key={i} data-selected={selected(field.id, i)}><input type={field.type} name={field.id} value={i} checked={selected(field.id, i)} onChange={() => {
            if (field.type === 'radio') update(field.id, String(i));
            else { const current = Array.isArray(answers[field.id]) ? answers[field.id] as string[] : []; update(field.id, current.includes(String(i)) ? current.filter(value => value !== String(i)) : [...current, String(i)]); }
          }} /><span>{option[locale]}</span></label>)}</div>
          {field.hasOther && selected(field.id, (field.options?.length || 1) - 1) && <input className={styles.otherInput} aria-label={locale === 'ar' ? 'وضّح الإجابة الأخرى' : 'Describe your other answer'} placeholder={locale === 'ar' ? 'وضّح إجابتك' : 'Describe your answer'} value={String(answers[`${field.id}-other`] || '')} onChange={event => update(`${field.id}-other`, event.target.value)} maxLength={500} />}
        </>}
      </fieldset>)}
      <div className={styles.surveyActions}><button type="button" className={styles.back} disabled={step === 0} onClick={() => move(step - 1)}>{c.back}</button>{step < 2 ? <button type="button" className={styles.next} onClick={() => move(step + 1)}>{c.next}<span aria-hidden="true">↗</span></button> : <button type="submit" className={styles.next} disabled>{c.submit}</button>}</div>
      <p className={styles.noSend}>{c.previewNote}</p>
    </form>
  </div>;
}
