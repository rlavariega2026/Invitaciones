/**
 * Ambient Music Engine for LAV Invitations
 * Supports both Web Audio API procedural romantic ambient synthesis
 * and user-uploaded custom audio files (MP3, WAV, AAC, M4A).
 */

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private gainNode: GainNode | null = null;
  private timerId: any = null;
  private currentStyle: string = 'romantic_harp';
  private audioElement: HTMLAudioElement | null = null;
  private customAudioUrl: string | null = null;
  private volume: number = 0.6;
  private onStateChangeListeners: Array<(isPlaying: boolean) => void> = [];

  constructor() {
    // Lazy initialized on first user interaction to comply with iOS/Android audio policies
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public subscribe(listener: (isPlaying: boolean) => void) {
    this.onStateChangeListeners.push(listener);
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.onStateChangeListeners.forEach((l) => l(this.isPlaying));
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
  }

  public setCustomAudio(url: string | null) {
    this.customAudioUrl = url;
    if (this.isPlaying) {
      this.stop();
      this.play(this.currentStyle);
    }
  }

  public play(style: string = 'romantic_harp') {
    this.currentStyle = style;

    if (this.customAudioUrl) {
      this.playCustomAudio();
      return;
    }

    this.initContext();
    if (!this.ctx || !this.gainNode) return;

    this.isPlaying = true;
    this.notify();

    // Procedural Romantic Ambient Chords (Harp / Acoustic chime)
    // Ethereal chord progressions: Cmaj9, Am9, Fmaj7#11, Gsus4, Em7
    const chords: number[][] = [
      [261.63, 329.63, 392.00, 493.88, 587.33], // Cmaj9
      [220.00, 261.63, 329.63, 392.00, 493.88], // Am9
      [174.61, 261.63, 329.63, 370.00, 440.00], // Fmaj7#11
      [196.00, 261.63, 293.66, 392.00, 523.25], // Gsus4
    ];

    let chordIdx = 0;
    const playArpeggio = () => {
      if (!this.isPlaying || !this.ctx || !this.gainNode) return;

      const chord = chords[chordIdx % chords.length];
      chordIdx++;

      chord.forEach((freq, noteIdx) => {
        if (!this.ctx || !this.gainNode) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        // Waveform selection based on style
        if (style === 'piano_ballad') {
          osc.type = 'triangle';
        } else if (style === 'celebration_waltz') {
          osc.type = 'sine';
        } else if (style === 'fairytale_lullaby') {
          osc.type = 'sine'; // celesta chime bell
        } else {
          osc.type = 'sine'; // gentle romantic harp
        }

        osc.frequency.setValueAtTime(style === 'fairytale_lullaby' ? freq * 1.5 : freq, this.ctx.currentTime);

        const startTime = this.ctx.currentTime + noteIdx * 0.45;
        const duration = 2.8;

        noteGain.gain.setValueAtTime(0.001, startTime);
        noteGain.gain.exponentialRampToValueAtTime(0.25 * this.volume, startTime + 0.08);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(noteGain);
        noteGain.connect(this.gainNode);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.1);
      });

      this.timerId = setTimeout(playArpeggio, 3200);
    };

    playArpeggio();
  }

  private playCustomAudio() {
    if (!this.customAudioUrl) return;

    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.loop = true;
    }
    this.audioElement.src = this.customAudioUrl;
    this.audioElement.volume = this.volume;
    this.audioElement.play().catch((err) => console.log('Audio autoplay prevented:', err));
    this.isPlaying = true;
    this.notify();
  }

  public pause() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.notify();
  }

  public stop() {
    this.pause();
  }

  public toggle(style?: string) {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play(style || this.currentStyle);
    }
  }

  public getIsPlaying() {
    return this.isPlaying;
  }
}

export const ambientMusic = new AmbientAudioEngine();
