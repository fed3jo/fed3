'use client';

import { Component, type ErrorInfo, type ReactNode, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Locale } from '@/lib/fed3/config';
import styles from './launcher.module.css';

const OpeningNight = dynamic(() => import('./OpeningNight'), { ssr: false, loading: () => <div className={styles.loading} role="status"><span />Fed3 / Opening Tomorrow…</div> });
class GameBoundary extends Component<{ children: ReactNode; close: () => void; locale: Locale }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo) { /* Keep failures inside the optional game. No telemetry is sent. */ }
  render() { return this.state.error ? <div className={styles.error} role="alert"><p>{this.props.locale === 'ar' ? 'تعذّر فتح اللعبة. تقدّمك المحفوظ يبقى على هذا الجهاز. ارجع للصفحة وحاول مرة ثانية.' : 'The game could not open. Saved progress stays on this device. Return and try again.'}</p><button onClick={this.props.close}>{this.props.locale === 'ar' ? 'العودة للبدائل' : 'Back to alternatives'}</button></div> : this.props.children; }
}
export function GameLauncher({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const ar = locale === 'ar';
  return <>
    <section id="game" tabIndex={-1} className={styles.teaser} aria-labelledby="game-heading" data-game-teaser>
      <div className={styles.art}><img src="/game/cover.png" width="502" height="442" alt={ar ? 'مركز مجتمعي مجسّم فيه سوق ومعرض وسحابة محلية وست شخصيات.' : 'An isometric community center with market stalls, an archive, a local server and six people.'} loading="lazy" decoding="async" /><span className={styles.artLabel}>{ar ? 'حكايات وسوق / ليلة الافتتاح' : 'Stories & Market / Opening night'}</span></div>
      <div className={styles.copy}><p className={styles.eyebrow}>03 / {ar ? 'العبها، وشوف أثر قرارك' : 'Play and see your decisions'}</p><h2 id="game-heading">{ar ? 'بكرا الافتتاح' : 'Opening Tomorrow'}<span>.</span></h2><p className={styles.lead}>{ar ? 'الناس سلّمتكم صورها وطلباتها. جهّزوا الأدوات والملفات والفريق، وشوفوا شو بيضل بإيدكم لما تتغيّر الظروف.' : 'Your neighbors have trusted you with their photos and orders. Prepare the tools, files and team. Discover what stays in your hands when circumstances change.'}</p><div className={styles.tags}><span>{ar ? '5 مواقف مترابطة' : '5 connected decisions'}</span><span>{ar ? 'حوالي 6–7 دقائق' : 'About 6–7 minutes'}</span><span>{ar ? 'تقدّم محفوظ محلياً' : 'Progress saved locally'}</span></div><button className={styles.start} onClick={() => setOpen(true)} data-game-launch>{ar ? 'ابدأ الليلة' : 'Start the night'}<span aria-hidden="true">↗</span></button><p className={styles.note}>{ar ? 'محاكاة بشخصيات وملفات خيالية. خذ وقتك، وجرّب تغيّر قراراتك.' : 'A simulation with fictional people and files. Take your time and try different decisions.'}</p></div>
    </section>
    {open && <GameBoundary close={() => setOpen(false)} locale={locale}><OpeningNight locale={locale} onClose={() => setOpen(false)} /></GameBoundary>}
  </>;
}
