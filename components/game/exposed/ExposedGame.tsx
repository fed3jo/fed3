'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { Locale } from '@/lib/fed3/config';
import { checkpoints, readRun, SAVE_KEY, type SavedRun } from '@/lib/fed3/exposed';
import { ExposedEngine, type Snapshot } from './engine';
import styles from './exposed.module.css';

const decisionCopy = {
  ar: [
    { kicker: '01 / الراحة إلها مقابل', title: 'أقصر طريق. مين بعرفه معك؟', text: 'تطبيق نكسا بعرض لك المسار المباشر، وبيبث موقعك لدوريات المدينة كل ثلاث ثوانٍ. بتقدر توقف المشاركة بأي وقت.', yes: 'شغّل الملاحة وشارك الموقع', yesNote: 'مسار مباشر مقابل بثّ موقعك', no: 'استخدم الخريطة المحلية', noNote: 'اتبع اللوحات بدون بثّ الموقع' },
    { kicker: '02 / بياناتك بتوصل لغيرك', title: 'بوابة سريعة. دفتر عناوين كامل.', text: 'نكسا بطلب جهات اتصال الفريق لتفعيل المرور السريع. مشاركة الأسماء بتضيف دورية في الحي. رمز الفريق بفتح البوابة بدون تسليم دفتر العناوين.', yes: 'امنح الوصول لجهات الاتصال', yesNote: 'مرور سريع، ومعلومات إضافية عند نكسا', no: 'افتح برمز الفريق', noNote: 'الملفات وجهات الاتصال بتظلّ معك' },
    { kicker: '03 / وين نسختك؟', title: 'خفّف حملك. بس مين معه الملفات؟', text: 'بتقدر تترك النسخة المحلية وتعتمد على حساب نكسا، فيصير الركض أخفّ. أو تحمل نسخة مستقلة لحدّ المقرّ. الوصول للحساب رح يحدد شو بتقدر تسلّم.', yes: 'اعتمد على حساب نكسا فقط', yesNote: 'ركض أطول، بدون نسخة مستقلة', no: 'احتفظ بالنسخة المحلية', noNote: 'حمل إضافي، ووصول مستقل للملفات' },
  ],
  en: [
    { kicker: '01 / The price of convenience', title: 'The shortest route. Who else can see it?', text: 'NEXA navigation shows a direct route and broadcasts your location to city patrols every three seconds. You can stop sharing at any time.', yes: 'Enable navigation and share location', yesNote: 'A direct route in exchange for location updates', no: 'Use the offline map', noNote: 'Follow street signs without broadcasting' },
    { kicker: '02 / Other people’s data', title: 'One quick gate. An entire address book.', text: 'NEXA asks for team contacts to enable fast access. Sharing them brings an extra patrol to the neighborhood. Your team code also opens the gate without handing over contacts.', yes: 'Grant access to team contacts', yesNote: 'Fast access, more information for NEXA', no: 'Use the team code', noNote: 'Keep contacts and files with your team' },
    { kicker: '03 / Where is your copy?', title: 'Travel light. Who holds the files?', text: 'Leave the local copy and rely on your NEXA account to sprint for longer, or carry an independent copy to the hub. Account access will determine what you can deliver.', yes: 'Rely on the NEXA account only', yesNote: 'Longer sprints, no independent copy', no: 'Keep an independent local copy', noNote: 'More weight, independent access to files' },
  ],
};

function Icon({ name }: { name: 'close' | 'pause' | 'pulse' | 'jump' | 'sound' | 'full' | 'signal' | 'run' | 'shield' }) {
  const paths = { close: 'm6 6 12 12M18 6 6 18', pause: 'M8 5v14M16 5v14', pulse: 'm13 2-9 12h7l-1 8 10-13h-7l0-7', jump: 'M12 20V4m-6 6 6-6 6 6', sound: 'M11 4 5 9H2v6h3l6 5V4Zm5 3c4 2 4 8 0 10', full: 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5', signal: 'M5 16a10 10 0 0 1 14 0M2 12a14 14 0 0 1 20 0M9 20a4 4 0 0 1 6 0M12 22h.01', run: 'm7 21 3-7 4 3v5m-9-8 4-6 5 1 3 4h4M15 3h.01', shield: 'M12 3 3 7v6c0 4 9 8 9 8s9-4 9-8V7l-9-4Z' };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

export default function ExposedGame({ locale, onClose }: { locale: Locale; onClose: () => void }) {
  const ar = locale === 'ar';
  const root = useRef<HTMLDialogElement>(null), host = useRef<HTMLDivElement>(null), map = useRef<HTMLCanvasElement>(null), engine = useRef<ExposedEngine | null>(null), knob = useRef<HTMLSpanElement>(null);
  const stick = useRef<{ id: number; x: number; y: number } | null>(null);
  const [s, setS] = useState<Snapshot | null>(null), [saved, setSaved] = useState<SavedRun | null>(null), [error, setError] = useState('');
  const [sound, setSound] = useState(false), [calm, setCalm] = useState(false), [sprint, setSprint] = useState(false), [crouch, setCrouch] = useState(false), [fullscreen, setFullscreen] = useState(false);
  const [touch, setTouch] = useState(false);
  const [codeNeeded, setCodeNeeded] = useState(false), [teamCode, setTeamCode] = useState('');
  const [briefing, setBriefing] = useState(false), [briefingResume, setBriefingResume] = useState(false);
  const [charCount, setCharCount] = useState(0), [typingComplete, setTypingComplete] = useState(false);
  const playing = s?.mode === 'playing';

  const briefingText = ar
    ? `• معك بيانات شخصية وملفات حساسة جداً تخصك وتخص فريقك.\n\n• في درون مراقبة في سماء المدينة، بحاول يرصد موقعك ويكشف بياناتك في أي لحظة.\n\n• سلاح النبضة (EMP): معك سلاح نبضة كهرومغناطيسية، استخدمه لتعطيل الدرون بشكل مؤقت عند اقترابه حتى تقدر تهرب وتغيّر مسارك.\n\n• هدف الفوز: تحرّك بحذر عبر الشوارع، وتجنّب كشف موقعك، واوصل لآخر مكان في المدينة (مقر Fed3) لتأمين البيانات بنجاح وتفوز باللعبة.`
    : `• You are carrying sensitive personal data and critical files belonging to you and your team.\n\n• A surveillance drone patrols the city skies, actively scanning to detect your location and compromise your data at any moment.\n\n• EMP Pulse Weapon: You are equipped with an EMP pulse weapon. Use it to temporarily disable the drone when it gets close so you can evade and escape.\n\n• Objective to Win: Move carefully through the streets, avoid detection, and reach the final safehouse (Fed3 HQ) to secure your data and win the game.`;

  useEffect(() => {
    if (!briefing) { setCharCount(0); setTypingComplete(false); return; }
    if (calm) { setCharCount(briefingText.length); setTypingComplete(true); return; }
    setCharCount(0); setTypingComplete(false);
    const timer = setInterval(() => {
      setCharCount(c => {
        const next = c + 2;
        if (next >= briefingText.length) {
          clearInterval(timer);
          setTypingComplete(true);
          return briefingText.length;
        }
        return next;
      });
    }, 16);
    return () => clearInterval(timer);
  }, [briefing, briefingText, calm]);

  const skipTyping = () => { setCharCount(briefingText.length); setTypingComplete(true); };
  const openBriefing = (resume: boolean) => { setBriefingResume(resume); setBriefing(true); };
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
  useEffect(() => { setCodeNeeded(false); setTeamCode(''); }, [s?.mode, s?.stage]);
  useEffect(() => {
    const selector = s?.mode === 'playing' ? '[data-world] canvas' : s?.mode === 'paused' ? '[data-resume]' : s?.mode === 'decision' ? '[data-choice="share"]' : briefing ? '[data-briefing-start]' : s?.mode === 'intro' ? '[data-start]:not(:disabled)' : 'section button';
    root.current?.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true });
  }, [s?.mode, s?.ready, briefing, error]);
  const time = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
  const cp = checkpoints[s?.stage ?? 0];
  const labels = ar ? { clear: 'خارج الرصد', search: 'بحث عن آخر موقع', visual: 'رصد بصري', location: 'موقعك يصل للدوريات' } : { clear: 'OFF THE RADAR', search: 'SEARCHING LAST LOCATION', visual: 'VISUAL CONTACT', location: 'LOCATION TRANSMITTED' };
  const joystick = (e: PointerEvent<HTMLDivElement>) => {
    if (!playing || (stick.current && stick.current.id !== e.pointerId)) return;
    e.preventDefault(); const rect = e.currentTarget.getBoundingClientRect(); stick.current = { id: e.pointerId, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }; e.currentTarget.setPointerCapture(e.pointerId); moveStick(e);
  };
  const moveStick = (e: PointerEvent<HTMLDivElement>) => {
    if (stick.current?.id !== e.pointerId || !engine.current) return;
    const dx = e.clientX - stick.current.x, dy = e.clientY - stick.current.y, length = Math.hypot(dx, dy), scale = length > 42 ? 42 / length : 1;
    engine.current.controls.x = dx * scale / 42; engine.current.controls.y = dy * scale / 42;
    if (knob.current) knob.current.style.transform = `translate(${dx * scale}px,${dy * scale}px)`;
  };
  const stopStick = (e: PointerEvent<HTMLDivElement>) => { if (stick.current?.id !== e.pointerId) return; stick.current = null; if (engine.current) { engine.current.controls.x = 0; engine.current.controls.y = 0; } if (knob.current) knob.current.style.transform = 'translate(0px,0px)'; };
  const full = () => { if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined); else void root.current?.requestFullscreen?.().catch(() => undefined); };
  const start = (resume: boolean) => { engine.current?.start(resume ? saved : null); setSaved(null); };
  const options = <div className={styles.settings}>
    <label>{ar ? 'الرسومات' : 'Graphics'}<select aria-label={ar ? 'جودة الرسومات' : 'Graphics quality'} value={s?.quality ?? 'auto'} onChange={e => engine.current?.setQuality(e.target.value)}><option value="auto">{ar ? 'تلقائي حسب الأداء' : 'Automatic'}</option><option value="high">{ar ? 'تفاصيل وظلال أعلى' : 'High details & shadows'}</option><option value="low">{ar ? 'أداء أخفّ' : 'Performance'}</option></select></label>
    <button aria-pressed={sound} onClick={() => { setSound(!sound); engine.current?.setSound(!sound); }}><Icon name="sound" />{ar ? `الصوت ${sound ? 'شغّال' : 'مغلق'}` : `Sound ${sound ? 'on' : 'off'}`}</button>
    <button aria-pressed={calm} onClick={() => { setCalm(!calm); engine.current?.setCalm(!calm); }}>{ar ? 'تخفيف حركة الكاميرا' : 'Reduce camera motion'}<span>{calm ? '✓' : '○'}</span></button>
  </div>;
  return <dialog ref={root} className={styles.game} dir={ar ? 'rtl' : 'ltr'} aria-label={ar ? 'لعبة مكشوف' : 'Exposed game'} onKeyDownCapture={e => {
    if (e.key !== 'Escape') return;
    e.preventDefault(); e.stopPropagation();
    if (briefing) setBriefing(false);
    else if (engine.current?.state.mode === 'playing') engine.current.pause();
    else if (engine.current?.state.mode === 'paused') engine.current.resume();
    else onClose();
  }} onKeyDown={e => {
    if (e.key !== 'Tab') return;
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),canvas[tabindex="0"]')).filter(el => el.getClientRects().length && (playing || el.tagName !== 'CANVAS'));
    if (!items.length) return;
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (index < 0 || (e.shiftKey && index === 0) || (!e.shiftKey && index === items.length - 1)) { e.preventDefault(); items[e.shiftKey ? items.length - 1 : 0].focus(); }
  }} onCancel={e => { e.preventDefault(); }} data-exposed-game data-mode={s?.mode ?? 'loading'} data-stage={s?.stage ?? 0} data-x={s?.x.toFixed(2)} data-z={s?.z.toFixed(2)} data-touch={touch}>
    <div ref={host} className={styles.world} data-world />
    <div className={`${styles.vignette} ${s && s.health < 35 ? styles.hurt : ''}`} />
    <header className={styles.topbar}>
      <div className={styles.brand}><span className={styles.brandMark}>م</span><div><b>{ar ? 'مكشوف' : 'EXPOSED'}</b><small>FED3 / {ar ? 'بياناتك. قرارك.' : 'YOUR DATA. YOUR DECISION.'}</small></div></div>
      <div className={styles.topActions}>{playing && <button onClick={() => engine.current?.pause()} aria-label={ar ? 'استراحة وإعدادات' : 'Pause and settings'} title={ar ? 'استراحة' : 'Pause'} data-pause><Icon name="pause" /></button>}<button onClick={full} aria-label={ar ? 'ملء الشاشة' : 'Fullscreen'} aria-pressed={fullscreen}><Icon name="full" /></button><button onClick={onClose} aria-label={ar ? 'إغلاق اللعبة' : 'Close game'} data-game-close><Icon name="close" /></button></div>
    </header>
    <aside className={styles.map} aria-label={ar ? 'خريطة المدينة' : 'City map'} data-active={playing}><div><span>{ar ? 'المدينة / القطاع 07' : 'CITY / SECTOR 07'}</span><b>N ↑</b></div><canvas ref={map} width="180" height="250" /><small><i />{ar ? 'إنت هون' : 'YOUR POSITION'}<i />{ar ? 'الوجهة' : 'DESTINATION'}</small></aside>
    {playing && s && <>
      <div className={styles.mission}><span className={styles.eyebrow}>{ar ? 'المهمة' : 'OBJECTIVE'} / 0{s.stage + 1}</span><h2>{ar ? cp.ar : cp.en}</h2><div className={styles.missionMeta}><b dir="ltr">{Math.round(s.distance)} m</b><span>{ar ? 'اتبع الضوء البرتقالي' : 'Follow the orange beacon'}</span></div><div className={styles.steps}>{checkpoints.map((p, i) => <span key={p.en} data-done={i < s.stage} data-current={i === s.stage} />)}</div></div>
      <div className={styles.status} data-alert={s.alert}><span className={styles.statusDot} />{labels[s.alert]}<small dir="ltr">{time(s.seconds)}</small></div>
      <div className={styles.crosshair}><span /><i /></div>
      {s.message && <div className={styles.radio} role="status"><span>FED3 / {ar ? 'الاتصال' : 'COMMS'}</span><p>{s.message}</p></div>}
      {s.near && <button className={styles.interact} onClick={() => engine.current?.interact()} data-interact><kbd>E</kbd>{ar ? s.stage === 3 ? 'سلّم الملفات' : 'افتح المحطة' : s.stage === 3 ? 'Deliver files' : 'Open station'}<span>↗</span></button>}
      <div className={styles.bottomHud}><div className={styles.meters}><div><Icon name="shield" /><span>{ar ? 'القدرة' : 'INTEGRITY'}</span><b>{Math.ceil(s.health)}</b><i style={{ '--fill': `${s.health}%` } as React.CSSProperties} /></div><div><Icon name="run" /><span>{ar ? 'الطاقة' : 'STAMINA'}</span><b>{Math.ceil(s.stamina)}</b><i style={{ '--fill': `${s.stamina}%` } as React.CSSProperties} /></div></div><div className={styles.desktopHelp}><span><kbd>W A S D</kbd> {ar ? 'حركة' : 'MOVE'}</span><span><kbd>SHIFT</kbd> {ar ? 'ركض' : 'SPRINT'}</span><span><kbd>SPACE</kbd> {ar ? 'قفز' : 'JUMP'}</span><span><kbd>F</kbd> EMP</span><span><kbd>C</kbd> {ar ? 'انخفاض' : 'CROUCH'}</span></div></div>
      <div className={styles.tools}>
        {s.stage > 0 && <button className={styles.tracking} onClick={() => engine.current?.toggleNavigation()} data-sharing={s.choices.navigation} aria-pressed={s.choices.navigation} aria-label={ar ? 'تبديل مشاركة الموقع' : 'Toggle location sharing'} data-navigation><Icon name="signal" /><span>{ar ? s.choices.navigation ? 'اقطع بثّ الموقع' : 'الموقع غير مشارك' : s.choices.navigation ? 'STOP LOCATION SHARING' : 'LOCATION PRIVATE'}</span><kbd>N</kbd></button>}
        <button className={styles.emp} onClick={() => engine.current?.shoot()} disabled={s.cooldown > 0} aria-label={ar ? 'نبضة تعطيل الدرون' : 'EMP pulse'} data-pulse><Icon name="pulse" /><span>{s.cooldown > 0 ? `${s.cooldown.toFixed(1)}s` : ar ? 'نبضة' : 'EMP'}</span></button>
      </div>
      <div className={styles.touchControls}>
        <div className={styles.stick} role="group" aria-label={ar ? 'عصا الحركة' : 'Movement joystick'} onPointerDown={joystick} onPointerMove={moveStick} onPointerUp={stopStick} onPointerCancel={stopStick} onLostPointerCapture={stopStick} data-joystick><span className={styles.stickArrows}>↑<br />←　→<br />↓</span><span ref={knob} className={styles.knob} /></div>
        <div className={styles.touchActions}><button aria-label={ar ? 'قفز' : 'Jump'} onPointerDown={e => { e.preventDefault(); engine.current?.jump(); }}><Icon name="jump" /><span>{ar ? 'قفز' : 'JUMP'}</span></button><button aria-label={ar ? 'ركض' : 'Sprint'} aria-pressed={sprint} onClick={() => { const next = !sprint; setSprint(next); if (engine.current) engine.current.controls.sprint = next; }}><Icon name="run" /></button><button aria-label={ar ? 'انخفاض' : 'Crouch'} aria-pressed={crouch} onClick={() => { const next = !crouch; setCrouch(next); if (engine.current) engine.current.controls.crouch = next; }}>↓</button></div>
        <span className={styles.lookHint}>{ar ? 'اسحب على المشهد للنظر' : 'DRAG THE SCENE TO LOOK'}</span>
      </div>
    </>}
    {(s?.mode === 'intro' || !s) && !error && <div className={styles.intro} data-intro><div className={styles.introContent}><p className={styles.chapter}>01 / {ar ? 'لعبة مطاردة وخصوصية' : 'A PRIVACY THRILLER'}</p><h1>{ar ? 'كل خطوة.' : 'Every step.'}<br /><em>{ar ? 'إلها أثر.' : 'Leaves a trace.'}</em></h1><p className={styles.introLead}>{ar ? 'مدينة بتعرف عنك أكثر مما بتتخيّل. معك ملفات فريقك، وقدّامك طريق للمقرّ. قرّر شو تشارك، وتحرك قبل ما يسبقوك.' : 'A city that knows more than you think. Carry your team’s files to the hub. Choose what to share, and move before the city catches up.'}</p><div className={styles.introDetails}><span>3D / {ar ? 'منظور أول' : 'FIRST PERSON'}</span><span>{ar ? 'لمس + لوحة مفاتيح' : 'TOUCH + KEYBOARD'}</span><span>{ar ? 'حفظ عند المحطات' : 'CHECKPOINT SAVES'}</span></div><div className={styles.startRow}><button className={styles.primary} disabled={!s?.ready} onClick={() => openBriefing(Boolean(saved))} data-start>{s?.ready ? saved ? ar ? 'كمّل مهمتك' : 'Resume mission' : ar ? 'ادخل المدينة' : 'Enter the city' : ar ? 'تجهيز المدينة…' : 'Preparing city…'}<span>↗</span></button>{saved && <button className={styles.secondary} disabled={!s?.ready} onClick={() => openBriefing(false)}>{ar ? 'بداية جديدة' : 'New mission'}</button>}</div><p className={styles.introNote}>{ar ? 'على الكمبيوتر: W A S D أو الأسهم، واسحب للنظر. على التلفون: عصا حركة وسحب للنظر. كل البيانات والأذونات خيالية.' : 'Desktop: WASD or arrows, drag to look. Mobile: joystick and drag to look. All data and permissions are fictional.'}</p></div><div className={styles.introCaption}><span>AL MADINA / 07</span><b>{ar ? 'الطريق إلك. البيانات لمين؟' : 'Your route. Whose data?'}</b></div></div>}
    {briefing && !error && (
      <div className={styles.briefingOverlay} data-briefing role="dialog" aria-modal="true" aria-label={ar ? 'برقية المهمة' : 'Mission Briefing'}>
        <section className={styles.briefingCard}>
          <header className={styles.briefingHeader}>
            <div className={styles.briefingBadge}>
              <span className={styles.briefingDot} />
              <span>{ar ? 'برقية المهمة · إرسال مشفّر' : 'MISSION BRIEFING · ENCRYPTED LINK'}</span>
            </div>
            <small className={styles.briefingStatus}>
              {typingComplete ? (ar ? 'اكتمل البث' : 'TRANSMISSION COMPLETE') : (ar ? 'جارٍ فك التشفير…' : 'DECRYPTING…')}
            </small>
          </header>

          <h2 className={styles.briefingTitle}>
            {ar ? 'حماية بياناتك · تعطيل الدرون والوصول للمقر' : 'Protect Your Data · Stun the Drone & Escape'}
          </h2>

          <div
            className={styles.briefingBody}
            onClick={skipTyping}
            role="region"
            aria-live="polite"
            title={ar ? 'انقر لإظهار كامل النص' : 'Click to reveal all text'}
          >
            <p className={styles.briefingText}>
              {briefingText.slice(0, charCount)}
              {!typingComplete && <span className={styles.cursor} aria-hidden="true" />}
            </p>
          </div>

          <div className={styles.briefingControls}>
            <div className={styles.controlGroup}>
              <b>{ar ? 'تحكم الكمبيوتر:' : 'Desktop Controls:'}</b>
              <span><kbd>W A S D</kbd> {ar ? 'حركة' : 'Move'} · <kbd>F</kbd> {ar ? 'سلاح نبضة (EMP)' : 'EMP Pulse'}</span>
              <span><kbd>Space</kbd> {ar ? 'قفز' : 'Jump'} · <kbd>Shift</kbd> {ar ? 'ركض' : 'Sprint'}</span>
            </div>
            <div className={styles.controlGroup}>
              <b>{ar ? 'تحكم الهاتف:' : 'Mobile Controls:'}</b>
              <span>{ar ? 'عصا اللمس للحركة' : 'Touch joystick to move'}</span>
              <span>{ar ? 'زر النبضة لتعطيل الدرون' : 'EMP button to stun drone'} · {ar ? 'سحب الشاشة للنظر' : 'Drag screen to look'}</span>
            </div>
          </div>

          <div className={styles.briefingActions}>
            <button
              className={styles.primary}
              onClick={startFromBriefing}
              data-briefing-start
              autoFocus
            >
              <span>{briefingResume ? (ar ? 'متابعة المهمة وانطلاق' : 'Resume Mission & Deploy') : (ar ? 'ابدأ المهمة وانطلاق' : 'Deploy into City')}</span>
              <span>↗</span>
            </button>
            {!typingComplete && (
              <button
                type="button"
                className={styles.secondary}
                onClick={skipTyping}
                data-briefing-skip
              >
                {ar ? 'تخطي الشرح' : 'Skip typing'}
              </button>
            )}
          </div>
        </section>
      </div>
    )}
    {s?.mode === 'decision' && <div className={styles.overlay}><section className={styles.panel} aria-labelledby="decision-title"><p className={styles.chapter}>{decisionCopy[locale][s.stage].kicker}</p><h2 id="decision-title">{decisionCopy[locale][s.stage].title}</h2><p>{decisionCopy[locale][s.stage].text}</p><div className={styles.choices}><button onClick={() => engine.current?.choose(true)} data-choice="share"><Icon name="signal" /><span>{decisionCopy[locale][s.stage].yes}<small>{decisionCopy[locale][s.stage].yesNote}</small></span><b>↗</b></button><button onClick={() => { if (s.stage === 1) setCodeNeeded(true); else engine.current?.choose(false); }} data-choice="private"><Icon name="shield" /><span>{decisionCopy[locale][s.stage].no}<small>{decisionCopy[locale][s.stage].noNote}</small></span><b>↗</b></button></div>{codeNeeded && <form className={styles.codeForm} onSubmit={e => { e.preventDefault(); if (teamCode === '1407') engine.current?.choose(false); }}><label htmlFor="team-code">{ar ? 'رسالة الفريق: رمز البوابة 1407' : 'Team message: gate code 1407'}</label><div><input id="team-code" aria-label={ar ? 'رمز الفريق' : 'Team code'} inputMode="numeric" autoComplete="off" maxLength={4} value={teamCode} onChange={e => setTeamCode(e.target.value.replace(/[^0-9]/g, ''))} data-team-code autoFocus /><button type="submit" disabled={teamCode !== '1407'} data-unlock>{ar ? 'افتح البوابة' : 'Unlock gate'}</button></div></form>}<small className={styles.panelNote}>{ar ? 'محاكاة داخل اللعبة. ما بنطلب أذونات جهازك.' : 'An in-game simulation. We do not request device permissions.'}</small></section></div>}
    {s?.mode === 'paused' && <div className={styles.overlay}><section className={styles.panel}><p className={styles.chapter}>FED3 / {ar ? 'استراحة' : 'PAUSED'}</p><h2>{ar ? 'المدينة بتستناك.' : 'The city can wait.'}</h2><p>{ar ? 'W A S D أو الأسهم للحركة. اسحب للنظر، أو اضغط على المشهد لتثبيت الماوس. Space للقفز، Shift للركض، F للنبضة، E للتفاعل، N للموقع، وC للانخفاض.' : 'WASD or arrows to move. Drag to look, or click the scene to lock the mouse. Space to jump, Shift to sprint, F for EMP, E to interact, N for location and C to crouch.'}</p>{options}<button className={styles.primary} onClick={() => engine.current?.resume()} data-resume>{ar ? 'كمّل المهمة' : 'Resume mission'}<span>→</span></button><p className={styles.panelNote}>{s.save ? ar ? 'قراراتك محفوظة عند آخر محطة على هذا الجهاز.' : 'Decisions saved at the last checkpoint on this device.' : ar ? 'التخزين غير متاح. بتقدر تكمّل ضمن هاي الجلسة.' : 'Storage unavailable. You can continue this session.'}</p></section></div>}
    {s?.mode === 'caught' && <div className={styles.overlay}><section className={styles.panel}><p className={styles.chapter}>SIGNAL LOST / 07</p><h2>{ar ? 'وصلوا إلك.' : 'They found you.'}</h2><p>{ar ? 'جرّب تقطع بثّ الموقع، تختبئ وراء مبنى، أو تعطّل الدرون قبل الاقتراب. بنرجعك لآخر محطة مع قراراتك.' : 'Stop location sharing, hide behind a building, or disable a drone before approaching. Return to your last checkpoint with your decisions.'}</p><button className={styles.primary} onClick={() => engine.current?.retry()}>{ar ? 'ارجع لآخر محطة' : 'Retry checkpoint'}<span>↗</span></button></section></div>}
    {s?.mode === 'won' && <div className={styles.overlay}><section className={`${styles.panel} ${styles.result}`}><p className={styles.chapter}>{ar ? 'نهاية المهمة / أثر قراراتك' : 'MISSION COMPLETE / YOUR FOOTPRINT'}</p><h2>{ar ? s.choices.cloud ? 'إنت وصلت. الملفات لسه عندهم.' : 'وصلت. والملفات بإيدك.' : s.choices.cloud ? 'You arrived. The files did not.' : 'You made it. Files in hand.'}</h2><p>{ar ? s.choices.cloud ? 'في هاي المحاكاة، توقّف حساب نكسا قبل التسليم. ترك النسخة المحلية خلّى الفريق يعتمد على فتح الحساب. بتقدر ترجع لمحطة الملفات وتجرّب تحتفظ بنسخة مستقلة.' : 'سلّمت نسخة مستقلة للفريق. تغيير أداة أو إذن بوقف مشاركة جديدة، لكنه ما بمحي المعلومات اللي وصلت قبل.' : s.choices.cloud ? 'In this simulation, NEXA suspended your account before delivery. Without a local copy, the team depends on account access. Return to the transfer station to try an independent copy.' : 'You delivered an independent copy. Changing an app or permission stops new sharing, but does not erase information already disclosed.'}</p><div className={styles.resultStats}><div><b dir="ltr">{time(s.seconds)}</b><span>{ar ? 'وقت المهمة' : 'MISSION TIME'}</span></div><div><b>{s.pulses}</b><span>{ar ? 'نبضات تعطيل' : 'EMP PULSES'}</span></div><div><b>{s.choices.contacts ? ar ? 'انكشفت' : 'SHARED' : ar ? 'محلية' : 'LOCAL'}</b><span>{ar ? 'جهات اتصال الفريق' : 'TEAM CONTACTS'}</span></div></div><div className={styles.endLinks}><a href={`/${locale}/apps/brave/`} target="_blank" rel="noreferrer">{ar ? 'تعرّف على تقليل التتبّع' : 'Explore tracker blocking'} ↗</a><a href={`/${locale}/apps/nextcloud/`} target="_blank" rel="noreferrer">{ar ? 'افهم حفظ الملفات ومشاركتها' : 'Understand file control'} ↗</a></div>{s.choices.cloud && <button className={styles.primary} onClick={() => engine.current?.recoverFiles()}>{ar ? 'ارجع وخذ نسخة محلية' : 'Return for a local copy'}<span>↗</span></button>}<div className={styles.startRow}><button className={styles.secondary} onClick={() => engine.current?.start()}>{ar ? 'جرّب قرارات ثانية' : 'Try other decisions'}</button><button className={styles.secondary} onClick={onClose}>{ar ? 'ارجع للبدائل' : 'Back to alternatives'}</button></div></section></div>}
    {error && <div className={styles.overlay}><section className={styles.panel} role="alert"><p className={styles.chapter}>FED3 / WEBGL</p><h2>{ar ? 'تعذّر تشغيل المدينة' : 'The city could not start'}</h2><p>{error}</p><button className={styles.primary} onClick={onClose}>{ar ? 'ارجع للبدائل' : 'Back to alternatives'}<span>↗</span></button></section></div>}
  </dialog>;
}
