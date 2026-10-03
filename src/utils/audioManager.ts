// Ambient Web Audio sound engine for peaceful ambient environment soundscape
class AmbientSoundManager {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMutedState: boolean = true; // Start muted until user toggles or enables
  private isInitialized: boolean = false;
  private noiseNode: AudioBufferSourceNode | null = null;
  private oscillators: OscillatorNode[] = [];

  constructor() {
    // Check saved preference if exists
    try {
      const saved = localStorage.getItem('ambient_sound_muted');
      if (saved !== null) {
        this.isMutedState = saved === 'true';
      }
    } catch {
      // ignore
    }
  }

  public isMuted(): boolean {
    return this.isMutedState;
  }

  private initAudio() {
    if (this.isInitialized) return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      this.audioCtx = new AudioContextClass();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMutedState ? 0.0001 : 0.3, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);

      // 1. Procedural Wind / Gentle Breeze (Filtered pink noise with slow LFO)
      const bufferSize = this.audioCtx.sampleRate * 4;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
        b6 = white * 0.115926;
      }

      const noiseSource = this.audioCtx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // Filter for wind / air
      const windFilter = this.audioCtx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.setValueAtTime(450, this.audioCtx.currentTime);
      windFilter.Q.setValueAtTime(2.5, this.audioCtx.currentTime);

      // LFO to slowly modulate wind frequency for natural gusting
      const lfo = this.audioCtx.createOscillator();
      lfo.frequency.setValueAtTime(0.15, this.audioCtx.currentTime);
      const lfoGain = this.audioCtx.createGain();
      lfoGain.gain.setValueAtTime(200, this.audioCtx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(windFilter.frequency);
      lfo.start();
      this.oscillators.push(lfo);

      const windGain = this.audioCtx.createGain();
      windGain.gain.setValueAtTime(0.65, this.audioCtx.currentTime);

      noiseSource.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(this.masterGain);
      noiseSource.start();
      this.noiseNode = noiseSource;

      // 2. Soothing Harmonic Ambient Pad Chords (Warm peaceful atmosphere)
      const chordFreqs = [130.81, 164.81, 196.00, 246.94]; // C3, E3, G3, B3 (Major 7th warm peaceful pad)
      const padGain = this.audioCtx.createGain();
      padGain.gain.setValueAtTime(0.045, this.audioCtx.currentTime);

      chordFreqs.forEach((freq, idx) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

        // Subtle detune for lush thickness
        osc.detune.setValueAtTime((idx - 1.5) * 4, this.audioCtx.currentTime);

        const oscGain = this.audioCtx.createGain();
        oscGain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(padGain);
        osc.start();
        this.oscillators.push(osc);
      });

      padGain.connect(this.masterGain);

      this.isInitialized = true;
    } catch (err) {
      console.warn('AudioContext initialization error:', err);
    }
  }

  public setMuted(muted: boolean) {
    this.isMutedState = muted;
    try {
      localStorage.setItem('ambient_sound_muted', muted ? 'true' : 'false');
    } catch {
      // ignore
    }

    if (!muted) {
      // Unmuting: ensure audio context is started
      if (!this.isInitialized) {
        this.initAudio();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      if (this.masterGain && this.audioCtx) {
        this.masterGain.gain.cancelScheduledValues(this.audioCtx.currentTime);
        this.masterGain.gain.setTargetAtTime(0.3, this.audioCtx.currentTime, 0.4);
      }
    } else {
      // Muting: ramp down smoothly
      if (this.masterGain && this.audioCtx) {
        this.masterGain.gain.cancelScheduledValues(this.audioCtx.currentTime);
        this.masterGain.gain.setTargetAtTime(0.0001, this.audioCtx.currentTime, 0.25);
      }
    }
  }

  public toggleMute(): boolean {
    const newState = !this.isMutedState;
    this.setMuted(newState);
    return newState;
  }

  /**
   * Procedural footstep sound generator
   * - grass: subtle 'crunch'
   * - sand: muffled 'thud'
   * - snow: soft 'tap'
   * Only triggers if sound toggle is ON (unmuted).
   */
  public playFootstep(landType: string = 'grass') {
    if (this.isMutedState) return;

    if (!this.audioCtx) {
      this.initAudio();
    }
    if (!this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    const now = this.audioCtx.currentTime;
    const dest = this.masterGain || this.audioCtx.destination;

    try {
      if (landType === 'sand') {
        // Sand: muffled low-frequency 'thud' with soft granular displacement
        const osc = this.audioCtx.createOscillator();
        const oscGain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(115, now);
        osc.frequency.exponentialRampToValueAtTime(38, now + 0.08);

        oscGain.gain.setValueAtTime(0.25, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);

        osc.connect(oscGain);
        oscGain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.10);

        // Granular sand surface rustle
        const bufLen = Math.floor(this.audioCtx.sampleRate * 0.09);
        const noiseBuffer = this.audioCtx.createBuffer(1, bufLen, this.audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufLen; i++) {
          output[i] = (Math.random() * 2 - 1) * (1 - i / bufLen);
        }
        const noiseSrc = this.audioCtx.createBufferSource();
        noiseSrc.buffer = noiseBuffer;

        const lowFilter = this.audioCtx.createBiquadFilter();
        lowFilter.type = 'lowpass';
        lowFilter.frequency.setValueAtTime(280, now);

        const noiseGain = this.audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.18, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

        noiseSrc.connect(lowFilter);
        lowFilter.connect(noiseGain);
        noiseGain.connect(dest);

        noiseSrc.start(now);
        noiseSrc.stop(now + 0.09);
      } else if (landType === 'snow') {
        // Snow: soft powdery compression 'tap'
        const osc = this.audioCtx.createOscillator();
        const oscGain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.045);

        oscGain.gain.setValueAtTime(0.15, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

        osc.connect(oscGain);
        oscGain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.06);

        // Soft powdery snow compression noise
        const bufLen = Math.floor(this.audioCtx.sampleRate * 0.07);
        const noiseBuffer = this.audioCtx.createBuffer(1, bufLen, this.audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufLen; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.3 * (1 - i / bufLen);
        }
        const noiseSrc = this.audioCtx.createBufferSource();
        noiseSrc.buffer = noiseBuffer;

        const bandFilter = this.audioCtx.createBiquadFilter();
        bandFilter.type = 'bandpass';
        bandFilter.frequency.setValueAtTime(1100, now);
        bandFilter.Q.setValueAtTime(1.6, now);

        const noiseGain = this.audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.14, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

        noiseSrc.connect(bandFilter);
        bandFilter.connect(noiseGain);
        noiseGain.connect(dest);

        noiseSrc.start(now);
        noiseSrc.stop(now + 0.07);
      } else {
        // Grass: subtle realistic 'crunch'
        const bufLen = Math.floor(this.audioCtx.sampleRate * 0.095);
        const noiseBuffer = this.audioCtx.createBuffer(1, bufLen, this.audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        // Irregular tiny snaps simulating grass blades
        for (let i = 0; i < bufLen; i++) {
          const env = Math.pow(1 - (i / bufLen), 1.2);
          const crackle = Math.random() > 0.84 ? 1.7 : 0.55;
          output[i] = (Math.random() * 2 - 1) * crackle * env;
        }
        const noiseSrc = this.audioCtx.createBufferSource();
        noiseSrc.buffer = noiseBuffer;

        const bandFilter = this.audioCtx.createBiquadFilter();
        bandFilter.type = 'bandpass';
        bandFilter.frequency.setValueAtTime(1900 + (Math.random() - 0.5) * 200, now);
        bandFilter.Q.setValueAtTime(1.5, now);

        const noiseGain = this.audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.20, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        // Subtle low turf thud
        const thudOsc = this.audioCtx.createOscillator();
        const thudGain = this.audioCtx.createGain();
        thudOsc.type = 'sine';
        thudOsc.frequency.setValueAtTime(95, now);
        thudOsc.frequency.exponentialRampToValueAtTime(45, now + 0.06);

        thudGain.gain.setValueAtTime(0.12, now);
        thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

        noiseSrc.connect(bandFilter);
        bandFilter.connect(noiseGain);
        noiseGain.connect(dest);

        thudOsc.connect(thudGain);
        thudGain.connect(dest);

        noiseSrc.start(now);
        noiseSrc.stop(now + 0.095);
        thudOsc.start(now);
        thudOsc.stop(now + 0.07);
      }
    } catch {
      // Audio nodes handled safely
    }
  }
}

export const ambientSound = new AmbientSoundManager();
