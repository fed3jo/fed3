import { useEffect, useState } from 'react';
import type { Locale } from '@/lib/fed3/config';
import { FeatureIcon } from '@/components/shared/FeatureIcon';
import styles from './file-journey.module.css';

const copy = {
  ar: {
    title: 'ارفعوا ملف. شوفوا وين بينحفظ.',
    sample: 'خطة الورشة.pdf', device: 'جهاز الفريق', server: 'خادم المؤسسة', backup: 'قرص احتياطي',
    button: 'جرّبوا رفع الملف', retry: 'أعيدوا التجربة', access: 'مين بوصل للملف؟',
    modes: ['على شبكة المؤسسة', 'عبر شبكة خاصة', 'عبر الإنترنت'],
    accessNotes: [
      'الفريق بيفتح الملف من نفس الشبكة، بحساب وصلاحية.',
      'أجهزة مخوّلة بتوصل من خارج المؤسسة عبر شبكة خاصة.',
      'المسؤول بيجهّز عنوانًا آمنًا عبر HTTPS. صلاحيات الملفات بتظل قائمة.',
    ],
    states: ['تجربة توضيحية بملف جاهز.', 'الملف بطريقه لخادم المؤسسة…', 'انحفظ الملف على خادمكم.', 'نسختان. الأصل على الخادم، ونسخة على قرص منفصل.'],
    copy: 'اعملوا نسخة احتياطية', kept: 'الملف الأصلي', separate: 'نسخة منفصلة عند الطلب',
  },
  en: {
    title: 'Send a file. See where it lives.',
    sample: 'Workshop plan.pdf', device: 'Team device', server: 'Your local server', backup: 'Backup drive',
    button: 'Try sending the file', retry: 'Replay the example', access: 'Who can open the file?',
    modes: ['On site', 'Private network', 'Over the internet'],
    accessNotes: [
      'People on the same network open it with an account and permission.',
      'Authorized devices connect from outside through a private network.',
      'An administrator configures an HTTPS address. File permissions still apply.',
    ],
    states: ['An example with a sample file.', 'The file is on its way to your local server…', 'The file is on your server.', 'Two copies. The original on your server and a copy on a separate drive.'],
    copy: 'Make a backup', kept: 'Original file', separate: 'Separate copy on demand',
  },
};

export function CloudFileJourney({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const [phase, setPhase] = useState(0);
  const [mode, setMode] = useState(0);
  useEffect(() => {
    if (phase !== 1) return;
    const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 620;
    const timer = window.setTimeout(() => setPhase(2), delay);
    return () => window.clearTimeout(timer);
  }, [phase]);

  return <section id="cloud-flow" tabIndex={-1} className={styles.section} aria-labelledby="cloud-flow-heading">
    <h2 id="cloud-flow-heading">{c.title}</h2>
    <div className={styles.story} data-file-phase={phase}>
      <div className={styles.diagram}>
        <div className={styles.node}><FeatureIcon name="platforms" size={31} /><strong>{c.device}</strong><span>{c.sample}</span></div>
        <span className={styles.connection} aria-hidden="true"><i /><FeatureIcon name="folder" size={18} /></span>
        <div className={styles.server}><FeatureIcon name="control" size={33} /><strong>{c.server}</strong><span>{c.kept}</span></div>
        <span className={styles.branch} aria-hidden="true">+</span>
        <div className={styles.node} data-backed-up={phase === 3}><FeatureIcon name="backup" size={30} /><strong>{c.backup}</strong><span>{c.separate}</span></div>
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={() => setPhase(phase === 2 ? 3 : 1)} disabled={phase === 1}>{phase === 2 ? c.copy : phase === 3 ? c.retry : c.button}</button>
        <p role="status">{c.states[phase]}</p>
      </div>
    </div>
    <details className={styles.access}>
      <summary>{c.access}</summary>
      <div role="group" aria-label={locale === 'ar' ? 'طريقة الوصول' : 'Access method'}>
        {c.modes.map((name, index) => <button key={name} aria-pressed={index === mode} type="button" onClick={() => setMode(index)}>{name}</button>)}
      </div>
      <p role="status">{c.accessNotes[mode]}</p>
    </details>
  </section>;
}
