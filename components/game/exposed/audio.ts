type Voice = { source: AudioScheduledSourceNode; gain: GainNode };

export class GameAudio {
  private context: AudioContext | null = null;
  private output: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private voices = new Set<Voice>();
  private enabled = false;
  private active = false;
  private nextBeat = 0;
  private beat = 0;
  private stepDistance = 0;
  private volume = .45;
  private lastType = 0;

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) { this.stopVoices(); void this.context?.suspend().catch(() => undefined); return false; }
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.output = this.context.createGain();
        this.output.gain.value = this.volume;
        this.output.connect(this.context.destination);
        this.noise = this.context.createBuffer(1, this.context.sampleRate * .2, this.context.sampleRate);
        const samples = this.noise.getChannelData(0);
        for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
      }
      void this.context.resume().catch(() => undefined);
      this.nextBeat = 0;
      return true;
    } catch { this.enabled = false; return false; }
  }

  setVolume(volume: number) {
    if (!Number.isFinite(volume)) return;
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.context && this.output) this.output.gain.setTargetAtTime(this.volume, this.context.currentTime, .02);
  }

  setActive(active: boolean) {
    this.active = active;
    this.nextBeat = 0;
    this.stepDistance = 0;
    if (!active) this.stopVoices();
  }

  private play(source: AudioScheduledSourceNode, level: number, when: number, duration: number) {
    if (!this.context || !this.output) return;
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(.0001, when);
    gain.gain.exponentialRampToValueAtTime(level, when + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, when + duration);
    source.connect(gain); gain.connect(this.output);
    const voice = { source, gain }; this.voices.add(voice);
    source.onended = () => { source.disconnect(); gain.disconnect(); this.voices.delete(voice); };
    source.start(when); source.stop(when + duration + .01);
  }

  private note(frequency: number, level: number, when: number, duration: number, type: OscillatorType = 'triangle', end = frequency) {
    if (!this.context) return;
    const source = this.context.createOscillator(); source.type = type;
    source.frequency.setValueAtTime(frequency, when);
    source.frequency.exponentialRampToValueAtTime(end, when + duration);
    this.play(source, level, when, duration);
  }

  private hiss(level: number, when: number, duration: number, rate = 1) {
    if (!this.context || !this.noise) return;
    const source = this.context.createBufferSource(); source.buffer = this.noise; source.playbackRate.value = rate;
    this.play(source, level, when, duration);
  }

  update(alert: 'clear' | 'search' | 'visual' | 'location', distance: number) {
    if (!this.enabled || !this.active || this.context?.state !== 'running') return;
    const now = this.context.currentTime, danger = alert === 'visual' || alert === 'location';
    const interval = 60 / (danger ? 138 : alert === 'search' ? 122 : 108) / 2;
    if (this.nextBeat < now) this.nextBeat = now;
    while (this.nextBeat < now + .1) {
      const time = this.nextBeat, step = this.beat++ % 16;
      if (step % 4 === 0) this.note(130, .3, time, .17, 'sine', 43);
      if (step % 4 === 2) this.hiss(.055, time, .075);
      this.hiss(.025, time, .025, 2);
      const bass = [73.42, 73.42, 87.31, 65.41][Math.floor(step / 4)];
      this.note(bass, .075, time, interval * .8);
      if (step % 2 || danger) this.note(bass * [4, 6, 8, 6][step % 4], danger ? .045 : .022, time, .09);
      this.nextBeat += interval;
    }
    this.stepDistance += distance;
    if (this.stepDistance > 1.65) { this.stepDistance %= 1.65; this.hiss(.065, now, .055, .55); this.note(100, .05, now, .065, 'sine', 55); }
  }

  cue(kind: 'pulse' | 'hit' | 'jump' | 'station' | 'win' | 'caught' | 'type') {
    if (!this.enabled || !this.context) return;
    const now = this.context.currentTime;
    if (kind === 'type') {
      if (this.context.state !== 'running' || now - this.lastType < .045) return;
      this.lastType = now; this.note(650 + Math.random() * 240, .035, now, .025, 'triangle'); return;
    }
    if (kind === 'pulse') {
      this.note(94, .14, now, .22, 'sine', 38);
      this.note(920, .18, now + .008, .15, 'triangle', 170);
      this.hiss(.16, now + .018, .12);
      this.note(440, .14, now + .09, .075, 'sine', 115);
    }
    if (kind === 'hit' || kind === 'caught') { this.hiss(.15, now, .12); this.note(110, .2, now, kind === 'caught' ? .6 : .16, 'triangle', 38); }
    if (kind === 'jump') this.note(150, .07, now, .12, 'sine', 280);
    if (kind === 'station' || kind === 'win') {
      const notes = kind === 'win' ? [293.66, 349.23, 440, 587.33] : [293.66, 440];
      notes.forEach((frequency, i) => this.note(frequency, .12, now + i * .12, .25));
    }
  }

  private stopVoices() {
    for (const { source, gain } of this.voices) { source.onended = null; source.stop(); source.disconnect(); gain.disconnect(); }
    this.voices.clear();
  }

  dispose() {
    this.enabled = false; this.active = false; this.stopVoices(); this.output?.disconnect();
    void this.context?.close().catch(() => undefined); this.context = null; this.output = null; this.noise = null;
  }
}
