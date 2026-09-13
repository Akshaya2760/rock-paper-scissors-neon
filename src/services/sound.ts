/**
 * Web Audio API Sound & Music Generator for Neon Arena
 * Synthesizes all arcade sound effects and subtle ambient music programmatically.
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private masterGainNode: GainNode | null = null;
  private isMusicPlaying: boolean = false;
  private musicIntervalId: number | null = null;
  private activeMusicNodes: (AudioNode | OscillatorNode)[] = [];

  public soundEnabled: boolean = true;
  public musicEnabled: boolean = false;
  public volume: number = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGainNode = this.ctx.createGain();
      this.masterGainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGainNode.connect(this.ctx.destination);

      this.sfxGainNode = this.ctx.createGain();
      this.sfxGainNode.gain.setValueAtTime(this.soundEnabled ? 1 : 0, this.ctx.currentTime);
      this.sfxGainNode.connect(this.masterGainNode);

      this.musicGainNode = this.ctx.createGain();
      this.musicGainNode.gain.setValueAtTime(this.musicEnabled ? 0.25 : 0, this.ctx.currentTime);
      this.musicGainNode.connect(this.masterGainNode);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSettings(sound: boolean, music: boolean, volume: number) {
    this.soundEnabled = sound;
    this.musicEnabled = music;
    this.volume = Math.max(0, Math.min(1, volume));

    if (this.masterGainNode && this.ctx) {
      this.masterGainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    if (this.sfxGainNode && this.ctx) {
      this.sfxGainNode.gain.setValueAtTime(this.soundEnabled ? 1 : 0, this.ctx.currentTime);
    }
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setValueAtTime(this.musicEnabled ? 0.25 : 0, this.ctx.currentTime);
    }

    if (this.musicEnabled && !this.isMusicPlaying) {
      this.startMusic();
    } else if (!this.musicEnabled && this.isMusicPlaying) {
      this.stopMusic();
    }
  }

  // Generic tone helper
  private playTone(freq: number, type: OscillatorType, duration: number, gainVal = 0.2, pitchSlideTo?: number) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (pitchSlideTo !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, pitchSlideTo), now + duration);
      }

      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio autoplay safeguard
    }
  }

  public playButtonClick() {
    this.playTone(600, 'sine', 0.05, 0.15, 300);
  }

  public playMenuTransition() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + 0.15);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playCountdownBeep(isHigh = false) {
    const freq = isHigh ? 880 : 440;
    this.playTone(freq, 'sine', 0.12, 0.25);
  }

  public playGoSound() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chord
    freqs.forEach((f) => {
      this.playTone(f, 'triangle', 0.35, 0.15);
    });
  }

  public playRockSelect() {
    // Deep heavy impact
    this.playTone(120, 'triangle', 0.2, 0.35, 45);
  }

  public playPaperSelect() {
    // Crisp swoosh / sweep
    this.playTone(400, 'sine', 0.18, 0.2, 900);
  }

  public playScissorsSelect() {
    // Metallic snip
    this.playTone(1200, 'sawtooth', 0.1, 0.2, 2400);
    setTimeout(() => this.playTone(1800, 'square', 0.08, 0.15, 800), 50);
  }

  public playWin() {
    if (!this.soundEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 - E5 - G5 - C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.25, 0.22);
      }, idx * 75);
    });
  }

  public playLoss() {
    if (!this.soundEnabled) return;
    const notes = [440, 392, 349.23, 293.66]; // A4 - G4 - F4 - D4
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.2, 0.18, freq * 0.9);
      }, idx * 90);
    });
  }

  public playDraw() {
    // Neutral electric clash
    this.playTone(320, 'square', 0.2, 0.15);
    this.playTone(335, 'sawtooth', 0.2, 0.15);
  }

  public playCombo(comboLevel: number) {
    const baseFreq = 400 + Math.min(comboLevel, 5) * 150;
    this.playTone(baseFreq, 'sine', 0.25, 0.25, baseFreq * 1.5);
  }

  public playAchievement() {
    if (!this.soundEnabled) return;
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sine', 0.3, 0.2), i * 60);
    });
  }

  public playPowerUp() {
    const notes = [587.33, 739.99, 880, 1174.66];
    notes.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'triangle', 0.2, 0.2), i * 50);
    });
  }

  public playSpecialEvent() {
    if (!this.soundEnabled) return;
    this.playTone(300, 'sawtooth', 0.4, 0.2, 900);
  }

  // Looping Arcade Cyberpunk Ambient Music
  public startMusic() {
    if (this.isMusicPlaying) return;
    this.initContext();
    if (!this.ctx || !this.musicGainNode) return;

    this.isMusicPlaying = true;
    const scale = [130.81, 146.83, 155.56, 174.61, 196.0, 220.0]; // C minor hexatonic
    let step = 0;

    const loop = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGainNode) return;
      try {
        const now = this.ctx.currentTime;

        // Bass pulse
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        const bassFreq = (step % 8 === 0 || step % 8 === 4) ? 65.41 : (step % 8 === 2 ? 77.78 : 58.27);
        bassOsc.frequency.setValueAtTime(bassFreq, now);

        bassGain.gain.setValueAtTime(0.2, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        bassOsc.connect(bassGain);
        bassGain.connect(this.musicGainNode);
        bassOsc.start(now);
        bassOsc.stop(now + 0.35);

        // Arp blip
        const arpOsc = this.ctx.createOscillator();
        const arpGain = this.ctx.createGain();
        arpOsc.type = 'sine';
        const note = scale[(step * 2) % scale.length] * 2;
        arpOsc.frequency.setValueAtTime(note, now);

        arpGain.gain.setValueAtTime(0.08, now);
        arpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        arpOsc.connect(arpGain);
        arpGain.connect(this.musicGainNode);
        arpOsc.start(now);
        arpOsc.stop(now + 0.2);

        step = (step + 1) % 32;
      } catch {
        // Safe catch
      }
    };

    this.musicIntervalId = window.setInterval(loop, 240);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicIntervalId !== null) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
  }
}

export const sound = new SoundSystem();
