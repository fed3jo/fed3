'use client';

import { useState } from 'react';
import type { Locale } from '@/lib/fed3/config';
import { fileIds, roles, type FileId, type GameAction, type GameState } from '@/lib/fed3/game';
import { files, roleNames, ui } from '@/lib/fed3/game-copy';
import { Character } from './GameWorld';
import styles from './game.module.css';

type IconName = 'file' | 'drive' | 'wifi' | 'photo' | 'lock' | 'chat' | 'check';
export function TaskIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    file: 'M14 6h22l14 14v38H14z M36 6v16h14 M23 34h18 M23 43h18',
    drive: 'M12 12h40v40H12z M12 41h40 M20 47h2 M42 47h2 M23 20h18v12H23z',
    wifi: 'M6 23Q32 1 58 23 M15 33Q32 18 49 33 M24 43Q32 36 40 43 M31 52h2',
    photo: 'M8 10h48v44H8z M8 44l15-18 12 14 9-10 12 14 M41 19h1',
    lock: 'M13 28h38v29H13z M22 28V18a10 10 0 0 1 20 0v10 M32 39v8',
    chat: 'M8 9h48v36H28L14 56V45H8z M19 22h26 M19 32h18',
    check: 'M13 33l12 12 27-28',
  };
  return <svg viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}

export function VisualTask({ state, locale, act }: { state: GameState; locale: Locale; act: (action: GameAction) => void }) {
  const ar = locale === 'ar';
  const c = ui[locale];
  const a = state.answers;
  const [review, setReview] = useState(false);
  const [gallery, setGallery] = useState(false);
  const [picked, setPicked] = useState(false);
  const [inspected, setInspected] = useState(false);
  const [file, setFile] = useState<FileId>('orders');
  const [practice, setPractice] = useState(0);
  const result = (good: boolean, text: string) => <div className={styles.visualResult} data-good={good} role="status"><TaskIcon name={good ? 'check' : 'lock'} /><p>{text}</p></div>;
  const choice = (icon: IconName, label: string, action: GameAction, kind: string) => <button className={styles.objectChoice} data-choice={kind} onClick={() => act(action)}><TaskIcon name={icon} /><span>{label}</span><b aria-hidden="true">↗</b></button>;

  if (state.stage === 'consent') return <div className={styles.deviceScreen}>
    <div className={styles.appIdentity}><span>و</span><strong>{ar ? 'وصلة الضيوف' : 'Guest Link'}</strong><small>{ar ? 'تطبيق خيالي' : 'Fictional app'}</small></div>
    <div className={styles.ticketStack} aria-hidden="true"><span>01</span><span>02</span><span>03</span></div>
    <p className={styles.objectQuestion}>{ar ? 'نسجّل الضيوف. ونسمح بالإعلانات؟' : 'Register guests. Allow personalized ads too?'}</p>
    {a.consent === null ? <>
      <div className={styles.permissionRow}><TaskIcon name="file" /><span>{ar ? 'تنظيم الدعوات' : 'Manage invitations'}</span><b>✓</b></div>
      <button className={styles.permissionRow} aria-expanded={review} onClick={() => setReview(!review)} aria-label={c.reviewed}><TaskIcon name="lock" /><span>{ar ? 'استخدام الاهتمامات للإعلانات' : 'Use interests for advertising'}</span><span className={styles.switchOn} aria-hidden="true" /></button>
      {review && <div className={styles.permissionSheet}><p>{ar ? 'التسجيل بيضل شغّال لو رفضت التخصيص.' : 'Guest registration works even if you decline.'}</p>{choice('lock', c.adChoice, { type: 'consent', value: 'reviewed' }, 'reviewed')}</div>}
      {choice('check', c.quick, { type: 'consent', value: 'quick' }, 'quick')}
    </> : result(a.consent === 'reviewed', ar ? a.consent === 'reviewed' ? 'الدعوات جاهزة. تخصيص الإعلانات مغلق.' : 'الدعوات جاهزة. تخصيص الإعلانات مفعّل.' : a.consent === 'reviewed' ? 'Invitations ready. Personalized ads off.' : 'Invitations ready. Personalized ads on.')}
  </div>;

  if (state.stage === 'photos') return <div className={styles.deviceScreen}>
    <div className={styles.appIdentity}><TaskIcon name="photo" /><strong>{ar ? 'فلتر الصور' : 'Photo filter'}</strong><small>{ar ? 'تطبيق خيالي' : 'Fictional app'}</small></div>
    <p className={styles.objectQuestion}>{ar ? 'موافقة أم يوسف لصورة الدعوة بس. شو نسمح؟' : 'Um Yousef approved the invitation photo only. What can the app access?'}</p>
    <div className={styles.photoGrid}>{[0, 1, 2, 3].map(n => <button key={n} data-photo={n} disabled={!gallery || a.photos !== null || n !== 0} aria-pressed={n === 0 && picked} aria-label={n === 0 ? (ar ? 'اختَر صورة الدعوة' : 'Select invitation photo') : (ar ? 'صورة شخصية غير مصرّح بها' : 'Personal photo without consent')} onClick={() => setPicked(!picked)} data-shared={a.photos === 'all' || a.photos === 'selected' && n === 0}>
      <svg viewBox="0 0 120 88" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="120" height="88" fill={['#dbb47f', '#b8c9ab', '#c9b2b8', '#a7bfd3'][n]} /><circle cx="87" cy="22" r="10" fill="#fff0c9" /><path d="M0 80 36 29 65 64 85 43 120 79V88H0" fill={['#9c7256', '#63816c', '#8b6176', '#5d7d97'][n]} />{n === 0 && <path d="M16 12h45v10H16z" fill="#ffefda" />}</svg>
      <span>{n === 0 ? (ar ? 'صورة الدعوة' : 'Invitation') : (ar ? 'خاصة' : 'Personal')}</span><b aria-hidden="true">{a.photos === 'all' || n === 0 && (picked || a.photos === 'selected') ? '✓' : '○'}</b>
    </button>)}</div>
    <div className={styles.permissionRow}><span aria-hidden="true">♩</span><span>{ar ? 'الميكروفون' : 'Microphone'}</span><small>{ar ? 'غير مطلوب · مغلق' : 'Not needed · off'}</small></div>
    {a.photos === null ? gallery ? <div className={styles.permissionSheet}><p>{ar ? 'اضغط صورة الدعوة، ثم أكّد.' : 'Tap the invitation photo, then confirm.'}</p><button className={styles.primary} data-choice="selected" disabled={!picked} onClick={() => act({ type: 'photos', value: 'selected' })}>{ar ? 'اسمح بالصورة المختارة' : 'Allow selected photo'}<span>✓</span></button><button className={styles.textButton} onClick={() => setGallery(false)}>{ar ? 'ارجع للأذونات' : 'Back to permissions'}</button></div> : <div className={styles.permissionSheet}><button className={styles.objectChoice} data-photo-scope onClick={() => setGallery(true)}><TaskIcon name="photo" /><span>{c.selectedPhotos}</span><b>↗</b></button>{choice('photo', c.allPhotos, { type: 'photos', value: 'all' }, 'all')}</div> : result(a.photos === 'selected', ar ? a.photos === 'selected' ? 'صورة واحدة وصلت. الباقي بقي خارج التطبيق.' : 'التطبيق صار يقدر يصل للصور الأربع.' : a.photos === 'selected' ? 'One photo shared. The rest stay outside the app.' : 'The app can now access all four photos.')}
  </div>;

  if (state.stage === 'network') return <div className={styles.deviceScreen}>
    {a.backup === null ? <>
      <p className={styles.objectQuestion}>{ar ? 'قبل ما نطلع، وين نحفظ نسخة؟' : 'Before leaving, where should we keep a copy?'}</p>
      <div className={styles.transferPicture} aria-hidden="true"><TaskIcon name="file" /><span>···</span><TaskIcon name="drive" /></div>
      {choice('drive', c.prepared, { type: 'backup', value: 'prepared' }, 'prepared')}
      <p className={styles.microcopy}>{ar ? 'نسخة منفصلة عن حساب الخدمة.' : 'A copy separate from the service account.'}</p>
      {choice('file', c.skipped, { type: 'backup', value: 'skipped' }, 'skipped')}
    </> : <>
      <div className={styles.connectionStatus}><TaskIcon name="wifi" /><span>Free_WiFi</span><small>{ar ? 'اتصال المركز انقطع' : 'Center connection lost'}</small></div>
      <p className={styles.objectQuestion}>{ar ? 'هاي صفحة مركزنا؟ افحص العنوان.' : 'Is this our center’s page? Check the address.'}</p>
      <button className={styles.addressBar} aria-label={c.inspect} aria-expanded={inspected} onClick={() => setInspected(!inspected)}><TaskIcon name="lock" /><code dir="ltr">cloud<span data-different={inspected}>-</span>center.example</code><span aria-hidden="true">⌕</span></button>
      {inspected && <div className={styles.addressCompare}><small>{c.official}</small><code dir="ltr">cloud<span>.</span>center.example</code><p>{ar ? 'الشرطة بدل النقطة غيّرت الموقع. القفل لحاله مش إثبات.' : 'A dash instead of a dot changes the site. A lock alone is not proof.'}</p></div>}
      {a.network === null ? <><div className={styles.fakeLogin} aria-hidden="true"><TaskIcon name="lock" /><span>••••••••</span></div>{inspected && choice('check', c.verified, { type: 'network', value: 'verified' }, 'verified')}{choice('wifi', c.mobile, { type: 'network', value: 'mobile' }, 'mobile')}{choice('lock', c.phished, { type: 'network', value: 'phished' }, 'phished')}</> : result(a.network !== 'phished', ar ? a.network === 'phished' ? 'دخلت البيانات في الصفحة المقلّدة.' : 'فتحت عنوان المركز المعروف.' : a.network === 'phished' ? 'Credentials entered on the imitation page.' : 'The center’s known address is open.')}
    </>}
  </div>;

  if (state.stage === 'cloud') return <div className={styles.deviceScreen}>
    <div className={styles.desktopToolbar}><TaskIcon name="drive" /><span>{ar ? 'سحابة المركز' : 'Center cloud'}</span><small dir="ltr">{Object.values(a.access).filter(Boolean).length} / 3</small></div>
    <p className={styles.microcopy} role="status">{a.network === 'phished' ? (ar ? 'ظهر دخول غير معتاد. نراجع الحساب ونستخدم النسخة المستقلة.' : 'Unusual login detected. Review the account and use the independent copy.') : (ar ? 'الحساب متوقف مؤقتاً. جهّز وصول الفريق.' : 'Account temporarily unavailable. Prepare team access.')}</p>
    <div className={styles.folderGrid}>{fileIds.map(id => <button key={id} data-file={id} aria-pressed={file === id} onClick={() => setFile(id)}><TaskIcon name={id === 'portraits' ? 'photo' : 'file'} /><span>{files[id].title[locale]}</span><b>{a.access[id] ? '✓' : '○'}</b></button>)}</div>
    <p className={styles.filePurpose}>{files[file].detail[locale]}</p>
    <p className={styles.objectQuestion}>{c.assign}</p>
    <div className={styles.recipientGrid}>{roles.map((role, index) => <button key={role} data-role={role} aria-pressed={a.access[file] === role} onClick={() => { act({ type: 'access', file, role }); const next = fileIds.find(id => id !== file && a.access[id] === null); if (next) setFile(next); }}>
      {role === 'public' ? <TaskIcon name="wifi" /> : <svg viewBox="-32 -123 64 128" aria-hidden="true"><Character person={(['omar', 'um-yousef', 'salma'] as const)[index]} portrait /></svg>}<span>{roleNames[role][locale]}</span>
    </button>)}</div>
    {a.backup === 'prepared' ? a.restored ? result(true, c.restored) : <button className={styles.restoreDrive} data-game-restore onClick={() => act({ type: 'restore' })}><TaskIcon name="drive" /><span>{c.restore}</span><b>↥</b></button> : <div className={styles.emptyDrive}><TaskIcon name="drive" /><span>{ar ? 'ما جهّزنا نسخة. الاسترجاع غير متاح.' : 'No backup prepared. Recovery unavailable.'}</span></div>}
  </div>;

  if (state.stage === 'community') return <div className={styles.deviceScreen}>
    <div className={styles.chatPeople} aria-hidden="true">{(['salma', 'yaser', 'rana'] as const).map(id => <svg key={id} viewBox="-32 -123 64 128"><Character person={id} portrait /></svg>)}</div>
    {a.community === null ? <><p className={styles.objectQuestion}>{ar ? 'وين نجمع الفريق ونتعلّم سوا؟' : 'Where can the team meet and learn together?'}</p>{choice('chat', c.signal, { type: 'community', value: 'signal' }, 'signal')}<p className={styles.microcopy}>{ar ? 'دعوة وموافقة الإدارة · محاكاة' : 'Invitation and admin approval · simulation'}</p>{choice('chat', c.existing, { type: 'community', value: 'existing' }, 'existing')}<p className={styles.microcopy}>{ar ? 'سياسة الخدمة الخيالية تسمح للمشغّل بمعالجة الرسائل.' : 'The fictional service’s policy allows its operator to process messages.'}</p></> : a.community === 'existing' ? result(false, ar ? 'المحادثة بقيت على الخدمة الحالية.' : 'The conversation stays with the current service.') : <>
      <div className={styles.chatTitle}><TaskIcon name="chat" /><strong>Signal <small>{ar ? 'محاكاة' : 'Simulation'}</small></strong><span>✓</span></div>
      <div className={styles.chatBubble}>{ar ? 'رنا: طيب، كيف بسترجع الملف لحالي؟' : 'Rana: How do I restore the file myself?'}</div>
      {a.trained ? result(true, c.trained) : <div className={styles.practiceObjects}>{[c.practiceFile, c.practiceRestore, c.practiceOpen].map((label, index) => <button key={index} data-practice-step={index} disabled={practice !== index} data-complete={practice > index} onClick={() => { if (index === 2) act({ type: 'train' }); else setPractice(index + 1); }}><TaskIcon name={(['file', 'drive', 'check'] as const)[index]} /><span>{label}</span><b>{practice > index ? '✓' : index + 1}</b></button>)}</div>}
      <p className={styles.microcopy}>{ar ? 'نشارك بموافقة أصحاب المحتوى. المستلم ممكن ينسخ الرسالة.' : 'Share with the owners’ consent. Recipients can still copy messages.'}</p>
    </>}
  </div>;
  return null;
}
