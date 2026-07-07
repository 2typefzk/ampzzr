/* ============================================================
   AMPLI — Audio engine (Web Audio API)
   Synthesizes a real, controllable audio bed (locução cadence
   + trilha de fundo) so play/pause actually produce sound and
   the waveform animates. In production these would be the real
   generated voice files.
   ============================================================ */

type Listener = (currentTime: number, playing: boolean) => void;

export class AmpliAudio {
  ctx: AudioContext | null = null;
  duration: number;
  playing = false;
  offset = 0;
  startedAt = 0;
  speed = 1;
  bedVol = 0.7;
  timer: ReturnType<typeof setInterval> | null = null;
  step = 0;
  nextNoteTime = 0;
  bpm = 112;
  listeners = new Set<Listener>();

  master!: GainNode;
  analyser!: AnalyserNode;
  bedBus!: GainNode;
  bedFilter!: BiquadFilterNode;
  voiceBus!: GainNode;
  voiceFilter!: BiquadFilterNode;
  padGain!: GainNode;
  padOscs: OscillatorNode[] = [];
  lfo!: OscillatorNode;
  noiseBuf!: AudioBuffer;

  constructor(durationSec = 30) {
    this.duration = durationSec;
  }

  private _ensure() {
    if (this.ctx) return;
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.9;
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.master.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // trilha (bed) bus
    this.bedBus = this.ctx.createGain();
    this.bedBus.gain.value = this.bedVol * 0.5;
    this.bedFilter = this.ctx.createBiquadFilter();
    this.bedFilter.type = "lowpass";
    this.bedFilter.frequency.value = 1400;
    this.bedFilter.Q.value = 0.7;
    this.bedBus.connect(this.bedFilter);
    this.bedFilter.connect(this.master);

    // voice bus
    this.voiceBus = this.ctx.createGain();
    this.voiceBus.gain.value = 0.5;
    this.voiceFilter = this.ctx.createBiquadFilter();
    this.voiceFilter.type = "bandpass";
    this.voiceFilter.frequency.value = 900;
    this.voiceFilter.Q.value = 0.8;
    this.voiceBus.connect(this.voiceFilter);
    this.voiceFilter.connect(this.master);

    // sustained warm pad (chord) for the bed
    this.padGain = this.ctx.createGain();
    this.padGain.gain.value = 0.0;
    this.padGain.connect(this.bedBus);
    const chord = [110, 164.81, 220, 277.18]; // A2 E3 A3 C#4
    this.padOscs = chord.map((f, i) => {
      const o = this.ctx!.createOscillator();
      o.type = i === 0 ? "triangle" : "sawtooth";
      o.frequency.value = f;
      const g = this.ctx!.createGain();
      g.gain.value = i === 0 ? 0.5 : 0.18;
      o.connect(g);
      g.connect(this.padGain);
      o.start();
      return o;
    });
    // slow LFO on pad filter
    this.lfo = this.ctx.createOscillator();
    this.lfo.frequency.value = 0.12;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 400;
    this.lfo.connect(lfoGain);
    lfoGain.connect(this.bedFilter.frequency);
    this.lfo.start();

    // noise buffer for hats
    const len = this.ctx.sampleRate * 0.4;
    this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  on(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  private _emit() {
    const t = this.currentTime();
    for (const fn of this.listeners) fn(t, this.playing);
  }

  currentTime(): number {
    if (!this.playing || !this.ctx) return this.offset;
    const t = this.offset + (this.ctx.currentTime - this.startedAt) * this.speed;
    return t % this.duration;
  }

  private _scheduleNote(time: number) {
    const ctx = this.ctx!;
    const s = this.step % 16;
    if (s === 0) {
      this.padGain.gain.cancelScheduledValues(time);
      this.padGain.gain.setTargetAtTime(0.22, time, 0.4);
    }
    if (s === 14) {
      this.padGain.gain.setTargetAtTime(0.10, time, 0.4);
    }
    // kick on quarter notes
    if (s % 4 === 0) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.setValueAtTime(130, time);
      o.frequency.exponentialRampToValueAtTime(48, time + 0.13);
      g.gain.setValueAtTime(0.0001, time);
      g.gain.exponentialRampToValueAtTime(0.9, time + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);
      o.connect(g);
      g.connect(this.bedBus);
      o.start(time);
      o.stop(time + 0.2);
    }
    // hat on offbeat 8ths
    if (s % 2 === 1) {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      const bp = ctx.createBiquadFilter();
      bp.type = "highpass";
      bp.frequency.value = 7000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, time);
      g.gain.exponentialRampToValueAtTime(0.12, time + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 0.06);
      src.connect(bp);
      bp.connect(g);
      g.connect(this.bedBus);
      src.start(time);
      src.stop(time + 0.08);
    }
    // voice cadence — speech-like blips with intonation
    const voicePattern = [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0];
    if (voicePattern[s]) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sawtooth";
      const pitches = [196, 220, 247, 196, 165, 220, 247, 262];
      const f = pitches[(this.step * 3 + s) % pitches.length] * (0.96 + Math.random() * 0.08);
      o.frequency.setValueAtTime(f, time);
      o.frequency.linearRampToValueAtTime(f * 1.04, time + 0.18);
      g.gain.setValueAtTime(0.0001, time);
      g.gain.exponentialRampToValueAtTime(0.5, time + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
      o.connect(g);
      g.connect(this.voiceBus);
      o.start(time);
      o.stop(time + 0.28);
    }
    this.step++;
  }

  private _tick = () => {
    if (!this.playing) return;
    if (!this.ctx || this.ctx.state !== "running") return;
    const spb = 60 / this.bpm / 2 / this.speed;
    while (this.nextNoteTime < this.ctx.currentTime + 0.12) {
      this._scheduleNote(this.nextNoteTime);
      this.nextNoteTime += spb;
    }
  };

  async play() {
    this._ensure();
    if (this.playing) return;
    this.playing = true;
    this.startedAt = this.ctx!.currentTime;
    this.nextNoteTime = this.ctx!.currentTime + 0.05;
    this.master.gain.cancelScheduledValues(this.ctx!.currentTime);
    this.master.gain.setTargetAtTime(0.9, this.ctx!.currentTime, 0.05);
    this.timer = setInterval(this._tick, 25);
    this._emit();
    if (this.ctx!.state === "suspended") {
      this.ctx!.resume().then(() => {
        this.startedAt = this.ctx!.currentTime;
        this.nextNoteTime = this.ctx!.currentTime + 0.05;
      }).catch(() => {});
    }
  }

  pause() {
    if (!this.ctx || !this.playing) return;
    this.offset = this.currentTime();
    this.playing = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.master.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.03);
    this.padGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.05);
    this._emit();
  }

  toggle() {
    this.playing ? this.pause() : this.play();
  }

  seek(frac: number) {
    this.offset = Math.max(0, Math.min(1, frac)) * this.duration;
    if (this.playing && this.ctx) {
      this.startedAt = this.ctx.currentTime;
    }
    this._emit();
  }

  setSpeed(v: number) {
    this.speed = v;
    if (this.playing && this.ctx) {
      this.offset = this.currentTime();
      this.startedAt = this.ctx.currentTime;
    }
  }
  setBedVolume(v: number) {
    this.bedVol = v;
    if (this.bedBus && this.ctx) this.bedBus.gain.setTargetAtTime(v * 0.5, this.ctx.currentTime, 0.05);
  }

  getLevels(): Uint8Array | null {
    if (!this.analyser) return null;
    const arr = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(arr);
    return arr;
  }

  destroy() {
    try { this.pause(); } catch { /* noop */ }
    try { this.ctx && this.ctx.close(); } catch { /* noop */ }
  }
}

/* deterministic waveform bar heights resembling a voice-over with pauses */
export function makeWaveBars(n = 120, seed = 7): number[] {
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const bars: number[] = [];
  for (let i = 0; i < n; i++) {
    const p = i / n;
    const phrase = Math.sin(p * Math.PI * 5) * 0.5 + 0.5;
    const gap = (i % 23 < 3) ? 0.18 : 1;
    const micro = 0.55 + rnd() * 0.55;
    let h = phrase * micro * gap;
    h = Math.max(0.08, Math.min(1, h * 1.15));
    bars.push(h);
  }
  return bars;
}
