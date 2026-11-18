'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent, type MouseEvent } from 'react';
import type { Locale } from '@/lib/fed3/config';
import { checkpoints, normalizeTeamCode, readRun, SAVE_KEY, type SavedRun } from '@/lib/fed3/exposed';
import { ExposedEngine, type Snapshot } from './engine';
import { GameMeasurement } from '@/lib/engagement/client';
import MissionBriefing from './MissionBriefing';
import MissionVisual from './MissionVisual';
import styles from './exposed.module.css';

const decisionCopy = {
  ar: [
    { title: 'الملاحة', text: 'شارك موقعك لمسار مباشر، أو اتبع الخريطة بدون بث.', yes: 'شغّل الملاحة', yesNote: 'موقعك للدوريات كل ٣ ثوانٍ', no: 'خريطة محلية', noNote: 'بدون بثّ الموقع' },
    { title: 'بوابة الأرشيف', text: 'شارك جهات الاتصال للمرور فورًا، أو أدخل رمز الفريق.', yes: 'شارك جهات الاتصال', yesNote: 'بتضيف دورية في الحي', no: 'استخدم رمز الفريق', noNote: 'بدون مشاركة الأسماء' },
    { title: 'نسخة الملفات', text: 'السحابة بتخفف حملك، والنسخة المحلية بتضل معك.', yes: 'السحابة فقط', yesNote: 'ركض أطول، تحتاج الحساب', no: 'خذ نسخة محلية', noNote: 'وصول مستقل، حمل إضافي' },
  ],
  en: [
    { title: 'Navigation', text: 'Share your location for a direct route, or use the offline map.', yes: 'Enable navigation', yesNote: 'Patrols get your location every 3 seconds', no: 'Offline map', noNote: 'No location broadcast' },
    { title: 'Archive gate', text: 'Share team contacts for instant access, or enter the team code.', yes: 'Share contacts', yesNote: 'Adds a patrol to the neighborhood', no: 'Use team code', noNote: 'Keep contacts private' },
    { title: 'File copy', text: 'Cloud storage lightens your load. A local copy stays with you.', yes: 'Cloud only', yesNote: 'Longer sprints, needs account access', no: 'Take a local copy', noNote: 'Independent access, extra weight' },
  ],
};

function Icon({ name }: { name: 'close' | 'pause' | 'pulse' | 'jump' | 'sound' | 'full' | 'signal' | 'run' | 'shield' | 'file' | 'cloud' }) {
  const paths = { file: 'M5 3h9l5 5v13H5V3Zm9 0v6h5M8 13h8M8 17h6', cloud: 'M7 18H5a4 4 0 0 1-1-8 7 7 0 0 1 13-2 5 5 0 0 1 2 10h-2m-8-4 3-3 3 3m-3-3v10', close: 'm6 6 12 12M18 6 6 18', pause: 'M8 5v14M16 5v14', pulse: 'm13 2-9 12h7l-1 8 10-13h-7l0-7', jump: 'M12 20V4m-6 6 6-6 6 6', sound: 'M11 4 5 9H2v6h3l6 5V4Zm5 3c4 2 4 8 0 10', full: 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5', signal: 'M5 16a10 10 0 0 1 14 0M2 12a14 14 0 0 1 20 0M9 20a4 4 0 0 1 6 0M12 22h.01', run: 'm7 21 3-7 4 3v5m-9-8 4-6 5 1 3 4h4M15 3h.01', shield: 'M12 3 3 7v6c0 4 9 8 9 8s9-4 9-8V7l-9-4Z' };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

export default function ExposedGame({ locale, onClose }: { locale: Locale; onClose: () => void }) {
  const ar = locale === 'ar';
  const measurement=useRef(new GameMeasurement());
  const root = useRef<HTMLDialogElement>(null), host = useRef<HTMLDivElement>(null), map = useRef<HTMLCanvasElement>(null), engine = useRef<ExposedEngine | null>(null), knob = useRef<HTMLSpanElement>(null);
  const stick = useRef<{ id: number; x: number; y: number; radius: number } | null>(null);
  const [s, setS] = useState<Snapshot | null>(null), [saved, setSaved] = useState<SavedRun | null>(null), [error, setError] = useState('');
  const [sound, setSound] = useState(true), [volume, setVolume] = useState(45), [calm, setCalm] = useState(false), [sprint, setSprint] = useState(false), [crouch, setCrouch] = useState(false), [fullscreen, setFullscreen] = useState(false);
  const [touch, setTouch] = useState(false);
  const [codeNeeded, setCodeNeeded] = useState(false), [teamCode, setTeamCode] = useState(''), [codeError, setCodeError] = useState(false);
  const [briefing, setBriefing] = useState(false), [briefingResume, setBriefingResume] = useState(false);
  const playing = s?.mode === 'playing';
  useEffect(()=>{if(s)measurement.current.observe(s.stage,s.mode==='won'&&!s.choices.cloud);},[s?.stage,s?.mode,s?.choices.cloud]);

  const briefingTick = useCallback(() => engine.current?.briefingTick(), []);
  useEffect(() => { if (!briefing) engine.current?.stopBriefing(); }, [briefing]);

  const openBriefing = (resume: boolean) => { setSound(engine.current?.setSound(sound) ?? false); setBriefingResume(resume); setBriefing(true); };
  const startFromBriefing = () => { setBriefing(false); start(briefingResume); };
  useEffect(() => {
    const previousOverflow = document.body.style.overflow, previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden'; const lenis = window.fed3Lenis; lenis?.stop(); root.current?.setAttribute('closedby', 'none'); root.current?.showModal();
    try { setSaved(readRun(localStorage.getItem(SAVE_KEY))); } catch { /* The game can run without storage. */ }
    const mq = matchMedia('(pointer: coarse)'), update = () => setTouch(mq.matches || navigator.maxTouchPoints > 0); update(); mq.addEventListener('change', update);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)'); setCalm(reduced.matches);
    const onReduced = () => { setCalm(reduced.matches); engine.current?.setCalm(reduced.matches); }; reduced.addEventListener('change', onReduced);
    try {
      engine.current = new ExposedEngine(host.current!, map.current!, setS, ar, setError); engine.current.setCalm(reduced.matches);
    } catch { setError(ar ? 'جهازك أو المتصفح ما قدر يشغّل WebGL 2. جرّب متصفحًا محدثًا مع تفعيل تسريع الرسومات.' : 'This device or browser could not start WebGL 2. Try an updated browser with graphics acceleration enabled.'); }
    const onFull = () => setFullscreen(Boolean(document.fullscreenElement)); document.addEventListener('fullscreenchange', onFull);
    return () => {
      engine.current?.dispose(); engine.current = null; root.current?.close(); mq.removeEventListener('change', update); reduced.removeEventListener('change', onReduced); document.removeEventListener('fullscreenchange', onFull);
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
      document.body.style.overflow = previousOverflow; if (window.fed3Lenis === lenis) lenis?.start(); previousFocus?.focus({ preventScroll: true });
    };
  }, [ar]);
  useEffect(() => { if (!playing) { setSprint(false); setCrouch(false); stick.current = null; if (knob.current) knob.current.style.transform = 'translate(0px,0px)'; } }, [playing]);
  useEffect(() => { setCodeNeeded(false); setTeamCode(''); setCodeError(false); }, [s?.mode, s?.stage]);
  useEffect(() => {
    const selector = s?.mode === 'playing' ? '[data-world] canvas' : s?.mode === 'paused' ? '[data-resume]' : s?.mode === 'decision' ? '[data-choice="share"]' : briefing ? '[data-briefing-start]' : s?.mode === 'intro' ? '[data-start]:not(:disabled)' : 'section button';
    root.current?.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true });
  }, [s?.mode, s?.ready, briefing, error]);
  const time = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
  const cp = checkpoints[s?.stage ?? 0];
  const station = s?.station ?? s?.stage ?? 0;
  const decision = decisionCopy[locale][station];
  const labels = ar ? { clear: 'خارج الرصد', search: 'بحث عن آخر موقع', visual: 'رصد بصري', location: 'موقعك يصل للدوريات' } : { clear: 'OFF THE RADAR', search: 'SEARCHING LAST LOCATION', visual: 'VISUAL CONTACT', location: 'LOCATION TRANSMITTED' };
  const joystick = (e: PointerEvent<HTMLDivElement>) => {
    if (!playing || (stick.current && stick.current.id !== e.pointerId)) return;
    e.preventDefault(); const rect = e.currentTarget.getBoundingClientRect(); stick.current = { id: e.pointerId, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, radius: (rect.width - (knob.current?.offsetWidth ?? 38)) / 2 - 4 }; e.currentTarget.setPointerCapture(e.pointerId); moveStick(e);
  };
  const moveStick = (e: PointerEvent<HTMLDivElement>) => {
    if (stick.current?.id !== e.pointerId || !engine.current) return;
    const dx = e.clientX - stick.current.x, dy = e.clientY - stick.current.y, length = Math.hypot(dx, dy), scale = length > stick.current.radius ? stick.current.radius / length : 1;
    engine.current.controls.x = dx * scale / stick.current.radius; engine.current.controls.y = dy * scale / stick.current.radius;
    if (knob.current) knob.current.style.transform = `translate(${dx * scale}px,${dy * scale}px)`;
  };
  const stopStick = (e: PointerEvent<HTMLDivElement>) => { if (stick.current?.id !== e.pointerId) return; stick.current = null; if (engine.current) { engine.current.controls.x = 0; engine.current.controls.y = 0; } if (knob.current) knob.current.style.transform = 'translate(0px,0px)'; };
  const pressAction = (action: () => void) => ({
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      if (!playing || (e.pointerType === 'mouse' && e.button !== 0)) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      action();
    },
    onClick: (e: MouseEvent<HTMLButtonElement>) => { if (e.detail === 0) action(); },
  });
  const toggleSprint = () => { if (!engine.current) return; const next = !engine.current.controls.sprint; engine.current.controls.sprint = next; setSprint(next); };
  const toggleCrouch = () => { if (!engine.current) return; const next = !engine.current.controls.crouch; engine.current.controls.crouch = next; setCrouch(next); };
  const full = () => { if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined); else void root.current?.requestFullscreen?.().catch(() => undefined); };
  const start = (resume: boolean) => { measurement.current.start(resume?saved?.stage??0:0,resume); setSound(engine.current?.setSound(sound) ?? false); engine.current?.start(resume ? saved : null); setSaved(null); };
  const options = <div className={styles.settings}>
    <label>{ar ? 'الرسومات' : 'Graphics'}<select aria-label={ar ? 'جودة الرسومات' : 'Graphics quality'} value={s?.quality ?? 'auto'} onChange={e => engine.current?.setQuality(e.target.value)}><option value="auto">{ar ? 'تلقائي حسب الأداء' : 'Automatic'}</option><option value="high">{ar ? 'تفاصيل وظلال أعلى' : 'High details & shadows'}</option><option value="low">{ar ? 'أداء أخفّ' : 'Performance'}</option></select></label>
    <button aria-pressed={sound} onClick={() => { setSound(engine.current?.setSound(!sound) ?? false); }}><Icon name="sound" />{ar ? `الصوت ${sound ? 'شغّال' : 'مغلق'}` : `Sound ${sound ? 'on' : 'off'}`}</button>
    <label className={styles.rangeSetting}>{ar ? 'مستوى الصوت' : 'Volume'}<input type="range" min="0" max="100" step="5" value={volume} aria-label={ar ? 'مستوى الصوت' : 'Volume'} onChange={e => { const value = Number(e.target.value); setVolume(value); engine.current?.setVolume(value / 100); }} /><output>{volume}%</output></label>
    <label className={styles.rangeSetting}>{ar ? 'حساسية النظر' : 'Look sensitivity'}<input type="range" min="30" max="150" step="5" value={Math.round((s?.sensitivity ?? .7) * 100)} aria-label={ar ? 'حساسية النظر' : 'Look sensitivity'} onChange={e => engine.current?.setSensitivity(Number(e.target.value) / 100)} /><output>{Math.round((s?.sensitivity ?? .7) * 100)}%</output></label>
    <button aria-pressed={calm} onClick={() => { setCalm(!calm); engine.current?.setCalm(!calm); }}>{ar ? 'تخفيف حركة الكاميرا' : 'Reduce camera motion'}<span>{calm ? '✓' : '○'}</span></button>
  </div>;
  const escape = () => {
    if (briefing) setBriefing(false);
    else if (engine.current?.state.mode === 'decision') engine.current.closeStation();
    else if (engine.current?.state.mode === 'playing' || engine.current?.state.mode === 'paused') engine.current.escapePause();
    else onClose();
  };
  return <dialog ref={root} className={styles.game} dir={ar ? 'rtl' : 'ltr'} aria-label={ar ? 'لعبة مكشوف' : 'Exposed game'} onKeyDownCapture={e => {
    if (e.key !== 'Escape') return;
    e.preventDefault(); e.stopPropagation(); escape();
  }} onKeyDown={e => {
    if (e.key !== 'Tab') return;
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),canvas[tabindex="0"]')).filter(el => el.getClientRects().length && (playing || el.tagName !== 'CANVAS'));
    if (!items.length) return;
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (index < 0 || (e.shiftKey && index === 0) || (!e.shiftKey && index === items.length - 1)) { e.preventDefault(); items[e.shiftKey ? items.length - 1 : 0].focus(); }
  }} onCancel={e => { e.preventDefault(); escape(); }} data-exposed-game data-mode={s?.mode ?? 'loading'} data-stage={s?.stage ?? 0} data-station={s?.station ?? ''} data-look-locked={s?.lookLocked ?? false} data-yaw={s?.yaw.toFixed(4)} data-x={s?.x.toFixed(2)} data-z={s?.z.toFixed(2)} data-touch={touch}>
    <div ref={host} className={styles.world} data-world />
    <div className={`${styles.vignette} ${s && s.health < 35 ? styles.hurt : ''}`} />
    <header className={styles.topbar}>
      <div className={styles.brand}><span className={styles.brandMark}>م</span><div><b>{ar ? 'مكشوف' : 'EXPOSED'}</b><small>FED3 / {ar ? 'بياناتك. قرارك.' : 'YOUR DATA. YOUR DECISION.'}</small></div></div>
      <div className={styles.topActions}>{playing && <button onClick={() => engine.current?.pause()} aria-label={ar ? 'استراحة وإعدادات' : 'Pause and settings'} title={ar ? 'استراحة' : 'Pause'} data-pause><Icon name="pause" /></button>}<button onClick={full} aria-label={ar ? 'ملء الشاشة' : 'Fullscreen'} aria-pressed={fullscreen}><Icon name="full" /></button><button onClick={onClose} aria-label={ar ? 'إغلاق اللعبة' : 'Close game'} data-game-close><Icon name="close" /></button></div>
    </header>
    <aside className={styles.map} aria-label={ar ? 'خريطة المدينة' : 'City map'} data-active={playing} data-location-trace={s?.trace}>
      <div><span>{ar ? 'أثر قراراتك' : 'Your footprint'}</span><b>N ↑</b></div>
      <canvas ref={map} width="180" height="250" />
      <ul className={styles.mapLegend}>
        <li><span aria-hidden="true">◇</span>{ar ? 'إرسال موقع' : 'Location sent'}</li>
        <li><span aria-hidden="true">◉</span>{ar ? 'رصد بصري' : 'Visual contact'}</li>
      </ul>
      {s?.trace === 'last' && <p className={styles.lastSignal}>{ar ? 'آخر موقع وصل' : 'Last location sent'}</p>}
    </aside>
    {playing && s && <>
      <div className={styles.mission}><span className={styles.eyebrow}>{ar ? 'المهمة' : 'OBJECTIVE'} / 0{s.stage + 1}</span><h2>{ar ? cp.ar : cp.en}</h2><div className={styles.missionMeta}><b dir="ltr">{Math.round(s.distance)} m</b><span>{ar ? 'اتبع الضوء البرتقالي' : 'Follow the orange beacon'}</span></div><div className={styles.steps}>{checkpoints.map((p, i) => <span key={p.en} data-done={i < s.stage} data-current={i === s.stage} />)}</div></div>
      <div className={styles.inventory} data-game-inventory data-cloud={s.choices.cloud}><Icon name={s.choices.cloud ? 'cloud' : 'file'} /><span>{ar ? s.choices.cloud ? 'سحابة فقط' : 'نسخة محلية' : s.choices.cloud ? 'CLOUD ONLY' : 'LOCAL COPY'}</span></div>
      <div className={styles.status} data-alert={s.alert}><span className={styles.statusDot} />{labels[s.alert]}<small dir="ltr">{time(s.seconds)}</small></div>
      <div className={styles.crosshair}><span /><i /></div>
      {s.message && <div className={styles.radio} role="status"><span>FED3 / {ar ? 'الاتصال' : 'COMMS'}</span><p>{s.message}</p></div>}
      {s.near && <button className={styles.interact} {...pressAction(() => engine.current?.interact())} data-interact><kbd>Enter</kbd>{ar ? station === 3 ? 'سلّم الملفات' : 'افتح المحطة' : station === 3 ? 'Deliver files' : 'Open station'}<span>↗</span></button>}
      <div className={styles.bottomHud}><div className={styles.meters}><div><Icon name="shield" /><span>{ar ? 'القدرة' : 'INTEGRITY'}</span><b>{Math.ceil(s.health)}</b><i style={{ '--fill': `${s.health}%` } as React.CSSProperties} /></div><div><Icon name="run" /><span>{ar ? 'الطاقة' : 'STAMINA'}</span><b>{Math.ceil(s.stamina)}</b><i style={{ '--fill': `${s.stamina}%` } as React.CSSProperties} /></div></div><div className={styles.desktopHelp}><span><kbd>W A S D</kbd> {ar ? 'حركة' : 'MOVE'}</span><span><kbd>SHIFT</kbd> {ar ? 'ركض' : 'SPRINT'}</span><span><kbd>SPACE</kbd> {ar ? 'قفز' : 'JUMP'}</span><span><kbd>F</kbd> EMP</span><span><kbd>Enter</kbd> {ar ? 'افتح المحطة' : 'OPEN STATION'}</span><span><kbd>C</kbd> {ar ? 'انخفاض' : 'CROUCH'}</span></div></div>
      <div className={styles.tools}>
        {s.stage > 0 && <button className={styles.tracking} {...pressAction(() => engine.current?.toggleNavigation())} data-sharing={s.choices.navigation} aria-pressed={s.choices.navigation} aria-label={ar ? 'تبديل مشاركة الموقع' : 'Toggle location sharing'} data-navigation><Icon name="signal" /><span>{ar ? s.choices.navigation ? 'اقطع بثّ الموقع' : 'الموقع غير مشارك' : s.choices.navigation ? 'STOP LOCATION SHARING' : 'LOCATION PRIVATE'}</span><kbd>N</kbd></button>}
        <button className={styles.emp} {...pressAction(() => engine.current?.shoot())} disabled={s.cooldown > 0} aria-label={ar ? 'نبضة تعطيل الدرون' : 'EMP pulse'} data-pulse><Icon name="pulse" /><span>{s.cooldown > 0 ? `${s.cooldown.toFixed(1)}s` : ar ? 'نبضة' : 'EMP'}</span></button>
      </div>
      <div className={styles.touchControls}>
        <div className={styles.stick} role="group" aria-label={ar ? 'عصا الحركة' : 'Movement joystick'} onPointerDown={joystick} onPointerMove={moveStick} onPointerUp={stopStick} onPointerCancel={stopStick} onLostPointerCapture={stopStick} data-joystick><span className={styles.stickArrows}>↑<br />←　→<br />↓</span><span ref={knob} className={styles.knob} /></div>
        <div className={styles.touchActions}><button aria-label={ar ? 'قفز' : 'Jump'} {...pressAction(() => engine.current?.jump())}><Icon name="jump" /><span>{ar ? 'قفز' : 'JUMP'}</span></button><button aria-label={ar ? 'ركض' : 'Sprint'} aria-pressed={sprint} {...pressAction(toggleSprint)}><Icon name="run" /></button><button aria-label={ar ? 'انخفاض' : 'Crouch'} aria-pressed={crouch} {...pressAction(toggleCrouch)}>↓</button></div>
        <span className={styles.lookHint}>{ar ? 'اسحب على المشهد للنظر' : 'DRAG THE SCENE TO LOOK'}</span>
      </div>
    </>}
    {(s?.mode === 'intro' || !s) && !error && <div className={styles.intro} data-intro><div className={styles.introContent}><p className={styles.chapter}>01 / {ar ? 'لعبة مطاردة وخصوصية' : 'A PRIVACY THRILLER'}</p><h1>{ar ? 'كل خطوة.' : 'Every step.'}<br /><em>{ar ? 'إلها أثر.' : 'Leaves a trace.'}</em></h1><p className={styles.introLead}>{ar ? 'وصل ملفات الفريق للمقرّ، وتجنّب الدرونات.' : 'Deliver the team’s files to the hub. Stay clear of drones.'}</p><div className={styles.startRow}><button className={styles.primary} disabled={!s?.ready} onClick={() => openBriefing(Boolean(saved))} data-start>{s?.ready ? saved ? ar ? 'كمّل مهمتك' : 'Resume mission' : ar ? 'ادخل المدينة' : 'Enter the city' : ar ? 'تجهيز المدينة…' : 'Preparing city…'}<span>↗</span></button>{saved && <button className={styles.secondary} disabled={!s?.ready} onClick={() => openBriefing(false)}>{ar ? 'بداية جديدة' : 'New mission'}</button>}</div><p className={styles.introNote}>{ar ? 'محاكاة ببيانات وأذونات خيالية.' : 'A simulation with fictional data and permissions.'}</p></div><div className={styles.introCaption}><span>AL MADINA / 07</span><b>{ar ? 'الطريق إلك. البيانات لمين؟' : 'Your route. Whose data?'}</b></div></div>}
    {briefing && !error && <MissionBriefing ar={ar} calm={calm} resume={briefingResume} onType={briefingTick} onStart={startFromBriefing} />}
    {s?.mode === 'decision' && <div className={styles.overlay}>
      <section className={`${styles.panel} ${styles.stationPanel}`} aria-labelledby="decision-title" data-station-panel>
        <div className={styles.stationHeading}><span>0{station + 1} / 03</span><button onClick={() => engine.current?.closeStation()} aria-label={ar ? 'إغلاق المحطة' : 'Close station'} data-station-close><Icon name="close" /></button></div>
        <MissionVisual kind={station === 0 ? 'navigation' : station === 1 ? 'contacts' : 'files'} label={decision.text} />
        <h2 id="decision-title">{decision.title}</h2><p>{decision.text}</p>
        <div className={styles.choices}>
          <button onClick={() => engine.current?.choose(true)} data-choice="share"><Icon name={station === 2 ? 'cloud' : 'signal'} /><span>{decision.yes}<small>{decision.yesNote}</small></span><b>↗</b></button>
          <button onClick={() => { if (station === 1) setCodeNeeded(true); else engine.current?.choose(false); }} data-choice="private"><Icon name={station === 2 ? 'file' : 'shield'} /><span>{decision.no}<small>{decision.noNote}</small></span><b>↗</b></button>
        </div>
        {codeNeeded && <form className={styles.codeForm} onSubmit={e => { e.preventDefault(); if (teamCode === '1407') engine.current?.choose(false); else setCodeError(true); }}>
          <label htmlFor="team-code">{ar ? 'رمز الفريق: 1407' : 'Team code: 1407'}</label>
          <div><input id="team-code" aria-label={ar ? 'رمز الفريق' : 'Team code'} aria-invalid={codeError} aria-describedby={codeError ? 'team-code-error' : undefined} inputMode="numeric" autoComplete="off" value={teamCode} onChange={e => { setTeamCode(normalizeTeamCode(e.target.value)); setCodeError(false); }} data-team-code autoFocus /><button type="submit" disabled={teamCode.length !== 4} data-unlock>{ar ? 'افتح البوابة' : 'Unlock gate'}</button></div>
          {codeError && <p id="team-code-error" role="alert">{ar ? 'الرمز غير صحيح. جرّب 1407.' : 'Incorrect code. Try 1407.'}</p>}
        </form>}
      </section>
    </div>}
    {s?.mode === 'paused' && <div className={styles.overlay}><section className={styles.panel}><p className={styles.chapter}>FED3 / {ar ? 'استراحة' : 'PAUSED'}</p><h2>{ar ? 'المدينة بتستناك.' : 'The city can wait.'}</h2>{!touch && <p>{ar ? 'WASD حركة · اسحب للنظر · Space قفز · Shift ركض · F نبضة · Enter محطة · N موقع · C انخفاض' : 'WASD move · Drag to look · Space jump · Shift sprint · F EMP · Enter station · N location · C crouch'}</p>}{options}<button className={styles.primary} onClick={() => engine.current?.resume()} data-resume>{ar ? 'كمّل المهمة' : 'Resume mission'}<span>→</span></button><p className={styles.panelNote}>{s.save ? ar ? 'التقدّم محفوظ على جهازك.' : 'Progress saved on this device.' : ar ? 'التخزين غير متاح. بتقدر تكمّل ضمن هاي الجلسة.' : 'Storage unavailable. You can continue this session.'}</p></section></div>}
    {s?.mode === 'caught' && <div className={styles.overlay}><section className={styles.panel}><p className={styles.chapter}>SIGNAL LOST / 07</p><h2>{ar ? 'وصلوا إلك.' : 'They found you.'}</h2><p>{ar ? 'جرّب تقطع بثّ الموقع، تختبئ وراء مبنى، أو تعطّل الدرون قبل الاقتراب. بنرجعك لآخر محطة مع قراراتك.' : 'Stop location sharing, hide behind a building, or disable a drone before approaching. Return to your last checkpoint with your decisions.'}</p><button className={styles.primary} onClick={() => engine.current?.retry()}>{ar ? 'ارجع لآخر محطة' : 'Retry checkpoint'}<span>↗</span></button></section></div>}
    {s?.mode === 'won' && <div className={styles.overlay}><section className={`${styles.panel} ${styles.result}`}><p className={styles.chapter}>{ar ? 'نهاية المهمة / أثر قراراتك' : 'MISSION COMPLETE / YOUR FOOTPRINT'}</p><h2>{ar ? s.choices.cloud ? 'إنت وصلت. الملفات لسه عندهم.' : 'وصلت. والملفات بإيدك.' : s.choices.cloud ? 'You arrived. The files did not.' : 'You made it. Files in hand.'}</h2><p>{ar ? s.choices.cloud ? 'حساب نكسا توقّف قبل التسليم. ارجع للمحطة وخذ نسخة محلية.' : 'سلّمت نسخة مستقلة للفريق. وقف المشاركة ما بمحي البيانات اللي وصلت.' : s.choices.cloud ? 'NEXA suspended your account before delivery. Return to the station for a local copy.' : 'You delivered an independent copy. Stopping sharing does not erase data already disclosed.'}</p><div className={styles.resultStats} data-decision-map><div><Icon name="signal" /><b><bdi>{s.signals}</bdi></b><span>{ar ? 'مرّات أرسلنا موقعك لنكسا' : 'Location updates sent to NEXA'}</span></div><div><Icon name="file" /><b>{s.choices.cloud ? 'NEXA' : ar ? 'مع الفريق' : 'With your team'}</b><span>{ar ? 'مكان نسخة الملفات' : 'Where your files are'}</span></div><div><Icon name="shield" /><b>{s.choices.contacts ? ar ? 'انكشفت' : 'SHARED' : ar ? 'محلية' : 'LOCAL'}</b><span>{ar ? 'جهات اتصال الفريق' : 'TEAM CONTACTS'}</span></div></div><div className={styles.endLinks}><a href={`/${locale}/alternatives/#comparison`} target="_blank" rel="noreferrer">{ar ? 'قارن أذونات التطبيقات' : 'Compare app data practices'} ↗</a><a href={`/${locale}/home-cloud/#cloud-trial`} target="_blank" rel="noreferrer">{ar ? 'جرّب حفظ ملفاتك على جهازك' : 'Try storing files on your own device'} ↗</a></div>{s.choices.cloud && <button className={styles.primary} onClick={() => engine.current?.recoverFiles()}>{ar ? 'ارجع وخذ نسخة محلية' : 'Return for a local copy'}<span>↗</span></button>}<div className={styles.startRow}><button className={styles.secondary} onClick={() => start(false)}>{ar ? 'جرّب قرارات ثانية' : 'Try other decisions'}</button><button className={styles.secondary} onClick={onClose}>{ar ? 'ارجع للبدائل' : 'Back to alternatives'}</button></div></section></div>}
    {error && <div className={styles.overlay}><section className={styles.panel} role="alert"><p className={styles.chapter}>FED3 / WEBGL</p><h2>{ar ? 'تعذّر تشغيل المدينة' : 'The city could not start'}</h2><p>{error}</p><button className={styles.primary} onClick={onClose}>{ar ? 'ارجع للبدائل' : 'Back to alternatives'}<span>↗</span></button></section></div>}
  </dialog>;
}
