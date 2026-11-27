import { LanguageCode } from '../context/LanguageContext';

const LANGUAGE_VOICE_PRIORITY: Record<LanguageCode, string[]> = {
  en: ['en-IN', 'en-US', 'en-GB', 'en'],
  hi: ['hi-IN', 'hi'],
  hinglish: ['en-IN', 'hi-IN', 'en-GB', 'en'],
  mr: ['mr-IN', 'hi-IN', 'mr', 'hi'],
  bn: ['bn-IN', 'bn-BD', 'bn'],
  ta: ['ta-IN', 'ta'],
  te: ['te-IN', 'te'],
  gu: ['gu-IN', 'gu']
};

export function scoreVoiceQuality(v: SpeechSynthesisVoice): number {
  const name = `${v.name} ${v.voiceURI}`.toLowerCase();
  let score = 0;

  if (name.includes('natural')) score += 130;
  if (name.includes('neural')) score += 120;
  if (name.includes('online')) score += 105;
  if (name.includes('wavenet') || name.includes('studio')) score += 95;
  if (name.includes('enhanced') || name.includes('premium')) score += 85;
  if (name.includes('google')) score += 75;
  if (name.includes('siri')) score += 70;

  const pleasantNames = [
    'neerja',
    'swara',
    'ananya',
    'kavya',
    'aria',
    'jenny',
    'sonia',
    'libby',
    'samantha',
    'lekha',
    'veena',
    'rishi',
    'heera',
    'prabhat',
    'madhur',
    'karen',
    'daniel',
    'ava',
    'allison',
    'susan'
  ];
  if (pleasantNames.some((n) => name.includes(n))) {
    score += 65;
  }

  if (
    name.includes('espeak') ||
    name.includes('festival') ||
    name.includes('mbrola') ||
    name.includes('compact') ||
    name.includes('eloquence')
  ) {
    score -= 160;
  }
  if (!v.localService) {
    score += 22;
  }
  return score;
}

export function resolveBestVoice(
  voices: SpeechSynthesisVoice[],
  lang: LanguageCode
): { voice: SpeechSynthesisVoice | null; bcp47: string } {
  const priorities = LANGUAGE_VOICE_PRIORITY[lang] || ['en-IN', 'en-US'];
  for (const tag of priorities) {
    const lowerTag = tag.toLowerCase();
    const prefix = lowerTag.split('-')[0];
    const matches = voices.filter(
      (v) =>
        v.lang.toLowerCase() === lowerTag ||
        v.lang.toLowerCase().startsWith(`${prefix}-`) ||
        v.lang.toLowerCase() === prefix
    );
    if (matches.length > 0) {
      const ranked = [...matches].sort((a, b) => {
        const aExact = a.lang.toLowerCase() === lowerTag ? 25 : 0;
        const bExact = b.lang.toLowerCase() === lowerTag ? 25 : 0;
        return scoreVoiceQuality(b) + bExact - (scoreVoiceQuality(a) + aExact);
      });
      return { voice: ranked[0], bcp47: ranked[0].lang };
    }
  }
  return { voice: null, bcp47: priorities[0] };
}

/**
 * Splits long voiceover text ONLY when needed to prevent Chrome's ~15s single-utterance cutoff,
 * keeping natural clauses intact so queued utterances flow seamlessly with 0ms JS gap.
 */
export function chunkSpeechSmoothly(text: string, maxChunkLen = 155): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  if (clean.length <= maxChunkLen) return [clean];

  const sentences = clean.match(/[^.!?।]+(?:[.!?।]+|$)/g) || [clean];
  const chunks: string[] = [];
  let buffer = '';

  for (const rawSentence of sentences) {
    const s = rawSentence.trim();
    if (!s) continue;

    if (s.length > maxChunkLen) {
      if (buffer) {
        chunks.push(buffer);
        buffer = '';
      }
      // Split overly long sentence on commas/semicolons for uninterrupted flow
      const clauses = s.split(/(?<=[,;:])\s+/);
      for (const clause of clauses) {
        if (!buffer) {
          buffer = clause;
        } else if (buffer.length + 1 + clause.length <= maxChunkLen) {
          buffer += ' ' + clause;
        } else {
          chunks.push(buffer);
          buffer = clause;
        }
      }
      continue;
    }

    if (!buffer) {
      buffer = s;
    } else if (buffer.length + 1 + s.length <= maxChunkLen) {
      buffer += ' ' + s;
    } else {
      chunks.push(buffer);
      buffer = s;
    }
  }

  if (buffer) {
    chunks.push(buffer);
  }
  return chunks;
}

/**
 * Estimates natural narration duration in seconds so scenes never linger in dead silence.
 */
export function estimateVoiceoverDurationSec(voiceover: string, lang: LanguageCode): number {
  const clean = voiceover.replace(/\s+/g, ' ').trim();
  if (!clean) return 9;
  const charsPerSec = lang === 'en' || lang === 'hinglish' ? 14.8 : 11.8;
  const estimated = clean.length / charsPerSec + 1.1;
  return Math.max(9, Math.min(24, Math.round(estimated * 10) / 10));
}

export type SoundCueType = 'chapter' | 'click' | 'success' | 'servo' | 'alert';

class VideoAudioStudio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientOscs: OscillatorNode[] = [];
  private ambientLfo: OscillatorNode | null = null;
  private ambientRunning = false;
  private isMuted = false;
  private isDucked = false;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 1;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock() {
    this.ensureContext();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(muted ? 0 : 1, now, 0.04);
  }

  public setVoiceActive(active: boolean) {
    this.isDucked = active;
    if (!this.ctx || !this.ambientGain || !this.ambientRunning) return;
    const now = this.ctx.currentTime;
    const target = active ? 0.022 : 0.055;
    this.ambientGain.gain.cancelScheduledValues(now);
    this.ambientGain.gain.setTargetAtTime(target, now, 0.25);
  }

  public startAmbient() {
    if (this.ambientRunning) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(480, now);
    filter.Q.setValueAtTime(0.7, now);

    const ambGain = ctx.createGain();
    ambGain.gain.setValueAtTime(0.0001, now);
    ambGain.gain.exponentialRampToValueAtTime(this.isDucked ? 0.022 : 0.055, now + 0.8);

    filter.connect(ambGain);
    ambGain.connect(this.masterGain);

    // Warm calming Cmaj9 pad (C3, G3, D4, E4)
    const freqs = [130.81, 196.0, 293.66, 329.63];
    const oscs: OscillatorNode[] = [];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, now);
      osc.detune.setValueAtTime((idx - 1.5) * 3.5, now);

      const voiceGain = ctx.createGain();
      voiceGain.gain.setValueAtTime(idx === 0 ? 0.35 : 0.2, now);
      osc.connect(voiceGain);
      voiceGain.connect(filter);
      osc.start(now);
      oscs.push(osc);
    });

    // Subtle slow breathing LFO on filter cutoff
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.14, now);
    lfoGain.gain.setValueAtTime(90, now);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start(now);

    this.ambientGain = ambGain;
    this.ambientOscs = oscs;
    this.ambientLfo = lfo;
    this.ambientRunning = true;
  }

  public stopAmbient() {
    if (!this.ambientRunning) return;
    const ctx = this.ctx;
    const ambGain = this.ambientGain;
    const oscs = this.ambientOscs;
    const lfo = this.ambientLfo;

    this.ambientRunning = false;
    this.ambientGain = null;
    this.ambientOscs = [];
    this.ambientLfo = null;

    if (ctx && ambGain) {
      const now = ctx.currentTime;
      ambGain.gain.cancelScheduledValues(now);
      ambGain.gain.setTargetAtTime(0.0001, now, 0.08);
      setTimeout(() => {
        oscs.forEach((o) => {
          try {
            o.stop();
            o.disconnect();
          } catch {
            // ignore
          }
        });
        if (lfo) {
          try {
            lfo.stop();
            lfo.disconnect();
          } catch {
            // ignore
          }
        }
        try {
          ambGain.disconnect();
        } catch {
          // ignore
        }
      }, 260);
    } else {
      oscs.forEach((o) => {
        try {
          o.stop();
        } catch {
          // ignore
        }
      });
      try {
        lfo?.stop();
      } catch {
        // ignore
      }
    }
  }

  public playCue(type: SoundCueType) {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;
    const now = ctx.currentTime;

    if (type === 'chapter') {
      // Soft two-note warm bell transition (E5 -> B5)
      this.playTone(659.25, now, 0.18, 0.08, 'sine');
      this.playTone(987.77, now + 0.07, 0.24, 0.065, 'sine');
    } else if (type === 'click') {
      // Crisp soft UI tap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(760, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.045);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'success') {
      // Gentle uplifting medical confirmation triad (C5 - E5 - G5 - C6)
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        this.playTone(freq, now + i * 0.055, 0.28, 0.065, 'sine');
      });
    } else if (type === 'alert') {
      // Calm clinical attention double tone
      this.playTone(440, now, 0.14, 0.065, 'triangle');
      this.playTone(554.37, now + 0.12, 0.18, 0.055, 'triangle');
    } else if (type === 'servo') {
      // Gentle micro-servo actuator sweep hum
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(165, now);
      osc.frequency.linearRampToValueAtTime(280, now + 0.35);
      osc.frequency.linearRampToValueAtTime(165, now + 0.72);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(420, now);
      filter.Q.setValueAtTime(2.5, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.08);
      gain.gain.setValueAtTime(0.04, now + 0.55);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.76);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.78);
    }
  }

  private playTone(
    freq: number,
    startTime: number,
    duration: number,
    peakGain: number,
    type: OscillatorType
  ) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }
}

export const videoAudioStudio = new VideoAudioStudio();
