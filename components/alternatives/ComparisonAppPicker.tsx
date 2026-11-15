'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { alternatives } from '@/lib/fed3/alternatives';
import type { Locale } from '@/lib/fed3/config';
import { AppLogo } from './AppLogo';
import styles from './comparison-picker.module.css';

export function ComparisonAppPicker({ locale, selectedId, onSelect }: { locale: Locale; selectedId: string; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const ar = locale === 'ar';
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  return <div ref={root} className={styles.picker} data-comparison-picker onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}>
    <button ref={trigger} type="button" className={styles.trigger} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>{ar ? 'تغيير التطبيق' : 'Change app'}<span aria-hidden="true">⌄</span></button>
    {open && <div className={styles.options} id={id} role="group" aria-label={ar ? 'اختر المقارنة' : 'Choose a comparison'}>
      <p>{ar ? 'أي تطبيق تريد تقارن؟' : 'Which app would you like to compare?'}</p>
      {alternatives.map(app => <button type="button" key={app.id} data-comparison-option={app.id} aria-pressed={app.id === selectedId} onClick={() => { setOpen(false); onSelect(app.id); }}>
        <span className={styles.icons} aria-hidden="true"><AppLogo name={app.current} size={23} /><span>↔</span><AppLogo name={app.name} size={23} /></span>
        <span className={styles.names}><bdi>{app.name}</bdi><small>{ar ? 'بديل لـ' : 'Alternative to'} <bdi>{app.current}</bdi></small></span>
        {app.id === selectedId && <span className={styles.selected} aria-label={ar ? 'المقارنة الحالية' : 'Current comparison'}>✓</span>}
      </button>)}
    </div>}
  </div>;
}
