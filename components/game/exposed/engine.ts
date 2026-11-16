import * as THREE from 'three';
import { buildCity, type City } from './city';
import { checkpoints, START, SAVE_KEY, inside, segmentBlocked, observe, streetRoute, type Choices, type DroneKnowledge, type SavedRun, type Point } from '@/lib/fed3/exposed';

export type Mode = 'intro' | 'playing' | 'paused' | 'decision' | 'caught' | 'won';
export type Snapshot = { mode: Mode; stage: number; health: number; stamina: number; cooldown: number; seconds: number; choices: Choices; distance: number; near: boolean; alert: 'clear' | 'search' | 'visual' | 'location'; message: string; x: number; z: number; pulses: number; ready: boolean; fps: number; quality: string; save: boolean };
export type Controls = { x: number; y: number; sprint: boolean; jump: boolean; crouch: boolean };
type Drone = { mesh: THREE.Group; home: THREE.Vector3; knowledge: DroneKnowledge; stunned: number; fire: number; lock: number };
export class ExposedEngine {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(68, 1, .08, 210);
  renderer: THREE.WebGLRenderer;
  city: City;
  controls: Controls = { x: 0, y: 0, sprint: false, jump: false, crouch: false };
  state: Snapshot = { mode: 'intro', stage: 0, health: 100, stamina: 100, cooldown: 0, seconds: 0, choices: { navigation: false, contacts: false, cloud: false }, distance: 0, near: false, alert: 'clear', message: '', x: START.x, z: START.z, pulses: 0, ready: false, fps: 60, quality: 'auto', save: true };
  position = new THREE.Vector3(START.x, 0, START.z);
  yaw = 0; pitch = 0;
  private mobile: boolean;
  private drones: Drone[];
  private keys = new Set<string>();
  private frame = 0; private last = 0; private hudTime = 0; private ping = 0; private messageTime = 0;
  private jumpVelocity = 0; private pulseLife = 0; private bob = 0; private fpsTime = 0; private fpsFrames = 0;
  private grounded = true;
  private sound: AudioContext | null = null; private muted = true; private calm = false;
  private disposed = false; private low = false; private resizeObserver: ResizeObserver;
  private pointer: { id: number; x: number; y: number } | null = null;
  private wasLocked = false; private removers: (() => void)[] = [];
  private pulse: THREE.Mesh; private flash: THREE.PointLight;
  private route: THREE.InstancedMesh;
  constructor(private host: HTMLElement, private minimap: HTMLCanvasElement, private emit: (s: Snapshot) => void, private ar: boolean, private fail: (reason: string) => void) {
    this.mobile = matchMedia('(pointer: coarse)').matches || innerWidth < 760;
    this.low = this.mobile;
    this.scene.background = new THREE.Color('#acbbc5'); this.scene.fog = new THREE.FogExp2('#acbbc5', .009);
    this.renderer = new THREE.WebGLRenderer({ antialias: !this.mobile, powerPreference: 'high-performance', alpha: false });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.mobile ? 1.35 : 1.65)); this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = !this.mobile; this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.domElement.setAttribute('aria-label', ar ? 'مدينة مكشوف ثلاثية الأبعاد. تحرّك باستخدام الأسهم أو عصا اللمس.' : 'Exposed 3D city. Move using the arrow keys or touch joystick.');
    this.renderer.domElement.tabIndex = 0; this.host.appendChild(this.renderer.domElement);
    this.city = buildCity(this.scene, this.camera, this.renderer, this.mobile, ar);
    this.drones = this.city.drones.map((mesh, i) => { const home = new THREE.Vector3(i % 2 ? 2 : -2, 4.3, [-27, -64, -104, -117][i]); mesh.position.copy(home); return { mesh, home, knowledge: { last: null, age: 0, source: null }, stunned: 0, fire: 0, lock: 0 }; });
    this.pulse = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: '#93ddff', transparent: true, opacity: .5, wireframe: true, depthWrite: false })); this.pulse.visible = false; this.scene.add(this.pulse);
    this.flash = new THREE.PointLight('#7ecfff', 0, 12); this.scene.add(this.flash);
    const arrow = new THREE.ConeGeometry(.16, .6, 3); arrow.rotateX(-Math.PI / 2);
    this.route = new THREE.InstancedMesh(arrow, new THREE.MeshBasicMaterial({ color: '#ff9d4b', transparent: true, opacity: .8 }), 28); this.route.frustumCulled = false; this.route.visible = false; this.scene.add(this.route);
    this.resizeObserver = new ResizeObserver(() => this.resize()); this.resizeObserver.observe(host); this.resize();
    this.bind(); this.positionCamera(0);
    this.city.ready.then(() => { if (!this.disposed) { this.state.ready = true; this.emitState(); } });
    this.frame = requestAnimationFrame(this.tick);
  }
  private listen(target: EventTarget, name: string, fn: EventListener, options?: AddEventListenerOptions) { target.addEventListener(name, fn, options); this.removers.push(() => target.removeEventListener(name, fn, options)); }
  private bind() {
    const canvas = this.renderer.domElement;
    this.listen(window, 'keydown', ((e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (this.state.mode !== 'playing' && e.code !== 'KeyP') return;
      if (['Space', 'Enter', 'NumpadEnter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
      this.keys.add(e.code);
      if (e.repeat) return;
      if (e.code === 'KeyP') { if (this.state.mode === 'playing') this.pause(); else if (this.state.mode === 'paused') this.resume(); }
      if (e.code === 'KeyF') this.shoot();
      if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'KeyE') this.interact();
      if (e.code === 'KeyN') this.toggleNavigation();
      if (e.code === 'Space') this.controls.jump = true;
    }) as EventListener);
    this.listen(window, 'keyup', ((e: KeyboardEvent) => { this.keys.delete(e.code); }) as EventListener);
    this.listen(window, 'blur', (() => { this.resetInput(); if (this.state.mode === 'playing') this.pause(); }) as EventListener);
    this.listen(document, 'visibilitychange', (() => { if (document.hidden && this.state.mode === 'playing') this.pause(); }) as EventListener);
    this.listen(canvas, 'contextmenu', e => e.preventDefault());
    this.listen(canvas, 'pointerdown', ((e: PointerEvent) => {
      if (this.state.mode !== 'playing') return;
      if (this.pointer && this.pointer.id !== e.pointerId) return;
      e.preventDefault();
      if (document.pointerLockElement === canvas) { this.shoot(); return; }
      this.pointer = { id: e.pointerId, x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId);
      if (e.pointerType === 'mouse' && !this.mobile && canvas.requestPointerLock) {
        try { const p = canvas.requestPointerLock(); if (p) void p.catch(() => undefined); } catch { /* Drag remains available. */ }
      }
    }) as EventListener);
    this.listen(canvas, 'pointermove', ((e: PointerEvent) => {
      if (this.state.mode !== 'playing') return;
      if (document.pointerLockElement === canvas) this.look(e.movementX, e.movementY);
      else if (this.pointer?.id === e.pointerId) { this.look(e.clientX - this.pointer.x, e.clientY - this.pointer.y); this.pointer.x = e.clientX; this.pointer.y = e.clientY; }
    }) as EventListener);
    const end = ((e: PointerEvent) => { if (this.pointer?.id === e.pointerId) this.pointer = null; }) as EventListener;
    this.listen(canvas, 'pointerup', end); this.listen(canvas, 'pointercancel', end); this.listen(canvas, 'lostpointercapture', end);
    this.listen(document, 'pointerlockchange', (() => { const locked = document.pointerLockElement === canvas; if (this.wasLocked && !locked && this.state.mode === 'playing') this.pause(); this.wasLocked = locked; }) as EventListener);
    this.listen(canvas, 'webglcontextlost', e => { e.preventDefault(); this.pause(); this.fail(this.ar ? 'توقف العرض ثلاثي الأبعاد. أعد فتح اللعبة لاستعادة المرحلة المحفوظة.' : 'The 3D display stopped. Reopen the game to resume your checkpoint.'); });
  }
  private look(dx: number, dy: number) { this.yaw -= dx * .003; this.pitch = THREE.MathUtils.clamp(this.pitch - dy * .0025, -1.1, 1.1); }
  private resize() { const { width, height } = this.host.getBoundingClientRect(); this.renderer.setSize(width, height); this.camera.aspect = width / Math.max(1, height); this.camera.fov = width < height ? 78 : 68; this.camera.updateProjectionMatrix(); }
  private emitState() { this.emit({ ...this.state, choices: { ...this.state.choices } }); }
  private message(ar: string, en: string, seconds = 4) { this.state.message = this.ar ? ar : en; this.messageTime = seconds; }
  private resetInput() { this.keys.clear(); this.controls = { x: 0, y: 0, jump: false, sprint: false, crouch: false }; this.pointer = null; }
  private release() { if (document.pointerLockElement === this.renderer.domElement) document.exitPointerLock(); this.resetInput(); }
  start(saved?: SavedRun | null) {
    this.resetInput(); this.state = { ...this.state, mode: 'playing', stage: saved?.stage ?? 0, health: 100, stamina: 100, cooldown: 0, seconds: saved?.seconds ?? 0, pulses: saved?.pulses ?? 0, choices: saved ? { ...saved.choices } : { navigation: false, contacts: false, cloud: false }, message: '', alert: 'clear' };
    const spawn = saved && saved.stage > 0 ? checkpoints[saved.stage - 1] : START;
    this.position.set(spawn.x, 0, spawn.z + (saved && saved.stage > 0 ? 4 : 0)); this.yaw = 0; this.pitch = 0; this.jumpVelocity = 0; this.grounded = true; this.ping = 0;
    this.resetDrones(); this.message('وصل الملفات للمقرّ. اتبع اللافتات والضوء البرتقالي.', 'Deliver the files. Follow the street signs and orange beacon.', 6); this.save(); this.emitState();
  }
  pause() { if (this.state.mode !== 'playing') return; this.state.mode = 'paused'; this.release(); this.save(); this.emitState(); }
  resume() { if (this.state.mode !== 'paused') return; this.state.mode = 'playing'; this.last = 0; this.resetInput(); this.emitState(); }
  choose(accept: boolean) {
    if (this.state.mode !== 'decision' || this.state.stage > 2) return;
    const decision = checkpoints[this.state.stage].decision!; this.state.choices[decision] = accept;
    this.state.stage++; this.state.mode = 'playing'; this.state.health = Math.max(75, this.state.health); this.state.stamina = 100; this.resetInput();
    if (decision === 'navigation') this.message(accept ? 'نكسا: مشاركة الموقع نشطة. الدرونات تستقبل موقعك.' : 'الخريطة المحلية جاهزة. اتبع اللوحات والبوصلة.', accept ? 'NEXA: location sharing active. Drones receive your position.' : 'Offline map ready. Follow signs and your compass.', 6);
    if (decision === 'contacts') this.message(accept ? 'انتقلت جهات اتصال الفريق. أُضيفت دورية جديدة.' : 'فتحت البوابة برمز الفريق. جهات الاتصال بقيت معك.', accept ? 'Team contacts shared. An extra patrol has been dispatched.' : 'Gate opened with the team code. Contacts stayed with you.', 6);
    if (decision === 'cloud') this.message(accept ? 'الملفات على حساب نكسا فقط. حملك أخفّ، ووصولك مرتبط بالحساب.' : 'النسخة المحلية معك. رح توصلها بنفسك.', accept ? 'Files are only on your NEXA account. Less weight, but access depends on that account.' : 'Your local copy is secure in the bag. Deliver it yourself.', 6);
    this.save(); this.emitState();
  }
  interact() {
    if (this.state.mode !== 'playing' || !this.state.near) return;
    this.state.mode = this.state.stage === 3 ? 'won' : 'decision'; this.release();
    if (this.state.mode === 'won') { try { localStorage.removeItem(SAVE_KEY); } catch { /* Optional local save. */ } this.tone(740, .25); }
    this.emitState();
  }
  retry() { const s: SavedRun = { version: 1, stage: this.state.stage, choices: { ...this.state.choices }, seconds: this.state.seconds, pulses: this.state.pulses }; this.start(s); }
  recoverFiles() { this.state.stage = 2; this.state.choices.cloud = false; this.position.set(-12, 0, -78); this.state.mode = 'playing'; this.state.health = 100; this.resetDrones(); this.save(); this.emitState(); }
  toggleNavigation() {
    if (this.state.mode !== 'playing' || this.state.stage === 0) return;
    this.state.choices.navigation = !this.state.choices.navigation;
    this.message(this.state.choices.navigation ? 'مشاركة موقعك نشطة.' : 'قطعت بثّ موقعك. آخر نقطة معروفة ما زالت عندهم.', this.state.choices.navigation ? 'Location sharing is active.' : 'Location broadcast stopped. They still have your last known position.'); this.save(); this.emitState();
  }
  jump() { this.controls.jump = true; }
  private resetDrones() { for (const d of this.drones) { d.mesh.position.copy(d.home); d.knowledge = { last: null, age: 0, source: null }; d.stunned = 0; d.fire = 0; d.lock = 0; } }
  shoot() {
    if (this.state.mode !== 'playing' || this.state.cooldown > 0) return;
    this.state.cooldown = 4.5; this.state.pulses++; this.pulseLife = .55; this.pulse.position.copy(this.camera.position); this.pulse.visible = true;
    const forward = new THREE.Vector3(); this.camera.getWorldDirection(forward);
    let hits = 0;
    for (let i = 0; i < this.drones.length; i++) {
      if (i === 3 && !this.state.choices.contacts) continue;
      const d = this.drones[i], delta = d.mesh.position.clone().sub(this.camera.position), distance = delta.length();
      if ((distance < 6 || (distance < 19 && delta.normalize().dot(forward) > .72)) && !segmentBlocked(this.position, d.mesh.position, this.city.bounds, 2.3)) { d.stunned = 7; d.lock = 0; d.knowledge = { last: null, age: 0, source: null }; hits++; }
    }
    this.flash.position.copy(this.camera.position); this.tone(hits ? 250 : 160, .16);
    this.message(hits ? 'تعطّلت الدرون مؤقتًا. استغلّ الوقت وغيّر مكانك.' : 'النبضة بتعطّل القريب منك. وجّه التصويب نحو الدرون الأبعد.', hits ? 'Drone disabled temporarily. Move while you can.' : 'EMP disables nearby drones. Aim at drones farther away.', 2.5); this.emitState();
  }
  setSound(enabled: boolean) { this.muted = !enabled; if (enabled) { try { this.sound ??= new AudioContext(); void this.sound.resume(); this.tone(480, .1); } catch { this.muted = true; } } }
  private tone(frequency: number, duration: number) {
    if (this.muted || !this.sound) return;
    const ctx = this.sound, oscillator = ctx.createOscillator(), gain = ctx.createGain(); oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, ctx.currentTime); oscillator.frequency.exponentialRampToValueAtTime(frequency * .45, ctx.currentTime + duration);
    gain.gain.setValueAtTime(.05, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + duration); oscillator.connect(gain); gain.connect(ctx.destination); oscillator.start(); oscillator.stop(ctx.currentTime + duration);
  }
  setCalm(enabled: boolean) { this.calm = enabled; }
  setQuality(value: string) { this.state.quality = value; this.low = value === 'low' || (value === 'auto' && this.mobile); this.applyQuality(); this.emitState(); }
  private applyQuality() { this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.low ? 1 : 1.75)); this.renderer.shadowMap.enabled = !this.low; this.city.sun.castShadow = !this.low; this.resize(); }
  private save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, stage: this.state.stage, choices: this.state.choices, seconds: this.state.seconds, pulses: this.state.pulses })); }
    catch { this.state.save = false; }
  }
  private move(dt: number) {
    const c = this.controls;
    let f = -c.y + (this.keys.has('KeyW') || this.keys.has('ArrowUp') ? 1 : 0) - (this.keys.has('KeyS') || this.keys.has('ArrowDown') ? 1 : 0);
    let r = c.x + (this.keys.has('KeyD') || this.keys.has('ArrowRight') ? 1 : 0) - (this.keys.has('KeyA') || this.keys.has('ArrowLeft') ? 1 : 0);
    const len = Math.hypot(f, r); if (len > 1) { f /= len; r /= len; }
    const crouched = c.crouch || this.keys.has('KeyC'), sprint = (c.sprint || this.keys.has('ShiftLeft') || this.keys.has('ShiftRight')) && this.state.stamina > 1 && !crouched && len > .1;
    const speed = crouched ? 2.5 : sprint ? 8.2 : 4.8;
    this.state.stamina = THREE.MathUtils.clamp(this.state.stamina + dt * (sprint ? (this.state.choices.cloud ? -13 : -19) : 23), 0, 100);
    const previousY = this.position.y;
    if (c.jump && this.grounded) { this.jumpVelocity = 5.6; this.grounded = false; this.tone(130, .05); } c.jump = false;
    this.jumpVelocity -= dt * 17; this.position.y = Math.max(0, this.position.y + this.jumpVelocity * dt);
    const dx = (-Math.sin(this.yaw) * f + Math.cos(this.yaw) * r) * speed * dt;
    const dz = (-Math.cos(this.yaw) * f - Math.sin(this.yaw) * r) * speed * dt;
    const blocks = (p: Point) => this.city.bounds.some(b => b.height > this.position.y + .25 && inside(p, b, .35));
    if (!blocks({ x: this.position.x + dx, z: this.position.z })) this.position.x += dx;
    if (!blocks({ x: this.position.x, z: this.position.z + dz })) this.position.z += dz;
    const support = this.city.bounds.reduce((height, b) => inside(this.position, b, .28) && b.height <= previousY + .04 ? Math.max(height, b.height) : height, 0);
    this.grounded = this.jumpVelocity <= 0 && this.position.y <= support;
    if (this.grounded) { this.position.y = support; this.jumpVelocity = 0; }
    this.position.x = THREE.MathUtils.clamp(this.position.x, -38, 38); this.position.z = THREE.MathUtils.clamp(this.position.z, -134, 22);
    this.bob += len > .1 ? dt * (sprint ? 13 : 9) : 0;
    this.positionCamera(crouched ? -0.55 : 0, len > .1);
    this.state.x = this.position.x; this.state.z = this.position.z;
    const cp = checkpoints[this.state.stage]; this.state.distance = Math.hypot(cp.x - this.position.x, cp.z - this.position.z); this.state.near = this.state.distance < 3.5;
  }
  private positionCamera(offset: number, moving = false) {
    this.camera.position.set(this.position.x, this.position.y + 1.7 + offset + (!this.calm && moving ? Math.sin(this.bob) * .035 : 0), this.position.z);
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
    this.city.gun.position.y = -.28 + (!this.calm && moving ? Math.cos(this.bob) * .008 : 0) - this.pulseLife * .08;
  }
  private enemies(dt: number, time: number) {
    this.ping += dt; const broadcast = this.state.choices.navigation && this.ping >= 3;
    if (this.ping >= 3) this.ping = 0;
    let alert: Snapshot['alert'] = 'clear';
    const safe = this.state.near || this.state.stage === 0;
    for (let i = 0; i < this.drones.length; i++) {
      const d = this.drones[i]; d.mesh.visible = i !== 3 || this.state.choices.contacts; if (!d.mesh.visible) continue;
      d.stunned = Math.max(0, d.stunned - dt); d.fire = Math.max(0, d.fire - dt);
      d.mesh.children[d.mesh.children.length - 1].visible = d.stunned <= 0;
      d.mesh.rotation.z = d.stunned > 0 ? .25 : Math.sin(time + i) * .03;
      if (d.stunned > 0) { d.mesh.position.y = THREE.MathUtils.lerp(d.mesh.position.y, 2.1, .04); continue; }
      d.mesh.position.y = 4.3 + Math.sin(time * 2 + i) * .14;
      const distance = Math.hypot(d.mesh.position.x - this.position.x, d.mesh.position.z - this.position.z);
      const crouch = this.controls.crouch || this.keys.has('KeyC');
      const visible = !safe && distance < (crouch ? 5.5 : 13.5) && !segmentBlocked(d.mesh.position, this.position, this.city.bounds, crouch ? .9 : 1.5);
      d.knowledge = observe(d.knowledge, this.position, visible, !safe && broadcast && distance < 70, dt);
      const target = d.knowledge.last ?? { x: d.home.x + Math.sin(time * .27 + i) * 2, z: d.home.z + Math.cos(time * .23 + i) * 6 };
      const dx = target.x - d.mesh.position.x, dz = target.z - d.mesh.position.z, len = Math.hypot(dx, dz), speed = d.knowledge.last ? 5.7 : 1.8;
      if (len > .4) {
        const step = Math.min(len, dt * speed), nx = d.mesh.position.x + dx / len * step, nz = d.mesh.position.z + dz / len * step;
        const blocked = (x: number, z: number) => this.city.bounds.some(b => b.height > d.mesh.position.y - .25 && inside({ x, z }, b, .7));
        if (!blocked(nx, d.mesh.position.z)) d.mesh.position.x = nx;
        if (!blocked(d.mesh.position.x, nz)) d.mesh.position.z = nz;
        d.mesh.rotation.y = Math.atan2(dx, dz);
      }
      if (d.knowledge.last) alert = d.knowledge.source === 'location' && d.knowledge.age < 3 ? 'location' : visible ? 'visual' : alert === 'clear' ? 'search' : alert;
      d.lock = visible && distance < 7 ? d.lock + dt : 0;
      if (d.lock >= 2 && d.fire <= 0) { this.state.health = Math.max(0, this.state.health - 8); d.fire = 2.5; this.tone(90, .12); this.message('رصدتك الدرون. اقطع خط الرؤية أو عطّلها بنبضة.', 'Drone has visual contact. Break line of sight or use an EMP pulse.', 2); }
    }
    this.state.alert = alert;
    if (this.state.health <= 0) { this.state.mode = 'caught'; this.release(); this.emitState(); }
  }
  private drawMap() {
    const c = this.minimap, ctx = c.getContext('2d'); if (!ctx) return;
    const w = c.width, h = c.height, project = (p: Point) => ({ x: w / 2 + p.x * 2, y: 18 + (p.z + 145) * (h - 32) / 170 });
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = '#d3d8db25';
    for (const b of this.city.bounds) if (b.height > 3) { const p = project(b); ctx.fillRect(p.x - b.w, p.y - b.d * .73, b.w * 2, b.d * 1.46); }
    const me = project(this.position), route = streetRoute(this.state.stage, this.position);
    this.route.visible = this.state.choices.navigation && this.state.mode === 'playing';
    if (this.state.choices.navigation) {
      ctx.strokeStyle = '#f79548'; ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(me.x, me.y);
      for (const point of route.slice(1)) { const p = project(point); ctx.lineTo(p.x, p.y); } ctx.stroke(); ctx.setLineDash([]);
      const matrix = new THREE.Object3D(); let count = 0;
      for (let i = 1; i < route.length && count < 28; i++) {
        const a = route[i - 1], b = route[i], length = Math.hypot(b.x - a.x, b.z - a.z);
        for (let distance = 2; distance < length && count < 28; distance += 3) {
          matrix.position.set(a.x + (b.x - a.x) * distance / length, .12, a.z + (b.z - a.z) * distance / length); matrix.rotation.y = Math.atan2(-(b.x - a.x), -(b.z - a.z)); matrix.updateMatrix(); this.route.setMatrixAt(count++, matrix.matrix);
        }
      }
      this.route.count = count; this.route.instanceMatrix.needsUpdate = true;
    }
    checkpoints.forEach((p, i) => { const a = project(p); ctx.fillStyle = i < this.state.stage ? '#85bbac' : i === this.state.stage ? '#ff9a4c' : '#72808d'; ctx.beginPath(); ctx.arc(a.x, a.y, i === this.state.stage ? 4 : 2, 0, Math.PI * 2); ctx.fill(); });
    for (const d of this.drones) { if (!d.mesh.visible) continue; const p = project(d.mesh.position); ctx.fillStyle = d.stunned > 0 ? '#7ac9e9' : '#ef8f7c'; ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3); }
    ctx.save(); ctx.translate(me.x, me.y); ctx.rotate(-this.yaw); ctx.fillStyle = '#fff5dd'; ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(-3, 4); ctx.lineTo(3, 4); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  private tick = (now: number) => {
    if (this.disposed) return; this.frame = requestAnimationFrame(this.tick);
    const elapsed = this.last ? (now - this.last) / 1000 : 0;
    const dt = Math.min(elapsed, .2); this.last = now;
    if (document.hidden) return;
    const time = now / 1000;
    this.fpsTime += elapsed; this.fpsFrames++;
    if (this.fpsTime > 2.5) { this.state.fps = Math.round(this.fpsFrames / this.fpsTime); if (this.state.quality === 'auto' && !this.low && this.state.fps < 34) { this.low = true; this.applyQuality(); } this.fpsTime = 0; this.fpsFrames = 0; }
    if (this.state.mode === 'playing') {
      this.state.seconds += dt; this.state.cooldown = Math.max(0, this.state.cooldown - dt); this.messageTime -= dt; if (this.messageTime <= 0) this.state.message = '';
      const steps = Math.max(1, Math.ceil(dt / .025));
      for (let step = 0; step < steps && this.state.mode === 'playing'; step++) { this.move(dt / steps); this.enemies(dt / steps, time); }
    }
    this.pulseLife = Math.max(0, this.pulseLife - dt); this.pulse.visible = this.pulseLife > 0; this.pulse.scale.setScalar(1 + (1 - this.pulseLife / .55) * 17); (this.pulse.material as THREE.MeshBasicMaterial).opacity = this.pulseLife * .25; this.flash.intensity = this.pulseLife * 3;
    for (let i = 0; i < this.city.beacons.length; i++) { this.city.beacons[i].visible = i === this.state.stage; this.city.beacons[i].children[0].rotation.z = this.calm ? 0 : time * .2; }
    this.city.sun.position.set(this.position.x - 24, 35, this.position.z + 12); this.city.sun.target.position.set(this.position.x, 0, this.position.z - 10); this.city.sun.target.updateMatrixWorld();
    this.renderer.render(this.scene, this.camera);
    this.hudTime += dt; if (this.hudTime > .12) { this.hudTime = 0; this.drawMap(); this.emitState(); }
  };
  dispose() {
    this.disposed = true; cancelAnimationFrame(this.frame); this.release(); this.resizeObserver.disconnect(); this.removers.forEach(fn => fn());
    this.city.dispose(); this.pulse.geometry.dispose(); (this.pulse.material as THREE.Material).dispose(); this.route.geometry.dispose(); (this.route.material as THREE.Material).dispose(); this.renderer.dispose(); this.renderer.forceContextLoss(); this.renderer.domElement.remove(); void this.sound?.close().catch(() => undefined);
  }
}
