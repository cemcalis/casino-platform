'use client';

/**
 * Layered WebAudio engine for Slot Forge games.
 * One shared AudioContext; a looping ambient music bed per theme profile plus
 * one-shot SFX. Everything is synthesized — no audio assets to load.
 */

export type MusicProfile = 'mystic' | 'festive' | 'epic' | 'serene' | 'arcade';

export type SfxName =
  | 'click'
  | 'spin'
  | 'reelStop'
  | 'anticipation'
  | 'winSmall'
  | 'winMedium'
  | 'tick'
  | 'burst'
  | 'bomb'
  | 'scatter'
  | 'bigWin'
  | 'freeSpinIntro'
  | 'coin';

interface MusicVoice {
  osc: OscillatorNode;
  gain: GainNode;
}

const PROFILE_CHORDS: Record<MusicProfile, number[][]> = {
  // Frequencies per chord; loops chord-to-chord on a slow timer.
  mystic: [
    [130.81, 155.56, 196.0],
    [116.54, 138.59, 174.61],
    [103.83, 130.81, 155.56],
    [116.54, 146.83, 174.61],
  ],
  festive: [
    [146.83, 185.0, 220.0],
    [164.81, 207.65, 246.94],
    [174.61, 220.0, 261.63],
    [164.81, 196.0, 246.94],
  ],
  epic: [
    [98.0, 123.47, 146.83],
    [87.31, 110.0, 130.81],
    [92.5, 116.54, 138.59],
    [110.0, 138.59, 164.81],
  ],
  serene: [
    [174.61, 220.0, 261.63],
    [155.56, 196.0, 233.08],
    [146.83, 185.0, 220.0],
    [164.81, 207.65, 246.94],
  ],
  arcade: [
    [130.81, 164.81, 196.0],
    [146.83, 174.61, 220.0],
    [130.81, 155.56, 207.65],
    [123.47, 155.56, 185.0],
  ],
};

class ForgeAudio {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicVoices: MusicVoice[] = [];
  private chordTimer: ReturnType<typeof setInterval> | null = null;
  private chordIndex = 0;
  private profile: MusicProfile = 'mystic';
  muted = false;
  musicOn = true;

  private ensureCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      // Master bus: everything through a gentle compressor so layered SFX
      // never clip — the "glued" sound of commercial slots.
      const master = this.ctx.createDynamicsCompressor();
      master.threshold.value = -18;
      master.knee.value = 24;
      master.ratio.value = 5;
      master.attack.value = 0.004;
      master.release.value = 0.18;
      master.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.05;
      this.musicGain.connect(master);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.25;
      this.sfxGain.connect(master);

      // Synthesized room reverb: exponentially decaying stereo noise impulse.
      const seconds = 1.6;
      const rate = this.ctx.sampleRate;
      const impulse = this.ctx.createBuffer(2, rate * seconds, rate);
      for (let ch = 0; ch < 2; ch++) {
        const data = impulse.getChannelData(ch);
        for (let i = 0; i < data.length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2.8);
        }
      }
      const convolver = this.ctx.createConvolver();
      convolver.buffer = impulse;
      const reverbWet = this.ctx.createGain();
      reverbWet.gain.value = 0.16;
      this.sfxGain.connect(convolver);
      convolver.connect(reverbWet);
      reverbWet.connect(master);

      // Short feedback delay adds width to one-shot SFX.
      const delay = this.ctx.createDelay(0.5);
      delay.delayTime.value = 0.16;
      const feedback = this.ctx.createGain();
      feedback.gain.value = 0.2;
      const wet = this.ctx.createGain();
      wet.gain.value = 0.12;
      this.sfxGain.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(wet);
      wet.connect(master);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) this.stopMusic();
  }

  startMusic(profile: MusicProfile): void {
    if (this.muted || !this.musicOn) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.musicGain) return;
    if (this.musicVoices.length > 0 && this.profile === profile) return;
    this.stopMusic();
    this.profile = profile;

    const chord = PROFILE_CHORDS[profile][0];
    for (const freq of chord) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = profile === 'arcade' ? 'square' : 'sine';
      osc.frequency.value = freq;
      gain.gain.value = profile === 'arcade' ? 0.12 : 0.32;
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start();
      this.musicVoices.push({ osc, gain });
    }
    this.chordIndex = 0;
    this.chordTimer = setInterval(() => this.nextChord(), 3600);
  }

  private nextChord(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const chords = PROFILE_CHORDS[this.profile];
    this.chordIndex = (this.chordIndex + 1) % chords.length;
    const chord = chords[this.chordIndex];
    this.musicVoices.forEach((voice, i) => {
      const freq = chord[i % chord.length];
      voice.osc.frequency.linearRampToValueAtTime(freq, ctx.currentTime + 1.2);
    });
  }

  stopMusic(): void {
    if (this.chordTimer) {
      clearInterval(this.chordTimer);
      this.chordTimer = null;
    }
    for (const voice of this.musicVoices) {
      try {
        voice.osc.stop();
      } catch {
        /* already stopped */
      }
    }
    this.musicVoices = [];
  }

  play(name: SfxName): void {
    if (this.muted) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;
    const out = this.sfxGain;

    const tone = (
      freq: number,
      dur: number,
      opts: {
        type?: OscillatorType;
        at?: number;
        gain?: number;
        slideTo?: number;
        detune?: number;
      } = {},
    ) => {
      const t0 = now + (opts.at ?? 0);
      const voices = opts.detune ? [-opts.detune, opts.detune] : [0];
      for (const cents of voices) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = opts.type ?? 'sine';
        osc.detune.value = cents;
        osc.frequency.setValueAtTime(freq, t0);
        if (opts.slideTo) osc.frequency.exponentialRampToValueAtTime(opts.slideTo, t0 + dur);
        const g = (opts.gain ?? 0.5) / voices.length;
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(g, t0 + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
        osc.connect(gain);
        gain.connect(out);
        osc.start(t0);
        osc.stop(t0 + dur + 0.02);
      }
    };

    const noise = (dur: number, opts: { at?: number; gain?: number } = {}) => {
      const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.value = opts.gain ?? 0.15;
      src.connect(gain);
      gain.connect(out);
      src.start(now + (opts.at ?? 0));
    };

    switch (name) {
      case 'click':
        tone(880, 0.05, { gain: 0.3 });
        break;
      case 'spin':
        tone(180, 0.45, { type: 'sawtooth', gain: 0.1, slideTo: 520, detune: 8 });
        tone(90, 0.4, { type: 'triangle', gain: 0.14, slideTo: 200 });
        noise(0.4, { gain: 0.07 });
        break;
      case 'reelStop':
        // Mechanical thud: low knock + short damped click.
        tone(110, 0.09, { type: 'sine', gain: 0.55, slideTo: 70 });
        tone(360, 0.045, { type: 'triangle', gain: 0.3 });
        noise(0.045, { gain: 0.18 });
        break;
      case 'anticipation':
        for (let i = 0; i < 6; i++) tone(523 + i * 60, 0.09, { at: i * 0.11, gain: 0.25 });
        break;
      case 'tick':
        tone(1320, 0.03, { gain: 0.18 });
        break;
      case 'winSmall':
        tone(523.25, 0.14, { gain: 0.35, detune: 6, type: 'triangle' });
        tone(659.25, 0.18, { at: 0.09, gain: 0.35, detune: 6, type: 'triangle' });
        break;
      case 'winMedium':
        tone(523.25, 0.14, { gain: 0.4, detune: 7, type: 'triangle' });
        tone(659.25, 0.14, { at: 0.09, gain: 0.4, detune: 7, type: 'triangle' });
        tone(783.99, 0.26, { at: 0.18, gain: 0.42, detune: 7, type: 'triangle' });
        tone(261.63, 0.4, { gain: 0.18, type: 'sine' });
        break;
      case 'burst':
        noise(0.18, { gain: 0.2 });
        tone(196, 0.15, { type: 'triangle', gain: 0.3, slideTo: 98 });
        break;
      case 'bomb':
        tone(80, 0.3, { type: 'sawtooth', gain: 0.5, slideTo: 40 });
        noise(0.25, { gain: 0.25 });
        tone(1046, 0.25, { at: 0.12, gain: 0.3 });
        break;
      case 'scatter':
        tone(880, 0.15, { gain: 0.4 });
        tone(1108.73, 0.18, { at: 0.1, gain: 0.4 });
        tone(1318.51, 0.25, { at: 0.2, gain: 0.4 });
        break;
      case 'freeSpinIntro':
        [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) =>
          tone(f, 0.3, { at: i * 0.12, gain: 0.4 }),
        );
        break;
      case 'bigWin':
        [392, 523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.51].forEach((f, i) => {
          tone(f, 0.3, { at: i * 0.13, gain: 0.45, type: i % 2 ? 'triangle' : 'sine', detune: 9 });
          tone(f / 2, 0.3, { at: i * 0.13, gain: 0.16, type: 'sine' });
        });
        tone(130.81, 1.4, { gain: 0.2, type: 'sawtooth', detune: 10 });
        noise(0.5, { gain: 0.09 });
        break;
      case 'coin':
        tone(1567.98, 0.09, { gain: 0.28, detune: 5 });
        tone(2093, 0.12, { at: 0.05, gain: 0.22, detune: 5 });
        tone(2637, 0.1, { at: 0.11, gain: 0.14 });
        break;
    }
  }
}

/** Module-level singleton — shared across all Forge games in the session. */
export const forgeAudio = new ForgeAudio();
