// Web Audio API Synthesizer for Authentic Tavla Sounds

class TavlaAudioSystem {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Realistic rolling dice rattling across a wooden board
  playDiceRoll() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;

      // 4 to 6 quick rattle taps followed by a settle tap
      const tapCount = 5;
      for (let i = 0; i < tapCount; i++) {
        const time = now + i * 0.07 + Math.random() * 0.03;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140 + Math.random() * 80, time);
        osc.frequency.exponentialRampToValueAtTime(60, time + 0.04);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600 + Math.random() * 400, time);
        filter.Q.setValueAtTime(4, time);

        gain.gain.setValueAtTime(0.25 - i * 0.03, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + 0.05);
      }
    } catch {
      // Ignore audio failure
    }
  }

  // Wooden checker landing on board or another checker
  playCheckerMove() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Deep wooden hollow thud
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.09);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Ignore audio failure
    }
  }

  // Sharper wooden hit sound when a checker is captured (blot hit)
  playHitSound() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.12);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Ignore audio failure
    }
  }

  // Cheerful victory jingle
  playVictoryFanfare() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const notes = [261.63, 329.63, 392.0, 523.25]; // C, E, G, C5

      notes.forEach((freq, idx) => {
        const time = now + idx * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.25, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + 0.4);
      });
    } catch {
      // Ignore audio failure
    }
  }
}

export const tavlaAudio = new TavlaAudioSystem();
