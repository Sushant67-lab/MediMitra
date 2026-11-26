import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FastForward,
  Globe,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Rewind,
  RotateCcw,
  ShieldAlert,
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
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { WIRING_VIDEO_TRANSLATIONS } from '../data/wiringVideoTranslations';

interface Esp32WiringVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SCENE_DURATION_SEC = 30;
const TOTAL_DURATION_SEC = 300; // 5 minutes (10 scenes x 30s)
const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5] as const;

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
  if (name.includes('natural')) score += 120;
  if (name.includes('neural')) score += 110;
  if (name.includes('online')) score += 95;
  if (name.includes('wavenet') || name.includes('studio')) score += 90;
  if (name.includes('enhanced') || name.includes('premium')) score += 80;
  if (name.includes('google')) score += 70;

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
  if (pleasantNames.some((n) => name.includes(n))) score += 65;

  if (name.includes('espeak') || name.includes('festival') || name.includes('mbrola') || name.includes('compact')) {
    score -= 150;
  }
  if (!v.localService) score += 20;
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

export const Esp32WiringVideoModal: React.FC<Esp32WiringVideoModalProps> = ({
  isOpen,
  onClose
}) => {
  const { language, setLanguage } = useLanguage();
  const { isDark } = useTheme();
  const [elapsedSec, setElapsedSec] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const lastSpokenKeyRef = useRef<string | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sentencePauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechSessionIdRef = useRef(0);
  const isVoiceSpeakingRef = useRef(false);
  const voiceHoldStartedAtRef = useRef<number | null>(null);
  const playbackSpeedRef = useRef<number>(playbackSpeed);
  playbackSpeedRef.current = playbackSpeed;

  const localeBundle = WIRING_VIDEO_TRANSLATIONS[language] || WIRING_VIDEO_TRANSLATIONS.en;
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

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

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
    (sceneIdx: number, targetLang: LanguageCode, muted: boolean, speed = playbackSpeedRef.current) => {
      if (muted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        isVoiceSpeakingRef.current = false;
        return;
      }
      const bundle = WIRING_VIDEO_TRANSLATIONS[targetLang] || WIRING_VIDEO_TRANSLATIONS.en;
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
        if (voice) utterance.voice = voice;
        utterance.rate = Math.max(0.7, Math.min(1.6, 0.94 * speed));
        utterance.pitch = 1.03;
        utterance.volume = 1;

        const scheduleNext = () => {
          if (speechSessionIdRef.current !== sessionId) return;
          sentenceIndex += 1;
          if (sentenceIndex >= sentences.length) {
            speakNextSentence();
            return;
          }
          sentencePauseTimerRef.current = setTimeout(() => {
            sentencePauseTimerRef.current = null;
            speakNextSentence();
          }, 220);
        };

        utterance.onend = scheduleNext;
        utterance.onerror = scheduleNext;
        activeUtteranceRef.current = utterance;
        synth.speak(utterance);
      };

      speakNextSentence();
    },
    []
  );

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
    return () => synth.removeEventListener('voiceschanged', updateVoices);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setElapsedSec(0);
      setIsPlaying(true);
      lastFrameTimeRef.current = null;
      lastSpokenKeyRef.current = null;
      speakScene(0, language, isMuted, playbackSpeedRef.current);
    } else {
      setIsPlaying(false);
      stopSpeech();
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, [isOpen]);

  useEffect(() => {
    return () => stopSpeech();
  }, [stopSpeech]);

  const handleSeekTo = useCallback(
    (targetSec: number) => {
      const clamped = Math.max(0, Math.min(TOTAL_DURATION_SEC, targetSec));
      const nextSceneIdx = Math.min(scenes.length - 1, Math.max(0, Math.floor(clamped / SCENE_DURATION_SEC)));
      const prevSceneIdx = activeSceneIndex;
      setElapsedSec(clamped);
      if (nextSceneIdx !== prevSceneIdx) {
        stopSpeech();
        if (isPlaying && !isMuted && clamped < TOTAL_DURATION_SEC) {
          speakScene(nextSceneIdx, language, false, playbackSpeedRef.current);
        }
      }
      if (clamped >= TOTAL_DURATION_SEC) {
        setIsPlaying(false);
        stopSpeech();
      }
    },
    [scenes.length, activeSceneIndex, stopSpeech, isPlaying, isMuted, speakScene, language]
  );

  const handleSkipBy = useCallback(
    (deltaSec: number) => {
      handleSeekTo(elapsedSec + deltaSec);
    },
    [elapsedSec, handleSeekTo]
  );

  const handleTogglePlay = useCallback(() => {
    if (elapsedSec >= TOTAL_DURATION_SEC) {
      stopSpeech();
      setElapsedSec(0);
      setIsPlaying(true);
      speakScene(0, language, isMuted, playbackSpeedRef.current);
      return;
    }
    if (isPlaying) {
      setIsPlaying(false);
      stopSpeech();
    } else {
      setIsPlaying(true);
      lastSpokenKeyRef.current = null;
      speakScene(activeSceneIndex, language, isMuted, playbackSpeedRef.current);
    }
  }, [elapsedSec, stopSpeech, speakScene, language, isMuted, isPlaying, activeSceneIndex]);

  const handleToggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      stopSpeech();
    } else if (isPlaying) {
      lastSpokenKeyRef.current = null;
      speakScene(activeSceneIndex, language, false, playbackSpeedRef.current);
    }
  }, [isMuted, stopSpeech, isPlaying, speakScene, activeSceneIndex, language]);

  const handleToggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement && playerContainerRef.current?.requestFullscreen) {
        await playerContainerRef.current.requestFullscreen();
      } else if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen unavailable in sandboxed context
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement | null)?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'SELECT' || targetTag === 'TEXTAREA') {
        if (e.key !== 'Escape') return;
      }
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
          return;
        }
        stopSpeech();
        onClose();
      } else if (e.key === ' ') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSkipBy(-10);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSkipBy(10);
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        handleToggleMute();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        handleToggleFullscreen();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, stopSpeech, handleTogglePlay, handleSkipBy, handleToggleMute, handleToggleFullscreen]);

  useEffect(() => {
    if (!isOpen || !isPlaying) {
      lastFrameTimeRef.current = null;
      voiceHoldStartedAtRef.current = null;
      return;
    }

    let rafId = 0;
    const tick = (now: number) => {
      if (lastFrameTimeRef.current !== null) {
        const dtSec = Math.min(0.1, (now - lastFrameTimeRef.current) / 1000) * playbackSpeedRef.current;
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
            if (now - voiceHoldStartedAtRef.current < 16000) {
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

  useEffect(() => {
    if (!isOpen || !isPlaying || isMuted) return;
    const key = `${activeSceneIndex}:${language}`;
    if (lastSpokenKeyRef.current !== key) {
      speakScene(activeSceneIndex, language, isMuted, playbackSpeedRef.current);
    }
  }, [isOpen, isPlaying, isMuted, activeSceneIndex, language, speakScene]);

  const handleReplay = () => {
    stopSpeech();
    setElapsedSec(0);
    setIsPlaying(true);
    speakScene(0, language, isMuted, playbackSpeed);
  };

  const handleJumpToScene = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(scenes.length - 1, index));
    stopSpeech();
    setElapsedSec(clampedIndex * SCENE_DURATION_SEC);
    setIsPlaying(true);
    speakScene(clampedIndex, language, isMuted, playbackSpeed);
  };

  const handleCycleSpeed = () => {
    const idx = PLAYBACK_SPEEDS.indexOf(playbackSpeed as (typeof PLAYBACK_SPEEDS)[number]);
    const nextSpeed = PLAYBACK_SPEEDS[(idx + 1) % PLAYBACK_SPEEDS.length];
    setPlaybackSpeed(nextSpeed);
    if (isPlaying && !isMuted) {
      stopSpeech();
      speakScene(activeSceneIndex, language, false, nextSpeed);
    }
  };

  const handleLanguageChange = (newLang: LanguageCode) => {
    setLanguage(newLang);
    stopSpeech();
    if (isPlaying && !isMuted) {
      speakScene(activeSceneIndex, newLang, false, playbackSpeed);
    }
  };

  const currentLangOption = useMemo(
    () => SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0],
    [language]
  );

  const showWire1Orange = activeSceneIndex >= 2;
  const showWire2RedServo = activeSceneIndex >= 4;
  const showWire3RedVin = activeSceneIndex >= 5;
  const showWire4Ground = activeSceneIndex >= 6;
  const esp32PoweredOn = activeSceneIndex >= 8 || (activeSceneIndex === 5 && sceneProgress > 0.65);

  const wifiConnected = activeSceneIndex === 8 ? sceneProgress >= 0.52 : activeSceneIndex >= 9;
  const blueLedBlinkingPhase = activeSceneIndex === 8 && !wifiConnected;

  const dispenseAngle = useMemo(() => {
    if (activeSceneIndex !== 9) return 0;
    if (sceneProgress < 0.25) return 0;
    if (sceneProgress < 0.42) return Math.round(((sceneProgress - 0.25) / 0.17) * 45);
    if (sceneProgress < 0.60) return 45;
    if (sceneProgress < 0.76) return Math.round((1 - (sceneProgress - 0.60) / 0.16) * 45);
    return 0;
  }, [activeSceneIndex, sceneProgress]);

  const slowConfirmBlinkOn = activeSceneIndex === 9 && sceneProgress >= 0.76 && sceneProgress <= 0.90;

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto transition-colors ${
        isDark ? 'bg-slate-950/90' : 'bg-slate-900/60'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={localeBundle.modalTitle}
    >
      <div
        ref={playerContainerRef}
        className={`w-full ${
          isFullscreen ? 'max-w-none h-full rounded-none border-0' : 'max-w-5xl rounded-2xl border my-auto'
        } shadow-2xl overflow-hidden flex flex-col transition-colors ${
          isDark
            ? 'bg-slate-900 border-slate-700/80 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Modal Header */}
        <div
          className={`px-4 py-3 sm:px-5 border-b flex flex-wrap items-center justify-between gap-3 ${
            isDark
              ? 'bg-slate-950 border-slate-800'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                isDark
                  ? 'bg-amber-500/15 border-amber-400/35'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <Zap className={`w-4 h-4 ${isDark ? 'text-amber-300' : 'text-amber-600'}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className={`text-sm sm:text-base font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {localeBundle.modalTitle}
                </h2>
                <span
                  className={`hidden md:inline-flex px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 ${
                    isDark
                      ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}
                >
                  {localeBundle.noBreadboardBadge}
                </span>
              </div>
              <p className={`text-[11px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {localeBundle.voiceNotice}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle variant="video" showLabel />

            <label
              className={`flex items-center gap-1.5 border rounded-xl px-2.5 py-1.5 text-xs ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <Globe className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
                aria-label={localeBundle.voiceLanguageLabel}
                className={`bg-transparent font-semibold text-xs focus:outline-none cursor-pointer ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option
                    key={lang.code}
                    value={lang.code}
                    className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}
                  >
                    {lang.nativeName}
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
              className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 16:9 Animated Wiring Stage */}
        <div
          onClick={handleTogglePlay}
          title={isPlaying ? localeBundle.pauseBtn : localeBundle.playBtn}
          className={`relative w-full ${
            isFullscreen ? 'flex-1 min-h-0' : 'aspect-video min-h-[300px] sm:min-h-[410px]'
          } overflow-hidden select-none cursor-pointer transition-colors ${
            isDark
              ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950/60'
              : 'bg-gradient-to-br from-slate-50 via-white to-teal-50/75'
          }`}
        >
          {/* Top-left Chapter HUD & Language Tag (Clock moved down to bottom control deck) */}
          <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
            <div
              className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 min-w-0 ${
                isDark
                  ? 'bg-slate-950/85 border-teal-500/40'
                  : 'bg-white/95 border-teal-300/80 shadow-xs'
              }`}
            >
              <span className={`text-[11px] font-mono font-bold tabular-nums shrink-0 ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                {String(activeSceneIndex + 1).padStart(2, '0')}/{scenes.length}
              </span>
              <span className={`text-xs font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {activeScene.chapterTitle}
              </span>
            </div>

            <span
              className={`hidden sm:inline-flex px-2.5 py-1 rounded-lg border text-[11px] font-medium shrink-0 ${
                isDark
                  ? 'bg-slate-950/85 border-slate-700 text-teal-200'
                  : 'bg-white/95 border-slate-300 text-teal-800 shadow-xs'
              }`}
            >
              {currentLangOption.nativeName}
            </span>
          </div>

          {/* Main Visual Stage */}
          <div className="relative z-10 w-full h-full pt-12 pb-20 px-3 sm:px-6 flex flex-col justify-center">
            {/* Key Tip Ribbon */}
            <div
              className={`mb-2 mx-auto max-w-3xl w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border text-[11px] ${
                isDark
                  ? 'bg-amber-500/10 border-amber-400/30 text-amber-200'
                  : 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs'
              }`}
            >
              <span className="font-semibold truncate">{activeScene.keyTip}</span>
              <span
                className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-mono shrink-0 ${
                  isDark ? 'text-emerald-300' : 'text-emerald-700 font-bold'
                }`}
              >
                <Ban className="w-3 h-3" />
                NO BREADBOARD
              </span>
            </div>

            {/* SCENE 0: PARTS CHECKLIST */}
            {activeSceneIndex === 0 && (
              <div className="w-full max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {[
                  {
                    num: '01',
                    name: 'ESP32 DevKit V1',
                    sub: '30-Pin naked board',
                    darkCard: 'border-sky-400/50 bg-sky-950/40',
                    lightCard: 'border-sky-300 bg-sky-50'
                  },
                  {
                    num: '02',
                    name: 'SG90 Servo',
                    sub: '3-Pin plug attached',
                    darkCard: 'border-teal-400/50 bg-teal-950/40',
                    lightCard: 'border-teal-300 bg-teal-50'
                  },
                  {
                    num: '03',
                    name: '5V 2A DC Supply',
                    sub: '+ 2-Pin screw adapter',
                    darkCard: 'border-rose-400/50 bg-rose-950/40',
                    lightCard: 'border-rose-300 bg-rose-50'
                  },
                  {
                    num: '04',
                    name: '4 Jumper Wires',
                    sub: 'Orange, 2x Red, Black',
                    darkCard: 'border-amber-400/50 bg-amber-950/40',
                    lightCard: 'border-amber-300 bg-amber-50'
                  }
                ].map((item, idx) => (
                  <motion.div
                    key={item.num}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.25 }}
                    className={`p-3 rounded-2xl border flex flex-col justify-between ${
                      isDark ? `${item.darkCard} text-white` : `${item.lightCard} text-slate-900 shadow-xs`
                    }`}
                  >
                    <span className={`text-[10px] font-mono font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {item.num}
                    </span>
                    <div className="my-2">
                      <p className="text-xs sm:text-sm font-bold leading-snug">{item.name}</p>
                      <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{item.sub}</p>
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Direct Connect</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* SCENE 3: HOW TO SPLIT 5V & GND WITHOUT A BREADBOARD */}
            {activeSceneIndex === 3 && (
              <div className="w-full max-w-3xl mx-auto bg-slate-950/90 border border-slate-700 rounded-2xl p-3 sm:p-4 shadow-lg">
                <svg viewBox="0 0 760 220" className="w-full h-44 sm:h-52">
                  <rect x="20" y="76" width="140" height="68" rx="10" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                  <text x="90" y="106" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">5V 2A Adapter</text>
                  <text x="90" y="124" textAnchor="middle" fill="#94a3b8" fontSize="10">Barrel Jack</text>

                  <rect x="160" y="96" width="44" height="28" rx="4" fill="#475569" />

                  <rect x="204" y="60" width="136" height="100" rx="8" fill="#15803d" stroke="#22c55e" strokeWidth="2.5" />
                  <text x="272" y="80" textAnchor="middle" fill="#dcfce7" fontSize="10.5" fontWeight="bold">2-PIN SCREW BLOCK</text>

                  <rect x="220" y="90" width="104" height="26" rx="4" fill="#166534" stroke="#86efac" strokeWidth="1" />
                  <circle cx="242" cy="103" r="8" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1.5" />
                  <line x1="236" y1="103" x2="248" y2="103" stroke="#0f172a" strokeWidth="2" />
                  <text x="286" y="107" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">+ (RED)</text>

                  <rect x="220" y="124" width="104" height="26" rx="4" fill="#166534" stroke="#86efac" strokeWidth="1" />
                  <circle cx="242" cy="137" r="8" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1.5" />
                  <line x1="236" y1="137" x2="248" y2="137" stroke="#0f172a" strokeWidth="2" />
                  <text x="286" y="141" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">- (GND)</text>

                  <motion.path
                    d="M 340 100 H 465 L 515 58 H 725"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: Math.min(1, sceneProgress * 2.2) }}
                  />
                  <motion.path
                    d="M 340 107 H 480 L 515 95 H 725"
                    fill="none"
                    stroke="#f87171"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: Math.min(1, sceneProgress * 2.2) }}
                  />

                  <motion.path
                    d="M 340 134 H 480 L 515 142 H 725"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: Math.min(1, Math.max(0, (sceneProgress - 0.2) * 2.2)) }}
                  />
                  <motion.path
                    d="M 340 141 H 465 L 515 178 H 725"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: Math.min(1, Math.max(0, (sceneProgress - 0.2) * 2.2)) }}
                  />

                  <rect x="530" y="42" width="196" height="28" rx="6" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.2" />
                  <text x="628" y="60" textAnchor="middle" fill="#fecaca" fontSize="11" fontWeight="bold">Red 1 → Servo Center Pin</text>

                  <rect x="530" y="80" width="196" height="28" rx="6" fill="#7f1d1d" stroke="#f87171" strokeWidth="1.2" />
                  <text x="628" y="98" textAnchor="middle" fill="#fecaca" fontSize="11" fontWeight="bold">Red 2 → ESP32 VIN Pin</text>

                  <rect x="530" y="127" width="196" height="28" rx="6" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.2" />
                  <text x="628" y="145" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="bold">GND 1 → ESP32 GND Pin</text>

                  <rect x="530" y="163" width="196" height="28" rx="6" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.2" />
                  <text x="628" y="181" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="bold">GND 2 → Servo Brown Pin</text>
                </svg>
              </div>
            )}

            {/* SCENE 7: SAFETY RULE (LAPTOP USB vs VIN) */}
            {activeSceneIndex === 7 && (
              <div className="w-full max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  className={`p-4 rounded-2xl border space-y-2.5 ${
                    isDark
                      ? 'bg-slate-950/90 border-sky-500/50 text-white'
                      : 'bg-white border-sky-300 text-slate-900 shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-sky-300' : 'text-sky-700'}`}>
                      Mode A · Code Upload
                    </span>
                    <ShieldAlert className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                  </div>
                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      isDark ? 'bg-sky-950/60 border-sky-500/30' : 'bg-sky-50 border-sky-200'
                    }`}
                  >
                    <span>Laptop USB Cable</span>
                    <span className={`font-mono font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>PLUGGED IN</span>
                  </div>
                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      isDark ? 'bg-rose-950/60 border-rose-500/40' : 'bg-rose-50 border-rose-200'
                    }`}
                  >
                    <span>External +5V to VIN Wire</span>
                    <span className={`font-mono font-bold ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>UNPLUGGED!</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Protects your laptop USB port from back-feeding 5V power while flashing firmware.
                  </p>
                </div>

                <div
                  className={`p-4 rounded-2xl border space-y-2.5 ${
                    isDark
                      ? 'bg-slate-950/90 border-emerald-500/50 text-white'
                      : 'bg-white border-emerald-300 text-slate-900 shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                      Mode B · Dispenser Running
                    </span>
                    <CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  </div>
                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'
                    }`}
                  >
                    <span>Laptop USB Cable</span>
                    <span className={`font-mono font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>REMOVED</span>
                  </div>
                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      isDark ? 'bg-emerald-950/60 border-emerald-500/40' : 'bg-emerald-50 border-emerald-200'
                    }`}
                  >
                    <span>External +5V to VIN Wire</span>
                    <span className={`font-mono font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>CONNECTED</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Or leave VIN off and plug a regular 5V phone charger into the ESP32 USB port.
                  </p>
                </div>
              </div>
            )}

            {/* SCENES 1, 2, 4, 5, 6, 8, 9: PROGRESSIVE LIVE BENCH SCHEMATIC */}
            {activeSceneIndex !== 0 && activeSceneIndex !== 3 && activeSceneIndex !== 7 && (
              <div className="w-full max-w-4xl mx-auto bg-slate-950/90 border border-slate-700/90 rounded-2xl p-2 sm:p-3 shadow-lg">
                <svg viewBox="0 0 860 310" className="w-full h-auto max-h-[250px] sm:max-h-[280px]">
                  {showWire2RedServo && (
                    <motion.path
                      d="M 184 118 H 248 V 28 H 584 V 114 H 614"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: activeSceneIndex === 4 ? 0 : 1 }}
                      animate={{ pathLength: activeSceneIndex === 4 ? Math.min(1, sceneProgress * 1.45) : 1 }}
                    />
                  )}

                  {showWire3RedVin && (
                    <motion.path
                      d="M 248 118 V 238 H 322"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: activeSceneIndex === 5 ? 0 : 1 }}
                      animate={{ pathLength: activeSceneIndex === 5 ? Math.min(1, sceneProgress * 1.45) : 1 }}
                    />
                  )}
                  {showWire3RedVin && (
                    <circle cx="248" cy="118" r="5.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                  )}

                  {showWire1Orange && (
                    <motion.path
                      d="M 484 150 H 614"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      initial={{ pathLength: activeSceneIndex === 2 ? 0 : 1 }}
                      animate={{ pathLength: activeSceneIndex === 2 ? Math.min(1, sceneProgress * 1.45) : 1 }}
                    />
                  )}

                  {activeSceneIndex === 9 && sceneProgress >= 0.12 && sceneProgress <= 0.45 && (
                    <motion.circle
                      cy="150"
                      r="6"
                      fill="#fef08a"
                      animate={{ cx: [484, 614] }}
                      transition={{ duration: 0.7, repeat: Infinity }}
                    />
                  )}

                  {showWire4Ground && (
                    <>
                      <motion.path
                        d="M 184 220 H 214 V 284 H 584 V 186 H 614"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: activeSceneIndex === 6 ? 0 : 1 }}
                        animate={{ pathLength: activeSceneIndex === 6 ? Math.min(1, sceneProgress * 1.45) : 1 }}
                      />
                      <motion.path
                        d="M 484 220 H 542 V 284"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: activeSceneIndex === 6 ? 0 : 1 }}
                        animate={{ pathLength: activeSceneIndex === 6 ? Math.min(1, sceneProgress * 1.45) : 1 }}
                      />
                      <circle cx="542" cy="284" r="5.5" fill="#94a3b8" stroke="#0f172a" strokeWidth="1.5" />
                    </>
                  )}

                  <rect x="26" y="76" width="158" height="174" rx="12" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                  <rect x="26" y="76" width="158" height="28" rx="12" fill="#0f172a" />
                  <text x="105" y="94" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">5V 2A POWER SUPPLY</text>
                  <rect x="44" y="106" width="130" height="24" rx="5" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.2" />
                  <text x="109" y="122" textAnchor="middle" fill="#fecaca" fontSize="11" fontWeight="bold">+5V (+) SCREW</text>
                  <circle cx="184" cy="118" r="5.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />

                  <text x="105" y="162" textAnchor="middle" fill="#94a3b8" fontSize="10">No Breadboard</text>
                  <text x="105" y="177" textAnchor="middle" fill="#94a3b8" fontSize="10">2-Pin Screw Splitter</text>

                  <rect x="44" y="208" width="130" height="24" rx="5" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.2" />
                  <text x="109" y="224" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="bold">GND (-) SCREW</text>
                  <circle cx="184" cy="220" r="5.5" fill="#94a3b8" stroke="#ffffff" strokeWidth="1.5" />

                  <rect x="312" y="48" width="182" height="214" rx="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                  <rect x="356" y="64" width="94" height="58" rx="6" fill="#64748b" stroke="#94a3b8" strokeWidth="1.5" />
                  <text x="403" y="91" textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="bold">ESP-WROOM-32</text>
                  <text x="403" y="106" textAnchor="middle" fill="#1e293b" fontSize="8.5" fontWeight="bold">Wi-Fi Module</text>

                  <circle cx="354" cy="206" r="5" fill={esp32PoweredOn ? '#ef4444' : '#334155'} />
                  <text x="354" y="194" textAnchor="middle" fill={esp32PoweredOn ? '#fca5a5' : '#64748b'} fontSize="8" fontWeight="bold">
                    PWR
                  </text>

                  <motion.circle
                    cx="448"
                    cy="206"
                    r="6"
                    fill={
                      slowConfirmBlinkOn
                        ? '#60a5fa'
                        : blueLedBlinkingPhase
                        ? '#3b82f6'
                        : '#1e293b'
                    }
                    stroke={slowConfirmBlinkOn || blueLedBlinkingPhase ? '#bfdbfe' : '#475569'}
                    strokeWidth="1.5"
                    animate={
                      blueLedBlinkingPhase
                        ? { opacity: [0.15, 1, 0.15] }
                        : { opacity: 1 }
                    }
                    transition={blueLedBlinkingPhase ? { duration: 0.45, repeat: Infinity } : undefined}
                  />
                  <text x="448" y="193" textAnchor="middle" fill="#93c5fd" fontSize="8" fontWeight="bold">
                    {blueLedBlinkingPhase ? 'BLINKING' : wifiConnected ? 'LED OFF' : 'D2 LED'}
                  </text>

                  <circle
                    cx="484"
                    cy="150"
                    r={activeSceneIndex === 1 || activeSceneIndex === 2 ? 7 : 5.5}
                    fill="#f97316"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <rect x="406" y="139" width="68" height="22" rx="5" fill="#f97316" />
                  <text x="440" y="153.5" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="bold">D18 (7th)</text>

                  <circle
                    cx="484"
                    cy="220"
                    r={activeSceneIndex === 1 || activeSceneIndex === 6 ? 7 : 5.5}
                    fill="#94a3b8"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <rect x="418" y="210" width="56" height="20" rx="5" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
                  <text x="446" y="223.5" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="bold">GND</text>

                  <circle
                    cx="322"
                    cy="238"
                    r={activeSceneIndex === 1 || activeSceneIndex === 5 ? 7 : 5.5}
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <rect x="332" y="228" width="68" height="20" rx="5" fill="#dc2626" />
                  <text x="366" y="241.5" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="bold">VIN (+5V)</text>

                  <rect x="383" y="252" width="40" height="14" rx="3" fill="#cbd5e1" />
                  <text x="403" y="278" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold">USB Port (Facing Down)</text>

                  <rect x="614" y="100" width="96" height="28" rx="6" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" />
                  <text x="662" y="118" textAnchor="middle" fill="#fecaca" fontSize="10" fontWeight="bold">RED (+5V)</text>

                  <rect x="606" y="136" width="106" height="28" rx="6" fill="#7c2d12" stroke="#f59e0b" strokeWidth="1.5" />
                  <text x="659" y="154" textAnchor="middle" fill="#fde68a" fontSize="9.2" fontWeight="bold">YELLOW / ORANGE</text>

                  <rect x="614" y="172" width="96" height="28" rx="6" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
                  <text x="662" y="190" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="bold">BROWN (GND)</text>

                  <rect x="726" y="100" width="92" height="106" rx="10" fill="#2563eb" stroke="#60a5fa" strokeWidth="2" />
                  <text x="772" y="182" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">SG90 SERVO</text>
                  <circle cx="772" cy="126" r="14" fill="#93c5fd" stroke="#1e3a8a" strokeWidth="2" />
                  <g transform={`rotate(${dispenseAngle} 772 126)`}>
                    <rect x="766" y="76" width="12" height="54" rx="6" fill="#f8fafc" stroke="#334155" strokeWidth="1.5" />
                  </g>
                  <text x="772" y="226" textAnchor="middle" fill="#fbbf24" fontSize="12" fontWeight="bold">
                    Angle: {String(dispenseAngle).padStart(2, '0')}°
                  </text>

                  {(activeSceneIndex === 8 || activeSceneIndex === 9) && (
                    <g transform="translate(560, 240)">
                      <rect x="0" y="0" width="270" height="50" rx="10" fill="#0f172a" stroke={wifiConnected ? '#10b981' : '#f43f5e'} strokeWidth="1.5" />
                      <text x="16" y="22" fill="#e2e8f0" fontSize="10.5" fontWeight="bold">
                        MediMitra Top-Right Indicator:
                      </text>
                      <text x="16" y="39" fill={wifiConnected ? '#34d399' : '#fda4af'} fontSize="12" fontWeight="bold">
                        {activeSceneIndex === 9
                          ? sceneProgress >= 0.78
                            ? '● Online · DISPENSE COMPLETED!'
                            : '● Online · DISPENSING DOSE...'
                          : wifiConnected
                          ? '● Online (Blue LED Turned OFF!)'
                          : '○ Offline (Connecting Wi-Fi...)'}
                      </text>
                    </g>
                  )}
                </svg>

                {activeSceneIndex === 8 && (
                  <div className="mt-2 flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <span className="text-slate-300">ESP32 Link State:</span>
                    {wifiConnected ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <Wifi className="w-3.5 h-3.5" />
                        Online · Blue LED Stopped Blinking
                      </span>
                    ) : (
                      <span className="text-amber-300 font-semibold flex items-center gap-1.5">
                        <WifiOff className="w-3.5 h-3.5" />
                        Connecting Wi-Fi (Blue LED Blinking...)
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Synchronized Subtitle Scrim */}
          <div
            className={`absolute bottom-0 inset-x-0 z-20 px-4 sm:px-6 pt-6 pb-3 pointer-events-none ${
              isDark
                ? 'bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent'
                : 'bg-gradient-to-t from-white/95 via-white/90 to-transparent'
            }`}
          >
            <p
              className={`text-center text-xs sm:text-sm font-medium max-w-3xl mx-auto leading-relaxed ${
                isDark ? 'text-white drop-shadow' : 'text-slate-900'
              }`}
            >
              {activeScene.subtitle}
            </p>
          </div>
        </div>

        {/* Standard Normal Video Control Bar */}
        <div
          className={`px-4 py-3.5 sm:px-5 border-t space-y-3 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          {/* Interactive Seek Slider with Chapter Markers */}
          <div className="relative h-5 flex items-center group">
            <div
              className={`w-full h-1.5 group-hover:h-2 rounded-full overflow-hidden relative transition-all ${
                isDark ? 'bg-slate-800' : 'bg-slate-300'
              }`}
            >
              <div
                className="h-full bg-teal-500 rounded-full transition-[width] duration-75"
                style={{ width: `${totalProgressPct}%` }}
              />
              {scenes.slice(1).map((_, idx) => (
                <div
                  key={idx}
                  style={{ left: `${(((idx + 1) * SCENE_DURATION_SEC) / TOTAL_DURATION_SEC) * 100}%` }}
                  className={`absolute top-0 bottom-0 w-0.5 ${isDark ? 'bg-slate-950/80' : 'bg-white/90'}`}
                />
              ))}
            </div>
            <input
              type="range"
              min={0}
              max={TOTAL_DURATION_SEC}
              step={0.1}
              value={elapsedSec}
              onChange={(e) => handleSeekTo(Number(e.target.value))}
              aria-label="Seek video timeline"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
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
                onClick={() => handleSkipBy(-10)}
                aria-label="Rewind 10 seconds"
                title="Rewind 10s"
                className={`px-2 py-2 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                <Rewind className="w-3.5 h-3.5" />
                <span>10s</span>
              </button>

              <button
                type="button"
                onClick={() => handleSkipBy(10)}
                aria-label="Forward 10 seconds"
                title="Forward 10s"
                className={`px-2 py-2 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                <span>10s</span>
                <FastForward className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleJumpToScene(activeSceneIndex - 1)}
                disabled={activeSceneIndex === 0}
                aria-label="Previous step"
                title="Previous step"
                className={`p-2 rounded-xl border disabled:opacity-40 transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleJumpToScene(activeSceneIndex + 1)}
                disabled={activeSceneIndex === scenes.length - 1}
                aria-label="Next step"
                title="Next step"
                className={`p-2 rounded-xl border disabled:opacity-40 transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleReplay}
                aria-label={localeBundle.replayBtn}
                title={localeBundle.replayBtn}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Time Readout moved down into bottom control bar */}
              <span
                className={`px-2.5 py-1.5 rounded-xl border font-mono text-xs font-bold tabular-nums whitespace-nowrap ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-100'
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                {formatClock(elapsedSec)} / {localeBundle.totalDurationLabel}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleCycleSpeed}
                title="Playback speed"
                className={`px-2.5 py-2 rounded-xl border font-mono text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-teal-300'
                    : 'bg-white hover:bg-slate-100 border-slate-300 text-teal-800'
                }`}
              >
                {playbackSpeed}x
              </button>

              <button
                type="button"
                onClick={handleToggleMute}
                title="Mute / Unmute"
                className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isMuted
                    ? isDark
                      ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                      : 'bg-rose-50 border-rose-300 text-rose-700'
                    : isDark
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-teal-200'
                    : 'bg-white hover:bg-slate-100 border-slate-300 text-teal-800'
                }`}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isMuted ? localeBundle.enableVoiceBtn : localeBundle.muteVoiceBtn}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleFullscreen}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                    : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
