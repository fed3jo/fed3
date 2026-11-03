'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Locale } from '@/lib/fed3/config';
import { canContinue, concerns, continuity, gameReducer, initialGame, outcome, readGame, SAVE_KEY, saveGame, stages, type GameAction, type GameState } from '@/lib/fed3/game';
import { concernCopy, people, sceneCopy, ui, type PersonId } from '@/lib/fed3/game-copy';
import { Character, GameWorld } from './GameWorld';
import styles from './game.module.css';
import { VisualTask } from './VisualTask';

export default function OpeningNight({ locale, onClose }: { locale: Locale; onClose: () => void }) {
  const c = ui[locale];
  const ar = locale === 'ar';
  const [state, setState] = useState<GameState>(initialGame);
  const [loaded, setLoaded] = useState(false);
  const [resumePrompt, setResumePrompt] = useState(false);
  const [canSave, setCanSave] = useState(true);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [askReset, setAskReset] = useState(false);
  const [calm, setCalm] = useState(false);
  const [systemCalm, setSystemCalm] = useState(false);
  const [sound, setSound] = useState(false);
  const [voice, setVoice] = useState(false);
  const [deviceVoice, setDeviceVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [selected, setSelected] = useState<PersonId>('salma');
  const [taskOpen, setTaskOpen] = useState(false);
  const worldHeading = useRef<HTMLHeadingElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const audio = useRef<AudioContext | null>(null);
  const toneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const effectivelyPaused = paused || hidden || askReset || resumePrompt;
  const reduced = calm || systemCalm;
  const scene = sceneCopy[state.stage];
  const person = people.find(item => item.id === selected)!;
  const sceneIndex = stages.indexOf(state.stage);

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const lenis = window.fed3Lenis;
    lenis?.stop();
    dialog.current?.showModal();
    const visibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', visibility);
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => setSystemCalm(motion.matches);
    onMotion(); motion.addEventListener('change', onMotion);
    try {
      const saved = readGame(localStorage.getItem(SAVE_KEY));
      if (saved && saved.stage !== 'intro') { setState(saved); setResumePrompt(true); }
      setCalm(localStorage.getItem('fed3-game-calm') === 'true');
    } catch { setCanSave(false); }
    setLoaded(true);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      motion.removeEventListener('change', onMotion);
      document.body.style.overflow = oldOverflow;
      if (window.fed3Lenis === lenis) lenis?.start();
      if (toneTimer.current) clearTimeout(toneTimer.current);
      void audio.current?.close().catch(() => undefined);
      if ('speechSynthesis' in window) speechSynthesis.cancel();
      opener?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    if (!loaded || resumePrompt) return;
    try { localStorage.setItem(SAVE_KEY, saveGame(state)); } catch { setCanSave(false); }
  }, [state, loaded, resumePrompt]);
  useEffect(() => {
    setSelected(sceneCopy[state.stage].speaker); setTaskOpen(state.stage === 'ending');
    dialog.current?.querySelector('[data-game-scroll]')?.scrollTo(0, 0);
    dialog.current?.querySelector('[data-game-controls]')?.scrollTo(0, 0);
    if (loaded && !resumePrompt) (taskOpen ? heading.current : worldHeading.current)?.focus({ preventScroll: true });
  }, [state.stage, loaded, resumePrompt]);
  useEffect(() => {
    // A removed pause/confirmation button otherwise leaves focus on document.body.
    if (loaded && !paused && !resumePrompt && !askReset) (taskOpen ? heading.current : worldHeading.current)?.focus({ preventScroll: true });
  }, [loaded, paused, resumePrompt, askReset, taskOpen, selected]);
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const choose = () => setDeviceVoice(speechSynthesis.getVoices().find(item => item.localService && item.lang.toLowerCase().startsWith(locale)) || null);
    choose(); speechSynthesis.addEventListener('voiceschanged', choose);
    return () => speechSynthesis.removeEventListener('voiceschanged', choose);
  }, [locale]);
  const speak = useCallback(() => {
    if (!deviceVoice || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(sceneCopy[state.stage].task[locale]);
    utterance.voice = deviceVoice; utterance.lang = deviceVoice.lang; utterance.rate = .95;
    speechSynthesis.speak(utterance);
  }, [deviceVoice, locale, state.stage]);
  useEffect(() => {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    if (voice && taskOpen && !effectivelyPaused) speak();
    return () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); };
  }, [voice, taskOpen, effectivelyPaused, speak]);

  const tone = useCallback((enabled: boolean) => {
    if (!enabled) return;
    try {
      const ctx = audio.current || new AudioContext(); audio.current = ctx;
      if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined);
      const oscillator = ctx.createOscillator(); const gain = ctx.createGain();
      oscillator.connect(gain); gain.connect(ctx.destination);
      oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(440, ctx.currentTime); oscillator.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + .12);
      gain.gain.setValueAtTime(0, ctx.currentTime); gain.gain.linearRampToValueAtTime(.035, ctx.currentTime + .015); gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .18);
      oscillator.start(); oscillator.stop(ctx.currentTime + .2);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    } catch { setSound(false); }
  }, []);
  const act = useCallback((action: GameAction) => {
    if (effectivelyPaused) return;
    setState(previous => gameReducer(previous, action)); tone(sound);
  }, [effectivelyPaused, tone, sound]);
  const choosePerson = useCallback((id: PersonId) => { setSelected(id); setTaskOpen(true); }, []);
  const closeTask = () => { setTaskOpen(false); requestAnimationFrame(() => dialog.current?.querySelector<SVGElement>(`[data-person="${selected}"]`)?.focus()); };
  const openMission = () => { setSelected(scene.speaker); setTaskOpen(true); };
  const isMission = selected === scene.speaker;
  const missionPerson = people.find(item => item.id === scene.speaker)!;
  const reset = () => { setState(initialGame()); setAskReset(false); setResumePrompt(false); setPaused(false); };
  const jumpToComparison = () => { onClose(); requestAnimationFrame(() => document.getElementById('comparison')?.scrollIntoView({ behavior: 'instant', block: 'start' })); };
  const toggleMotion = () => { setCalm(value => { try { localStorage.setItem('fed3-game-calm', String(!value)); } catch { /* Motion remains available for the session. */ } return !value; }); };
  const feedback = (text: string) => <div className={styles.feedback} role="status"><span aria-hidden="true">✓</span><p><small>{c.feedback}</small>{text}</p></div>;

  return <dialog ref={dialog} className={styles.modal} dir={ar ? 'rtl' : 'ltr'} lang={locale} aria-labelledby="opening-night-title" onCancel={event => { event.preventDefault(); if (askReset) setAskReset(false); else if (paused) setPaused(false); else if (resumePrompt) onClose(); else if (taskOpen) closeTask(); else onClose(); }} onKeyDown={event => {
    if (event.key !== 'Tab') return;
    const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], summary, select:not(:disabled), [tabindex="0"]')).filter(node => !node.closest('[inert]') && node.getClientRects().length > 0 && getComputedStyle(node).visibility !== 'hidden');
    const index = focusable.indexOf(document.activeElement as HTMLElement);
    if (event.shiftKey && index <= 0 || !event.shiftKey && (index < 0 || index === focusable.length - 1)) {
      event.preventDefault(); (event.shiftKey ? focusable.at(-1) : focusable[0])?.focus();
    }
  }} data-game-dialog data-stage={state.stage} data-calm={reduced} data-paused={effectivelyPaused} data-lenis-prevent>
    <div className={styles.shell}>
      <header className={styles.topbar} inert={askReset || resumePrompt}>
        <div className={styles.brand}><span className={styles.brandMark} aria-hidden="true">F<span>3</span></span><div><strong id="opening-night-title">{c.title}</strong><small>{c.simulation}</small></div></div>
        <div className={styles.tools}>
          <button onClick={() => setPaused(value => !value)} aria-label={paused ? c.unpause : c.pause} aria-pressed={paused} title={paused ? c.unpause : c.pause}><span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span><span>{paused ? c.unpause : c.pause}</span></button>
          <button onClick={() => { setSound(value => !value); tone(!sound); }} aria-label={sound ? c.sound : c.muted} aria-pressed={sound} title={sound ? c.sound : c.muted}><span aria-hidden="true">♫</span><span>{sound ? c.sound : c.muted}</span></button>
          <button onClick={() => setVoice(value => !value)} aria-label={c.voice} aria-pressed={voice} disabled={!deviceVoice} title={deviceVoice ? c.voice : c.unavailable}><span aria-hidden="true">◖</span><span>{c.voice}</span></button>
          <button onClick={toggleMotion} aria-label={c.motion} aria-pressed={reduced} title={c.motion}><span aria-hidden="true">≈</span><span>{c.motion}</span></button>
          <button className={styles.close} onClick={onClose} aria-label={c.close}><span aria-hidden="true">×</span><span>{c.close}</span></button>
        </div>
      </header>

      <div className={styles.playBody} inert={effectivelyPaused} data-game-scroll>
        <div className={styles.sceneSide} inert={taskOpen}>
          <div className={styles.sceneHeader}><span className={styles.station}>{scene.station[locale]}</span><span className={styles.nightLabel}>{state.stage === 'intro' ? (ar ? 'قبل الغروب' : 'Before sunset') : state.stage === 'ending' ? (ar ? 'الصبح' : 'Morning') : (ar ? 'ليلة الافتتاح' : 'Opening night')}<i /></span></div>
          <div className={styles.worldWrap}><GameWorld state={state} locale={locale} selected={selected} onPerson={choosePerson} calm={reduced} paused={effectivelyPaused} />
            <div className={styles.personCard} aria-live="polite"><span style={{ background: person.color }} /><div><strong>{person[locale]}</strong><small>{person.role[locale]}</small></div><p>{ar ? "اضغط الشخصية لتفتح مهمتها" : "Tap a character to open their task"}</p></div>
            <div className={styles.sceneStamp} aria-hidden="true">حكايات<span>&</span>سوق<small>STORIES & MARKET</small></div>
          </div>
          <nav className={styles.chapterNav} aria-label={ar ? 'مسار الليلة' : 'Tonight’s path'}>{(['consent', 'photos', 'network', 'cloud', 'community'] as const).map((stage, index) => <span key={stage} data-current={stage === state.stage} data-complete={sceneIndex > index + 1}><b>{String(index + 1).padStart(2, '0')}</b><span>{sceneCopy[stage].title[locale]}</span></span>)}</nav>
          <div className={styles.worldPrompt}><div><small>{state.stage === 'intro' ? c.title : scene.station[locale]}</small><h2 ref={worldHeading} tabIndex={-1}>{state.stage === 'intro' ? (ar ? 'المركز بحاجة إلك الليلة' : 'The center needs you tonight') : state.stage === 'ending' ? scene.title[locale] : (ar ? `اضغط على ${missionPerson.ar}` : `Tap ${missionPerson.en}`)}</h2></div><button className={styles.primary} onClick={state.stage === 'intro' ? () => act({ type: 'next' }) : openMission} data-game-next={state.stage === 'intro' ? true : undefined} data-open-mission>{state.stage === 'intro' ? c.start : state.stage === 'ending' ? c.results : (ar ? 'افتح المهمة' : 'Open task')}<span>↗</span></button></div>
        </div>

        {taskOpen && <div className={styles.taskBackdrop} onClick={event => { if (event.target === event.currentTarget) closeTask(); }}>
        <section className={styles.taskWindow} data-device={isMission ? ['consent', 'photos', 'community'].includes(state.stage) ? 'phone' : state.stage === 'ending' ? 'results' : 'desktop' : 'person'} aria-label={c.mission} data-game-controls>
          <header className={styles.taskHeader}><div className={styles.speaker}><svg viewBox="-35 -125 70 110" aria-hidden="true"><Character person={selected} portrait /></svg><span>{person[locale]}</span></div><button className={styles.taskClose} onClick={closeTask} aria-label={ar ? 'ارجع للمركز' : 'Back to the center'}>×</button></header>
          <h2 className={styles.taskTitle} ref={heading} tabIndex={-1}>{isMission ? scene.title[locale] : person.role[locale]}</h2>
          {!isMission ? <div className={styles.personGreeting}><svg viewBox="-40 -145 80 160" aria-hidden="true"><Character person={selected} selected portrait /></svg><p>{ar ? `أنا ${person.ar}. هسا الدور على ${missionPerson.ar}.` : `I’m ${person.en}. It’s ${missionPerson.en}’s turn now.`}</p><button className={styles.primary} onClick={openMission}>{ar ? `روح لمهمة ${missionPerson.ar}` : `Open ${missionPerson.en}’s task`}<span>↗</span></button></div> : <>
          {state.stage === 'intro' && <div className={styles.personGreeting}><p>{ar ? 'بكرا الافتتاح. صور الناس وطلباتهم معنا. نجهّزها سوا؟' : 'Opening tomorrow. People trusted us with their photos and orders. Ready to help?'}</p></div>}
          <VisualTask key={state.stage} state={state} locale={locale} act={act} />
          {state.stage === 'ending' && <div className={styles.tasks} data-game-results><div className={styles.resultBanner} data-outcome={outcome(state)}><span>{outcome(state) === 'ready' ? '✦' : '↻'}</span><h3>{c[outcome(state)]}</h3><p>{c.morning}</p></div><div className={styles.readiness}>{(Object.entries(continuity(state)) as [keyof ReturnType<typeof continuity>, boolean][]).map(([key, value]) => <div key={key}><span>{c[key]}</span><strong data-ready={value}>{value ? c.yes : c.no}</strong></div>)}</div><h3 className={styles.smallTitle}>{c.timeline}</h3>{concerns(state).length ? <div className={styles.timeline}>{concerns(state).map(key => <article key={key}><span className={styles.timelineDot} /><h4>{concernCopy[key].title[locale]}</h4><p>{concernCopy[key].text[locale]}</p><button onClick={() => act({ type: 'rewind', stage: concernCopy[key].stage })}>{c.revisit} <span aria-hidden="true">↶</span></button></article>)}</div> : feedback(c.success)}<div className={styles.nextSteps}><p>{c.nextSteps}</p><button onClick={jumpToComparison}>{c.alternatives}<span>↗</span></button><Link href={`/${locale}/home-cloud/`} onClick={onClose}>{c.cloud}<span>↗</span></Link><Link href={`/${locale}/communities/`} onClick={onClose}>{c.community}<span>↗</span></Link></div><details className={styles.sources}><summary>{c.endSources}</summary><p>{ar ? 'قواعد القصة تصف هذه المحاكاة فقط. الشبكة العامة وحدها لا تكشف كلمات السر عبر HTTPS. الاستضافة المحلية تحتاج إدارة ونسخاً واختبار استعادة. واستخدام تطبيق مشفّر لا يمنع المستلم من نسخ المحتوى.' : 'Rules describe this simulation only. Public Wi-Fi alone does not expose passwords over HTTPS. Local hosting needs administration, backups and recovery tests. Encrypted messaging cannot stop recipients copying content.'}</p><a href="https://consumer.ftc.gov/articles/are-public-wi-fi-networks-safe-what-you-need-know" target="_blank" rel="noopener noreferrer">FTC / HTTPS & Wi-Fi ↗</a><a href="https://docs.nextcloud.com/server/latest/admin_manual/maintenance/backup.html" target="_blank" rel="noopener noreferrer">Nextcloud / Backup ↗</a><a href="https://support.signal.org/hc/en-us/articles/360007320771-Set-and-manage-disappearing-messages" target="_blank" rel="noopener noreferrer">Signal / Sharing limits ↗</a></details></div>}

          {state.stage !== 'ending' && canContinue(state) && <div className={styles.continueRow}><button className={styles.primary} disabled={!canContinue(state)} onClick={() => act({ type: 'next' })} data-game-next>{state.stage === 'intro' ? c.begin : state.stage === 'community' ? c.results : c.next}<span aria-hidden="true">↗</span></button></div>}
          </>}<footer className={styles.controlFooter}><span>{canSave ? c.saved : c.unsaved}</span><button onClick={() => setAskReset(true)} aria-label={c.restartLabel}>{c.fresh}</button></footer>
        </section></div>}
      </div>
      {(paused || resumePrompt || askReset) && <div className={styles.pauseCover} role="group" aria-label={askReset ? c.reset : resumePrompt ? c.resume : c.paused}><div className={styles.pauseCard}><span className={styles.pauseSymbol} aria-hidden="true">{askReset ? '↻' : '☾'}</span><h2>{askReset ? c.reset : resumePrompt ? c.resume : c.paused}</h2><p>{c.simulation}</p>{askReset ? <><button autoFocus className={styles.primary} onClick={() => setAskReset(false)}>{c.cancel}</button><button className={styles.secondary} onClick={reset}>{c.confirm}</button></> : resumePrompt ? <><button autoFocus className={styles.primary} onClick={() => setResumePrompt(false)}>{c.resume}</button><button className={styles.secondary} onClick={reset}>{c.fresh}</button><button className={styles.textButton} onClick={onClose}>{c.close}</button></> : <><button autoFocus className={styles.primary} onClick={() => setPaused(false)}>{c.unpause}</button><button className={styles.textButton} onClick={onClose}>{c.close}</button></>}</div></div>}
    </div>
  </dialog>;
}
