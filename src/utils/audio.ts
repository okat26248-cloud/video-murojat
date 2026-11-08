/**
 * Web Audio API synthesizer for clean, harmonic chimes on incoming appeals.
 * Complies with browser autoplay policies by initializing on user interaction.
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export const isSoundEnabled = (): boolean => {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem('gov_platform_sound');
  return saved !== null ? saved === 'true' : true;
};

export const setSoundEnabled = (enabled: boolean): void => {
  soundEnabled = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem('gov_platform_sound', enabled ? 'true' : 'false');
  }
};

export const playNewAppealChime = (): void => {
  if (!isSoundEnabled() || typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    
    // Primary Tone (Chime note 1: D5 = 587.33 Hz)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.22, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    // Secondary High Harmonic Tone (Chime note 2: A5 = 880 Hz, slightly delayed)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880.0, now + 0.12);
    gain2.gain.setValueAtTime(0.001, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.28, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.9);

    // Soft chime note 3: D6 = 1174.66 Hz (sparkle)
    const osc3 = audioCtx.createOscillator();
    const gain3 = audioCtx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1174.66, now + 0.24);
    gain3.gain.setValueAtTime(0.001, now + 0.24);
    gain3.gain.exponentialRampToValueAtTime(0.15, now + 0.28);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc3.connect(gain3);
    gain3.connect(audioCtx.destination);
    osc3.start(now + 0.24);
    osc3.stop(now + 0.95);

  } catch (err) {
    console.warn('Audio chime playback omitted or unsupported:', err);
  }
};
