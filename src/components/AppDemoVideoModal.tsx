import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Globe,
  Pause,
  Pill,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  X,
  Zap
} from 'lucide-react';
import {
  LanguageCode,
  SUPPORTED_LANGUAGES,
  useLanguage
} from '../context/LanguageContext';
import { DEMO_VIDEO_TRANSLATIONS } from '../data/demoVideoTranslations';

interface AppDemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SCENE_DURATION_SEC = 20;
const TOTAL_DURATION_SEC = 120;

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

function formatClock(totalSeconds: number): string {
  const clamped = Math.max(0, Math.min(TOTAL_DURATION_SEC, Math.floor(totalSeconds)));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function scoreVoiceQuality(v: SpeechSynthesisVoice): number {
  const name = `${v.name} ${v.voiceURI}`.toLowerCase();
  let score = 0;

  // Strongly prefer modern neural / natural human-sounding voices
  if (name.includes('natural')) score += 120;
  if (name.includes('neural')) score += 110;
  if (name.includes('online')) score += 95;
  if (name.includes('wavenet') || name.includes('studio')) score += 90;
  if (name.includes('enhanced') || name.includes('premium')) score += 80;
  if (name.includes('google')) score += 70;

  // Known warm guide voices across Chrome, Edge, macOS, iOS, Android
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
    'rishi',
    'heera',
    'prabhat',
    'madhur',
    'karen',
    'daniel'
  ];
  if (pleasantNames.some((n) => name.includes(n))) {
    score += 65;
  }

  // Penalize robotic legacy TTS engines
  if (name.includes('espeak') || name.includes('festival') || name.includes('mbrola') || name.includes('compact')) {
    score -= 150;
  }
  if (!v.localService) {
    score += 20;
  }
  return score;
}

function resolveBestVoice(
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

function splitIntoSentences(text: string): string[] {
  const matches = text.match(/[^.!?।]+(?:[.!?।]+|$)/g);
  if (!matches) return text.trim() ? [text.trim()] : [];
  return matches.map((s) => s.trim()).filter(Boolean);
}

export const AppDemoVideoModal: React.FC<AppDemoVideoModalProps> = ({
  isOpen,
  onClose
}) => {
  const { language, setLanguage } = useLanguage();
  const [elapsedSec, setElapsedSec] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const lastFrameTimeRef = useRef<number | null>(null);
  const lastSpokenKeyRef = useRef<string | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sentencePauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechSessionIdRef = useRef(0);
  const isVoiceSpeakingRef = useRef(false);
  const voiceHoldStartedAtRef = useRef<number | null>(null);

  const localeBundle = DEMO_VIDEO_TRANSLATIONS[language] || DEMO_VIDEO_TRANSLATIONS.en;
  const scenes = localeBundle.scenes;

  const activeSceneIndex = Math.min(
    scenes.length - 1,
    Math.max(0, Math.floor(elapsedSec / SCENE_DURATION_SEC))
  );
  const activeScene = scenes[activeSceneIndex];
  const sceneElapsedSec = Math.max(0, elapsedSec - activeSceneIndex * SCENE_DURATION_SEC);
  const sceneProgress = Math.min(1, sceneElapsedSec / SCENE_DURATION_SEC);
  const totalProgressPct = Math.min(100, Math.max(0, (elapsedSec / TOTAL_DURATION_SEC) * 100));

  useEffect(() => {
    voicesRef.current = voices;
  }, [voices]);

  const stopSpeech = useCallback(() => {
    speechSessionIdRef.current += 1;
    if (sentencePauseTimerRef.current) {
      clearTimeout(sentencePauseTimerRef.current);
      sentencePauseTimerRef.current = null;
    }
    isVoiceSpeakingRef.current = false;
    voiceHoldStartedAtRef.current = null;
    activeUtteranceRef.current = null;
    lastSpokenKeyRef.current = null;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speakScene = useCallback(
    (sceneIdx: number, targetLang: LanguageCode, muted: boolean) => {
      if (muted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        isVoiceSpeakingRef.current = false;
        return;
      }
      const bundle = DEMO_VIDEO_TRANSLATIONS[targetLang] || DEMO_VIDEO_TRANSLATIONS.en;
      const targetScene = bundle.scenes[sceneIdx];
      if (!targetScene) return;

      const key = `${sceneIdx}:${targetLang}`;
      if (lastSpokenKeyRef.current === key && isVoiceSpeakingRef.current) return;

      const synth = window.speechSynthesis;
      speechSessionIdRef.current += 1;
      const sessionId = speechSessionIdRef.current;
      if (sentencePauseTimerRef.current) {
        clearTimeout(sentencePauseTimerRef.current);
        sentencePauseTimerRef.current = null;
      }
      synth.cancel();

      const sentences = splitIntoSentences(targetScene.voiceover);
      if (sentences.length === 0) {
        isVoiceSpeakingRef.current = false;
        return;
      }

      const availableVoices = synth.getVoices().length > 0 ? synth.getVoices() : voicesRef.current;
      const { voice, bcp47 } = resolveBestVoice(availableVoices, targetLang);

      lastSpokenKeyRef.current = key;
      isVoiceSpeakingRef.current = true;
      voiceHoldStartedAtRef.current = null;

      let sentenceIndex = 0;
      const speakNextSentence = () => {
        if (speechSessionIdRef.current !== sessionId) return;
        if (sentenceIndex >= sentences.length) {
          activeUtteranceRef.current = null;
          isVoiceSpeakingRef.current = false;
          voiceHoldStartedAtRef.current = null;
          return;
        }

        const sentenceText = sentences[sentenceIndex];
        const utterance = new SpeechSynthesisUtterance(sentenceText);
        utterance.lang = bcp47;
        if (voice) {
          utterance.voice = voice;
        }
        // Calm, warm, unhurried human tour-guide cadence
        utterance.rate = 0.94;
        utterance.pitch = 1.03;
        utterance.volume = 1;

        const scheduleNext = () => {
          if (speechSessionIdRef.current !== sessionId) return;
          sentenceIndex += 1;
          if (sentenceIndex >= sentences.length) {
            speakNextSentence();
            return;
          }
          // Brief natural breath pause between guided sentences
          sentencePauseTimerRef.current = setTimeout(() => {
            sentencePauseTimerRef.current = null;
            speakNextSentence();
          }, 220);
        };

        utterance.onend = scheduleNext;
        utterance.onerror = scheduleNext;

        // Hold reference to prevent Chromium garbage-collecting utterance mid-sentence
        activeUtteranceRef.current = utterance;
        synth.speak(utterance);
      };

      speakNextSentence();
    },
    []
  );

  // Load browser speech synthesis voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    const updateVoices = () => {
      const nextVoices = synth.getVoices();
      voicesRef.current = nextVoices;
      setVoices(nextVoices);
    };
    updateVoices();
    synth.addEventListener('voiceschanged', updateVoices);
    return () => {
      synth.removeEventListener('voiceschanged', updateVoices);
    };
  }, []);

  // Reset & start autoplay when modal opens; stop everything on close
  useEffect(() => {
    if (isOpen) {
      setElapsedSec(0);
      setIsPlaying(true);
      lastFrameTimeRef.current = null;
      lastSpokenKeyRef.current = null;
      speakScene(0, language, isMuted);
    } else {
      setIsPlaying(false);
      stopSpeech();
    }
  }, [isOpen]); // intentionally only runs on modal open/close toggle

  // Cancel voice on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [stopSpeech]);

  // Escape & Spacebar controls
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopSpeech();
        onClose();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => {
          const next = !prev;
          if (!next) {
            stopSpeech();
          } else {
            lastSpokenKeyRef.current = null;
            speakScene(activeSceneIndex, language, isMuted);
          }
          return next;
        });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, stopSpeech, speakScene, activeSceneIndex, language, isMuted]);

  // Smooth requestAnimationFrame timeline loop (0 -> 120s), waiting cleanly for active sentence completion at chapter edges
  useEffect(() => {
    if (!isOpen || !isPlaying) {
      lastFrameTimeRef.current = null;
      voiceHoldStartedAtRef.current = null;
      return;
    }

    let rafId = 0;
    const tick = (now: number) => {
      if (lastFrameTimeRef.current !== null) {
        const dtSec = Math.min(0.1, (now - lastFrameTimeRef.current) / 1000);
        setElapsedSec((prev) => {
          const currentSceneIdx = Math.min(
            scenes.length - 1,
            Math.max(0, Math.floor(prev / SCENE_DURATION_SEC))
          );
          const sceneEndSec = (currentSceneIdx + 1) * SCENE_DURATION_SEC;
          const next = prev + dtSec;

          if (!isMuted && isVoiceSpeakingRef.current && next >= sceneEndSec - 0.05) {
            if (voiceHoldStartedAtRef.current === null) {
              voiceHoldStartedAtRef.current = now;
            }
            // Allow up to 14s grace if browser TTS is still completing the last sentence cleanly
            if (now - voiceHoldStartedAtRef.current < 14000) {
              return Math.min(prev, sceneEndSec - 0.05);
            }
            isVoiceSpeakingRef.current = false;
            voiceHoldStartedAtRef.current = null;
          } else {
            voiceHoldStartedAtRef.current = null;
          }

          if (next >= TOTAL_DURATION_SEC) {
            setIsPlaying(false);
            return TOTAL_DURATION_SEC;
          }
          return next;
        });
      }
      lastFrameTimeRef.current = now;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isOpen, isPlaying, isMuted, scenes.length]);

  // Speak automatically whenever chapter index advances during playback
  useEffect(() => {
    if (!isOpen || !isPlaying || isMuted) return;
    const key = `${activeSceneIndex}:${language}`;
    if (lastSpokenKeyRef.current !== key) {
      speakScene(activeSceneIndex, language, isMuted);
    }
  }, [isOpen, isPlaying, isMuted, activeSceneIndex, language, speakScene]);

  const handleTogglePlay = () => {
    if (elapsedSec >= TOTAL_DURATION_SEC) {
      stopSpeech();
      setElapsedSec(0);
      setIsPlaying(true);
      speakScene(0, language, isMuted);
      return;
    }
    if (isPlaying) {
      setIsPlaying(false);
      stopSpeech();
    } else {
      setIsPlaying(true);
      lastSpokenKeyRef.current = null;
      speakScene(activeSceneIndex, language, isMuted);
    }
  };

  const handleReplay = () => {
    stopSpeech();
    setElapsedSec(0);
    setIsPlaying(true);
    speakScene(0, language, isMuted);
  };

  const handleJumpToScene = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(scenes.length - 1, index));
    const targetTime = clampedIndex * SCENE_DURATION_SEC;
    stopSpeech();
    setElapsedSec(targetTime);
    setIsPlaying(true);
    speakScene(clampedIndex, language, isMuted);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      stopSpeech();
    } else if (isPlaying) {
      lastSpokenKeyRef.current = null;
      speakScene(activeSceneIndex, language, false);
    }
  };

  const handleLanguageChange = (newLang: LanguageCode) => {
    setLanguage(newLang);
    stopSpeech();
    if (isPlaying && !isMuted) {
      speakScene(activeSceneIndex, newLang, false);
    }
  };

  const currentLangOption = useMemo(
    () => SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0],
    [language]
  );

  // Derived animation states for Scene 6 physical dispense (0 -> 45 -> 0 degrees)
  const servoAngle = useMemo(() => {
    if (activeSceneIndex !== 5) return 0;
    if (sceneProgress < 0.22) return 0;
    if (sceneProgress < 0.40) {
      return Math.round(((sceneProgress - 0.22) / 0.18) * 45);
    }
    if (sceneProgress < 0.56) return 45;
    if (sceneProgress < 0.72) {
      return Math.round((1 - (sceneProgress - 0.56) / 0.16) * 45);
    }
    return 0;
  }, [activeSceneIndex, sceneProgress]);

  const slowBlueLedActive = activeSceneIndex === 5 && sceneProgress >= 0.72 && sceneProgress <= 0.90;
  const dispenseStatusLabel =
    activeSceneIndex === 5
      ? sceneProgress < 0.22
        ? 'PENDING'
        : sceneProgress < 0.90
        ? 'PROCESSING'
        : 'COMPLETED'
      : 'COMPLETED';

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={localeBundle.modalTitle}
    >
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Top Modal Header */}
        <div className="px-4 py-3 sm:px-5 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-400/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-teal-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white truncate">
                  {localeBundle.modalTitle}
                </h2>
                <span className="hidden md:inline-flex px-2 py-0.5 rounded-md bg-teal-500/15 border border-teal-400/30 text-teal-300 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap shrink-0">
                  {localeBundle.modalBadge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {localeBundle.voiceFallbackNotice}
              </p>
            </div>
          </div>

          {/* Language Selector inside video player + Close */}
          <div className="flex items-center gap-2 shrink-0">
            <label className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200">
              <Globe className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="hidden sm:inline text-[11px] text-slate-400 whitespace-nowrap">
                {localeBundle.voiceLanguageLabel}:
              </span>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
                aria-label={localeBundle.voiceLanguageLabel}
                className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                    {lang.nativeName} ({lang.label})
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => {
                stopSpeech();
                onClose();
              }}
              aria-label={localeBundle.closeBtn}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 16:9 Animated Video Stage */}
        <div className="relative w-full aspect-video min-h-[290px] sm:min-h-[380px] bg-gradient-to-br from-slate-950 via-teal-950/50 to-slate-950 overflow-hidden select-none">
          {/* Subtle architectural blueprint grid */}
          <svg
            className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
            viewBox="0 0 800 450"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern id="demoGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#14b8a6" strokeWidth="0.6" strokeOpacity="0.35" />
              </pattern>
            </defs>
            <rect width="800" height="450" fill="url(#demoGrid)" />
          </svg>

          {/* Top-left Chapter HUD & Top-right Live Time + Language Pill */}
          <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-teal-500/35 backdrop-blur-sm flex items-center gap-2 min-w-0">
              <span className="text-[11px] font-mono font-bold text-teal-300 tabular-nums shrink-0">
                0{activeSceneIndex + 1}/0{scenes.length}
              </span>
              <span className="text-xs font-semibold text-white truncate">
                {activeScene.chapterTitle}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:inline-flex px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-700 text-[11px] font-medium text-teal-200">
                {currentLangOption.nativeName}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950/85 border border-slate-700 font-mono text-xs font-bold text-white tabular-nums">
                {formatClock(elapsedSec)} / {localeBundle.totalDurationLabel}
              </span>
            </div>
          </div>

          {/* Animated Scene Canvas */}
          <div className="relative z-10 w-full h-full pt-12 pb-20 px-4 sm:px-8 flex items-center justify-center">
            {/* SCENE 1: PATIENT ONBOARDING (0 - 20s) */}
            {activeSceneIndex === 0 && (
              <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="sm:col-span-7 bg-white/95 rounded-2xl p-4 sm:p-5 shadow-2xl border border-teal-200 text-slate-900"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-teal-700 flex items-center justify-center text-white text-xs font-bold">
                        M
                      </div>
                      <span className="text-sm font-bold text-slate-900">MediMitra Intake</span>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.06, 1] }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                      className="px-2 py-1 rounded-lg bg-teal-50 border border-teal-300 text-teal-800 text-[10px] font-bold flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3" />
                      <span>{currentLangOption.nativeName}</span>
                    </motion.div>
                  </div>

                  {/* Simulated Name Field */}
                  <div className="mb-3">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1">
                      Patient Name
                    </div>
                    <div className="px-3 py-2 rounded-xl border border-teal-500 bg-teal-50/40 text-xs font-semibold text-slate-800 flex items-center justify-between">
                      <span>Meera Sharma</span>
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.9, repeat: Infinity }}
                        className="w-0.5 h-4 bg-teal-700"
                      />
                    </div>
                  </div>

                  {/* Age group selector */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: 'Child', sub: 'Under 12', active: sceneProgress < 0.35 },
                      { label: 'Adult', sub: '12 - 59', active: sceneProgress >= 0.35 },
                      { label: 'Senior', sub: '60+', active: false }
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`p-2 rounded-xl border text-center transition-colors ${
                          item.active
                            ? 'bg-teal-50 border-teal-600 ring-1 ring-teal-600'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900">{item.label}</div>
                        <div className="text-[10px] text-slate-500">{item.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Gender selector */}
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className={`p-2 rounded-xl border text-center ${
                        sceneProgress >= 0.5
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="text-xs font-bold">Female</span>
                    </div>
                    <div className="p-2 rounded-xl border bg-slate-50 text-slate-700 border-slate-200 text-center">
                      <span className="text-xs font-bold">Male</span>
                    </div>
                  </div>
                </motion.div>

                {/* Right Highlights Stack */}
                <div className="hidden sm:flex sm:col-span-5 flex-col gap-2.5">
                  {activeScene.highlights.map((item, idx) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.2 }}
                      className="p-3 rounded-xl bg-slate-900/90 border border-teal-500/30 flex items-center gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs font-semibold text-white">{item}</span>
                    </motion.div>
                  ))}
                  <div className="p-3 rounded-xl bg-teal-900/40 border border-teal-500/30 text-[11px] text-teal-100">
                    English • हिन्दी • Hinglish • मराठी • বাংলা • தமிழ் • తెలుగు • ગુજરાતી
                  </div>
                </div>
              </div>
            )}

            {/* SCENE 2: SYMPTOMS & DEMOGRAPHIC-SPECIFIC Q&A (20 - 40s) */}
            {activeSceneIndex === 1 && (
              <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* 4 Patient Flows */}
                <div className="sm:col-span-5 space-y-2">
                  {[
                    { group: 'Male (Adult / Senior)', tag: 'Standard Clinical Flow', active: sceneProgress < 0.25 },
                    { group: 'Female (Adult)', tag: 'Pregnancy/Period ONLY if needed', active: sceneProgress >= 0.25 && sceneProgress < 0.55 },
                    { group: 'Male-Child (Boy)', tag: 'Pediatric Boy Flow', active: sceneProgress >= 0.55 && sceneProgress < 0.78 },
                    { group: 'Female-Child (Girl)', tag: 'Pediatric Girl Flow', active: sceneProgress >= 0.78 }
                  ].map((row) => (
                    <div
                      key={row.group}
                      className={`p-2.5 rounded-xl border transition-all ${
                        row.active
                          ? 'bg-teal-500/20 border-teal-400 shadow-lg'
                          : 'bg-slate-900/75 border-slate-700/80 opacity-75'
                      }`}
                    >
                      <div className="text-xs font-bold text-white flex items-center justify-between">
                        <span>{row.group}</span>
                        {row.active && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <div className="text-[10px] text-teal-200 mt-0.5">{row.tag}</div>
                    </div>
                  ))}
                </div>

                {/* Live Adaptive Question Card */}
                <div className="sm:col-span-7 bg-white rounded-2xl p-4 sm:p-5 text-slate-900 shadow-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold">
                      Symptom: {sceneProgress < 0.5 ? 'Fever / Headache' : 'Stomach Upset'}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-600 tabular-nums">
                      Step {Math.min(10, Math.max(1, Math.ceil(sceneProgress * 10)))} / 10
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-3">
                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      {sceneProgress >= 0.25 && sceneProgress < 0.55
                        ? 'Conditional Safety Check: Could you currently be pregnant or in your menstrual cycle?'
                        : sceneProgress >= 0.55
                        ? 'Pediatric Hydration Check: Is the child drinking fluids normally today?'
                        : 'Severity Check: How long has the fever stayed above 100.4°F?'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg border border-teal-600 bg-teal-50 text-teal-900 text-xs font-bold text-center">
                      Yes — Adjust Safe Medicine
                    </div>
                    <div className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold text-center">
                      No — Standard Care
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SCENE 3: CLINICAL ENGINE & RECOMMENDATION (40 - 60s) */}
            {activeSceneIndex === 2 && (
              <div className="w-full max-w-3xl flex flex-col gap-3">
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { icon: Activity, title: 'Severity & Red Flags', desc: 'Breathing, chest pain, high temp' },
                    { icon: ShieldCheck, title: 'Age & Sex Safety', desc: 'Pregnancy & child-dose filter' },
                    { icon: Stethoscope, title: 'Triage Output', desc: 'Safe OTC or Doctor referral' }
                  ].map((node, i) => (
                    <motion.div
                      key={node.title}
                      animate={{
                        borderColor:
                          Math.floor(sceneProgress * 3) === i ? '#2dd4bf' : 'rgba(51,65,85,0.8)'
                      }}
                      className="p-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white"
                    >
                      <node.icon className="w-5 h-5 text-teal-300 mb-1.5" />
                      <div className="text-xs font-bold">{node.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{node.desc}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Split Outcome: Safe OTC vs Urgent Doctor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-white">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <Pill className="w-4 h-4" />
                        Mild Case → Safe OTC Care
                      </span>
                      <span className="text-[10px] font-mono bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-200">
                        ESP32 READY
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-100/90">
                      Calibrated medicine suggestion + hydration & dosage timing with one-tap Dispense button.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-950/55 border border-rose-500/50 text-white">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        Red Flag → Nearby Doctor
                      </span>
                      <span className="text-[10px] font-mono bg-rose-500/20 px-2 py-0.5 rounded text-rose-200">
                        URGENT CARE
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-100/90">
                      Blocks unsafe self-medication and opens nearby clinic / emergency doctor contact immediately.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SCENE 4: CLOUD SYNC & TOP-RIGHT ONLINE/OFFLINE BADGE (60 - 80s) */}
            {activeSceneIndex === 3 && (
              <div className="w-full max-w-3xl flex flex-col gap-4">
                {/* Simulated App Top Bar Zoom */}
                <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-700 text-white font-bold text-xs flex items-center justify-center">
                      M
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">MediMitra Header (Top-Right Live Status)</div>
                      <div className="text-[10px] text-slate-500">10s REST Heartbeat + Clock Calibration</div>
                    </div>
                  </div>

                  {/* Animated Offline -> Online transition */}
                  {sceneProgress < 0.38 ? (
                    <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5">
                      <WifiOff className="w-3.5 h-3.5" />
                      <span>Offline</span>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Wifi className="w-3.5 h-3.5" />
                      <span>Online · 192.168.43.84</span>
                    </motion.div>
                  )}
                </div>

                {/* Data flow SVG diagram */}
                <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4">
                  <svg viewBox="0 0 680 110" className="w-full h-24">
                    {/* Track lines */}
                    <line x1="120" y1="55" x2="310" y2="55" stroke="#14b8a6" strokeWidth="3" strokeDasharray="6 6" />
                    <line x1="370" y1="55" x2="560" y2="55" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 6" />

                    {/* Moving packet 1 */}
                    <motion.circle
                      r="7"
                      cy="55"
                      fill="#2dd4bf"
                      animate={{ cx: [130, 300] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                    />
                    {/* Moving packet 2 */}
                    <motion.circle
                      r="7"
                      cy="55"
                      fill="#38bdf8"
                      animate={{ cx: [380, 550] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'linear', delay: 0.5 }}
                    />

                    {/* Node 1: Web App */}
                    <rect x="12" y="20" width="112" height="70" rx="12" fill="#0f172a" stroke="#14b8a6" strokeWidth="2" />
                    <text x="68" y="50" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">Web App</text>
                    <text x="68" y="68" textAnchor="middle" fill="#99f6e4" fontSize="10">Dispense Click</text>

                    {/* Node 2: Cloud Queue */}
                    <rect x="284" y="20" width="112" height="70" rx="12" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
                    <text x="340" y="50" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">Cloud Sync</text>
                    <text x="340" y="68" textAnchor="middle" fill="#6ee7b7" fontSize="10">Queue: PENDING</text>

                    {/* Node 3: Wi-Fi / Hotspot */}
                    <rect x="556" y="20" width="112" height="70" rx="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                    <text x="612" y="50" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">2.4 GHz Wi-Fi</text>
                    <text x="612" y="68" textAnchor="middle" fill="#7dd3fc" fontSize="10">Hotspot / Router</text>
                  </svg>
                </div>
              </div>
            )}

            {/* SCENE 5: INSIDE THE ESP32 HARDWARE MODULE (80 - 100s) */}
            {activeSceneIndex === 4 && (
              <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
                {/* Hardware Wiring SVG */}
                <div className="sm:col-span-7 bg-slate-900/95 border border-slate-700 rounded-2xl p-3">
                  <svg viewBox="0 0 420 205" className="w-full h-44 sm:h-48">
                    {/* Power Supply 5V 2A */}
                    <rect x="12" y="16" width="108" height="62" rx="10" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                    <text x="66" y="40" textAnchor="middle" fill="#fcd34d" fontSize="11" fontWeight="bold">External 5V 2A</text>
                    <text x="66" y="56" textAnchor="middle" fill="#cbd5e1" fontSize="9">Dedicated Power</text>

                    {/* ESP32 DevKit V1 */}
                    <rect x="150" y="16" width="122" height="114" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                    <text x="211" y="38" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">ESP32 DevKit V1</text>
                    <text x="211" y="54" textAnchor="middle" fill="#7dd3fc" fontSize="9">2.4 GHz Wi-Fi • 2.5s Poll</text>
                    <rect x="166" y="66" width="90" height="20" rx="5" fill="#1e293b" stroke="#f97316" strokeWidth="1.2" />
                    <text x="211" y="79" textAnchor="middle" fill="#fdba74" fontSize="9" fontWeight="bold">GPIO 18 (0V Boot Lock)</text>

                    {/* GPIO 2 Blue LED animated */}
                    <motion.circle
                      cx="248"
                      cy="108"
                      r="7"
                      fill="#3b82f6"
                      animate={{ opacity: [0.25, 1, 0.25] }}
                      transition={{ duration: 0.9, repeat: Infinity }}
                    />
                    <text x="200" y="112" textAnchor="middle" fill="#93c5fd" fontSize="9" fontWeight="bold">GPIO 2 Blue LED</text>

                    {/* SG90 Servo */}
                    <rect x="302" y="16" width="104" height="72" rx="10" fill="#1e293b" stroke="#14b8a6" strokeWidth="2" />
                    <text x="354" y="40" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">SG90 Servo</text>
                    <text x="354" y="56" textAnchor="middle" fill="#99f6e4" fontSize="9">45° Medicine Gate</text>

                    {/* Orange Signal Wire (GPIO 18 -> Servo Orange) */}
                    <path d="M 256 76 L 284 76 L 284 52 L 302 52" fill="none" stroke="#f97316" strokeWidth="2.5" />
                    {/* Red 5V Wire (5V -> Servo Red) */}
                    <path d="M 120 34 L 138 34 L 138 8 L 354 8 L 354 16" fill="none" stroke="#ef4444" strokeWidth="2.5" />
                    {/* Common GND Bus */}
                    <line x1="30" y1="168" x2="390" y2="168" stroke="#94a3b8" strokeWidth="3.5" />
                    <line x1="66" y1="78" x2="66" y2="168" stroke="#94a3b8" strokeWidth="2" />
                    <line x1="211" y1="130" x2="211" y2="168" stroke="#94a3b8" strokeWidth="2" />
                    <line x1="354" y1="88" x2="354" y2="168" stroke="#94a3b8" strokeWidth="2" />
                    <text x="211" y="188" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="bold">
                      COMMON GROUND (-GND) MUST CONNECT ALL THREE
                    </text>
                  </svg>
                </div>

                {/* Blue LED Signal Decoder Card */}
                <div className="sm:col-span-5 bg-slate-900/95 border border-blue-500/35 rounded-2xl p-3.5 text-white space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-300 border-b border-slate-800 pb-2">
                    <Cpu className="w-4 h-4" />
                    <span>Blue LED Signal Guide</span>
                  </div>
                  {[
                    { code: '0.25s Fast', desc: 'Connecting to Wi-Fi / Hotspot' },
                    { code: '3x + Glow', desc: 'Wi-Fi Connected (Online!)' },
                    { code: '60ms / 5s', desc: 'Idle Heartbeat Ready' },
                    { code: '0.45s', desc: 'Setup Portal 192.168.4.1' },
                    { code: '1.2s Slow', desc: '1 Slow Blink After Dispense' }
                  ].map((led) => (
                    <div key={led.code} className="flex items-center justify-between text-[11px] bg-slate-800/70 px-2.5 py-1.5 rounded-lg">
                      <span className="font-mono font-bold text-blue-300">{led.code}</span>
                      <span className="text-slate-300 truncate ml-2">{led.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCENE 6: LIVE 0 -> 25 -> 0 DEGREE SERVO DISPENSE (100 - 120s) */}
            {activeSceneIndex === 5 && (
              <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* Mechanical Servo Animation Stage */}
                <div className="sm:col-span-7 bg-slate-900/95 border border-teal-500/40 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                      <Zap className="w-4 h-4" />
                      SG90 Actuator Motion
                    </span>
                    <span className="font-mono text-sm font-extrabold text-amber-300 tabular-nums">
                      Angle: {String(servoAngle).padStart(2, '0')}°
                    </span>
                  </div>

                  <svg viewBox="0 0 380 175" className="w-full h-40">
                    {/* Servo motor housing */}
                    <rect x="34" y="46" width="110" height="66" rx="10" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                    <text x="89" y="75" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">SG90 SERVO</text>
                    <text x="89" y="92" textAnchor="middle" fill="#7dd3fc" fontSize="9">GPIO 18 PWM</text>

                    {/* Servo shaft center */}
                    <circle cx="136" cy="60" r="10" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2" />
                    {/* Rotating horn rotated around (136, 60) */}
                    <g transform={`rotate(${servoAngle} 136 60)`}>
                      <rect x="132" y="54" width="76" height="12" rx="6" fill="#f59e0b" stroke="#fef3c7" strokeWidth="1.5" />
                      <circle cx="200" cy="60" r="3" fill="#0f172a" />
                    </g>

                    {/* Medicine chute & falling pill when gate opens */}
                    <rect x="242" y="20" width="96" height="24" rx="6" fill="#0f172a" stroke="#14b8a6" strokeWidth="1.5" />
                    <text x="290" y="36" textAnchor="middle" fill="#99f6e4" fontSize="10" fontWeight="bold">Medicine Slot</text>

                    {/* Medicine tablet dropping */}
                    <g transform={`translate(0, ${sceneProgress >= 0.35 ? Math.min(82, (sceneProgress - 0.35) * 240) : 0})`}>
                      <rect x="276" y="48" width="28" height="14" rx="7" fill="#34d399" stroke="#ecfdf5" strokeWidth="1.5" />
                    </g>

                    {/* Dispense Tray */}
                    <path d="M 234 134 L 246 156 L 334 156 L 346 134" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                    <text x="290" y="168" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="bold">Collection Tray</text>
                  </svg>
                </div>

                {/* Synchronized LED + App Completed readout */}
                <div className="sm:col-span-5 space-y-3">
                  <div className="p-3.5 rounded-2xl bg-slate-900/95 border border-blue-500/40 text-white">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-200">ESP32 GPIO 2 LED</span>
                      <span
                        className={`w-4 h-4 rounded-full border transition-all duration-500 ${
                          slowBlueLedActive
                            ? 'bg-blue-400 border-blue-200 shadow-[0_0_18px_rgba(96,165,250,0.95)]'
                            : 'bg-slate-800 border-slate-600'
                        }`}
                      />
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1.5">
                      {slowBlueLedActive
                        ? 'Slow 1.2s Blue Blink ON — Hardware Dispense Confirmed!'
                        : 'Waits for 45° rotation before firing slow confirmation blink.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-lg">
                    <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Patient Web Screen Status
                    </div>
                    <div
                      className={`px-3 py-2 rounded-xl font-mono text-xs font-extrabold flex items-center justify-between ${
                        dispenseStatusLabel === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : dispenseStatusLabel === 'PROCESSING'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      <span>{dispenseStatusLabel}</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Synchronized Subtitle Scrim */}
          <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent px-4 sm:px-6 pt-5 pb-3">
            <p className="text-center text-xs sm:text-sm font-medium text-white max-w-3xl mx-auto leading-relaxed drop-shadow">
              {activeScene.subtitle}
            </p>
          </div>
        </div>

        {/* Control Deck (No timing selection controls) */}
        <div className="bg-slate-950 px-4 py-3.5 sm:px-5 border-t border-slate-800 space-y-3">
          {/* Passive Playback Progress Strip */}
          <svg
            viewBox="0 0 1000 8"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="w-full h-2 rounded-full overflow-hidden pointer-events-none"
          >
            <rect x="0" y="0" width="1000" height="8" rx="4" fill="#1e293b" />
            <rect
              x="0"
              y="0"
              width={Math.max(8, totalProgressPct * 10)}
              height="8"
              rx="4"
              fill="#14b8a6"
            />
          </svg>

          {/* Transport Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>
                  {elapsedSec >= TOTAL_DURATION_SEC
                    ? localeBundle.replayBtn
                    : isPlaying
                    ? localeBundle.pauseBtn
                    : localeBundle.playBtn}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleJumpToScene(activeSceneIndex - 1)}
                disabled={activeSceneIndex === 0}
                aria-label="Previous chapter"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleJumpToScene(activeSceneIndex + 1)}
                disabled={activeSceneIndex === scenes.length - 1}
                aria-label="Next chapter"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleReplay}
                aria-label={localeBundle.replayBtn}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleToggleMute}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                isMuted
                  ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-teal-200'
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isMuted ? localeBundle.enableVoiceBtn : localeBundle.muteVoiceBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
