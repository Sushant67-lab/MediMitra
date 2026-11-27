import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  FastForward,
  Globe,
  Maximize2,
  Minimize2,
  Pause,
  Pill,
  Play,
  Rewind,
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
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { DEMO_VIDEO_TRANSLATIONS } from '../data/demoVideoTranslations';
import {
  chunkSpeechSmoothly,
  estimateVoiceoverDurationSec,
  resolveBestVoice,
  videoAudioStudio
} from '../utils/videoAudioEngine';

interface AppDemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5] as const;

function formatClock(totalSeconds: number, maxDuration: number): string {
  const clamped = Math.max(0, Math.min(maxDuration, Math.floor(totalSeconds)));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const AppDemoVideoModal: React.FC<AppDemoVideoModalProps> = ({
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
  const [isVoiceCurrentlySpeaking, setIsVoiceCurrentlySpeaking] = useState(false);
  const [needsMobileAudioTap, setNeedsMobileAudioTap] = useState(false);

  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const lastSpokenKeyRef = useRef<string | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const activeUtterancesRef = useRef<SpeechSynthesisUtterance[]>([]);
  const speechSessionIdRef = useRef(0);
  const isVoiceSpeakingRef = useRef(false);
  const voiceHoldStartedAtRef = useRef<number | null>(null);
  const voiceFinishedAtRef = useRef<number | null>(null);
  const speechStartConfirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggeredCuesRef = useRef<Set<string>>(new Set());
  const playbackSpeedRef = useRef<number>(playbackSpeed);
  playbackSpeedRef.current = playbackSpeed;

  const localeBundle = DEMO_VIDEO_TRANSLATIONS[language] || DEMO_VIDEO_TRANSLATIONS.en;
  const scenes = localeBundle.scenes;

  // Dynamic per-scene natural durations based on narration length (zero padded dead silence)
  const sceneTimings = useMemo(() => {
    let cursor = 0;
    return scenes.map((sc) => {
      const dur = estimateVoiceoverDurationSec(sc.voiceover, language);
      const startSec = cursor;
      const endSec = cursor + dur;
      cursor = endSec;
      return { startSec, endSec, durationSec: dur };
    });
  }, [scenes, language]);

  const totalDurationSec = useMemo(
    () => (sceneTimings.length > 0 ? sceneTimings[sceneTimings.length - 1].endSec : 60),
    [sceneTimings]
  );

  const activeSceneIndex = useMemo(() => {
    for (let i = 0; i < sceneTimings.length; i++) {
      if (elapsedSec < sceneTimings[i].endSec - 0.001) {
        return i;
      }
    }
    return Math.max(0, scenes.length - 1);
  }, [elapsedSec, sceneTimings, scenes.length]);

  const activeTiming = sceneTimings[activeSceneIndex] || { startSec: 0, endSec: 12, durationSec: 12 };
  const activeScene = scenes[activeSceneIndex];
  const sceneElapsedSec = Math.max(0, elapsedSec - activeTiming.startSec);
  const sceneProgress = Math.min(1, sceneElapsedSec / Math.max(1, activeTiming.durationSec));
  const totalProgressPct = Math.min(100, Math.max(0, (elapsedSec / Math.max(1, totalDurationSec)) * 100));

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
    if (speechStartConfirmTimerRef.current) {
      clearTimeout(speechStartConfirmTimerRef.current);
      speechStartConfirmTimerRef.current = null;
    }
    isVoiceSpeakingRef.current = false;
    setIsVoiceCurrentlySpeaking(false);
    voiceHoldStartedAtRef.current = null;
    voiceFinishedAtRef.current = null;
    activeUtterancesRef.current = [];
    lastSpokenKeyRef.current = null;
    videoAudioStudio.setVoiceActive(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speakScene = useCallback(
    (sceneIdx: number, targetLang: LanguageCode, muted: boolean, speed = playbackSpeedRef.current) => {
      if (muted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        isVoiceSpeakingRef.current = false;
        setIsVoiceCurrentlySpeaking(false);
        voiceFinishedAtRef.current = null;
        videoAudioStudio.setVoiceActive(false);
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

      if (speechStartConfirmTimerRef.current) {
        clearTimeout(speechStartConfirmTimerRef.current);
        speechStartConfirmTimerRef.current = null;
      }
      synth.cancel();

      const chunks = chunkSpeechSmoothly(targetScene.voiceover, 155);
      if (chunks.length === 0) {
        isVoiceSpeakingRef.current = false;
        setIsVoiceCurrentlySpeaking(false);
        videoAudioStudio.setVoiceActive(false);
        return;
      }

      const availableVoices = synth.getVoices().length > 0 ? synth.getVoices() : voicesRef.current;
      const { voice, bcp47 } = resolveBestVoice(availableVoices, targetLang);

      lastSpokenKeyRef.current = key;
      isVoiceSpeakingRef.current = true;
      voiceHoldStartedAtRef.current = null;
      voiceFinishedAtRef.current = null;

      const baseRate = targetLang === 'en' || targetLang === 'hinglish' ? 1.03 : 1.0;
      const effectiveRate = Math.max(0.75, Math.min(1.65, baseRate * speed));

      let startedAtLeastOnce = false;
      const utterances: SpeechSynthesisUtterance[] = [];

      // If browser blocks un-gestured mobile speechSynthesis, gently offer tap-to-hear
      speechStartConfirmTimerRef.current = setTimeout(() => {
        if (speechSessionIdRef.current === sessionId && !startedAtLeastOnce) {
          isVoiceSpeakingRef.current = false;
          setIsVoiceCurrentlySpeaking(false);
          setNeedsMobileAudioTap(true);
          videoAudioStudio.setVoiceActive(false);
        }
      }, 1150);

      chunks.forEach((chunkText, idx) => {
        const utterance = new SpeechSynthesisUtterance(chunkText);
        utterance.lang = bcp47;
        if (voice) {
          utterance.voice = voice;
        }
        utterance.rate = effectiveRate;
        utterance.pitch = 1.0;
        utterance.volume = 1;

        utterance.onstart = () => {
          if (speechSessionIdRef.current !== sessionId) return;
          startedAtLeastOnce = true;
          setNeedsMobileAudioTap(false);
          setIsVoiceCurrentlySpeaking(true);
          videoAudioStudio.setVoiceActive(true);
          if (speechStartConfirmTimerRef.current) {
            clearTimeout(speechStartConfirmTimerRef.current);
            speechStartConfirmTimerRef.current = null;
          }
        };

        if (idx === chunks.length - 1) {
          const finishSceneVoice = () => {
            if (speechSessionIdRef.current !== sessionId) return;
            isVoiceSpeakingRef.current = false;
            setIsVoiceCurrentlySpeaking(false);
            voiceHoldStartedAtRef.current = null;
            voiceFinishedAtRef.current = performance.now();
            videoAudioStudio.setVoiceActive(false);
          };
          utterance.onend = finishSceneVoice;
          utterance.onerror = () => {
            if (speechSessionIdRef.current !== sessionId) return;
            isVoiceSpeakingRef.current = false;
            setIsVoiceCurrentlySpeaking(false);
            voiceHoldStartedAtRef.current = null;
            videoAudioStudio.setVoiceActive(false);
          };
        }

        utterances.push(utterance);
      });

      activeUtterancesRef.current = utterances;
      // Queue back-to-back directly into browser TTS queue for zero artificial pauses
      utterances.forEach((u) => synth.speak(u));
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
      triggeredCuesRef.current.clear();
      setElapsedSec(0);
      setIsPlaying(true);
      setNeedsMobileAudioTap(false);
      lastFrameTimeRef.current = null;
      lastSpokenKeyRef.current = null;
      videoAudioStudio.unlock();
      videoAudioStudio.setMuted(isMuted);
      if (!isMuted) {
        videoAudioStudio.startAmbient();
        videoAudioStudio.playCue('chapter');
      }
      speakScene(0, language, isMuted, playbackSpeedRef.current);
    } else {
      setIsPlaying(false);
      stopSpeech();
      videoAudioStudio.stopAmbient();
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      stopSpeech();
      videoAudioStudio.stopAmbient();
    };
  }, [stopSpeech]);

  // Keep Web Audio ambient pad synced with play/mute state
  useEffect(() => {
    videoAudioStudio.setMuted(isMuted);
    if (isOpen && isPlaying && !isMuted) {
      videoAudioStudio.startAmbient();
    } else {
      videoAudioStudio.stopAmbient();
    }
  }, [isOpen, isPlaying, isMuted]);

  const handleSeekTo = useCallback(
    (targetSec: number) => {
      const clamped = Math.max(0, Math.min(totalDurationSec, targetSec));
      let nextSceneIdx = Math.max(0, scenes.length - 1);
      for (let i = 0; i < sceneTimings.length; i++) {
        if (clamped < sceneTimings[i].endSec - 0.001) {
          nextSceneIdx = i;
          break;
        }
      }
      const prevSceneIdx = activeSceneIndex;
      setElapsedSec(clamped);
      if (nextSceneIdx !== prevSceneIdx) {
        triggeredCuesRef.current.clear();
        stopSpeech();
        if (isPlaying && !isMuted && clamped < totalDurationSec) {
          videoAudioStudio.unlock();
          videoAudioStudio.playCue('chapter');
          speakScene(nextSceneIdx, language, false, playbackSpeedRef.current);
        }
      }
      if (clamped >= totalDurationSec) {
        setIsPlaying(false);
        stopSpeech();
      }
    },
    [totalDurationSec, scenes.length, sceneTimings, activeSceneIndex, stopSpeech, isPlaying, isMuted, speakScene, language]
  );

  const handleSkipBy = useCallback(
    (deltaSec: number) => {
      videoAudioStudio.unlock();
      handleSeekTo(elapsedSec + deltaSec);
    },
    [elapsedSec, handleSeekTo]
  );

  const handleTogglePlay = useCallback(() => {
    videoAudioStudio.unlock();
    if (elapsedSec >= totalDurationSec) {
      triggeredCuesRef.current.clear();
      stopSpeech();
      setElapsedSec(0);
      setIsPlaying(true);
      if (!isMuted) {
        videoAudioStudio.startAmbient();
        videoAudioStudio.playCue('chapter');
      }
      speakScene(0, language, isMuted, playbackSpeedRef.current);
      return;
    }
    if (isPlaying) {
      setIsPlaying(false);
      stopSpeech();
    } else {
      setIsPlaying(true);
      setNeedsMobileAudioTap(false);
      lastSpokenKeyRef.current = null;
      if (!isMuted) {
        videoAudioStudio.startAmbient();
        videoAudioStudio.playCue('click');
      }
      speakScene(activeSceneIndex, language, isMuted, playbackSpeedRef.current);
    }
  }, [elapsedSec, totalDurationSec, stopSpeech, speakScene, language, isMuted, isPlaying, activeSceneIndex]);

  const handleTapEnableVoice = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      videoAudioStudio.unlock();
      setIsMuted(false);
      videoAudioStudio.setMuted(false);
      videoAudioStudio.startAmbient();
      setNeedsMobileAudioTap(false);
      lastSpokenKeyRef.current = null;
      speakScene(activeSceneIndex, language, false, playbackSpeedRef.current);
    },
    [activeSceneIndex, language, speakScene]
  );

  const handleToggleMute = useCallback(() => {
    videoAudioStudio.unlock();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoAudioStudio.setMuted(nextMuted);
    if (nextMuted) {
      stopSpeech();
      setNeedsMobileAudioTap(false);
    } else if (isPlaying) {
      videoAudioStudio.startAmbient();
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

  // Standard keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement | null)?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'SELECT' || targetTag === 'TEXTAREA') {
        if (e.key !== 'Escape') return;
      }
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
          return;
        }
        stopSpeech();
        videoAudioStudio.stopAmbient();
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

  // Smooth requestAnimationFrame timeline loop synced cleanly with natural voice pacing (ZERO long pauses)
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
          let currentIdx = sceneTimings.length - 1;
          for (let i = 0; i < sceneTimings.length; i++) {
            if (prev < sceneTimings[i].endSec - 0.001) {
              currentIdx = i;
              break;
            }
          }
          const timing = sceneTimings[currentIdx];
          if (!timing) return totalDurationSec;
          const sceneEndSec = timing.endSec;
          const next = prev + dtSec;

          // If voiceover finished naturally early, take a brief 0.45s breath then advance smoothly (no 8s dead air!)
          if (
            !isMuted &&
            !isVoiceSpeakingRef.current &&
            voiceFinishedAtRef.current !== null &&
            now - voiceFinishedAtRef.current >= 450 &&
            sceneEndSec - prev > 0.2
          ) {
            voiceFinishedAtRef.current = null;
            if (currentIdx >= sceneTimings.length - 1) {
              setIsPlaying(false);
              return totalDurationSec;
            }
            return sceneEndSec;
          }

          // If voiceover is still finishing the last sentence, hold gently so words never clip
          if (!isMuted && isVoiceSpeakingRef.current && next >= sceneEndSec - 0.06) {
            if (voiceHoldStartedAtRef.current === null) {
              voiceHoldStartedAtRef.current = now;
            }
            if (now - voiceHoldStartedAtRef.current < 7500) {
              return Math.min(prev, sceneEndSec - 0.06);
            }
            isVoiceSpeakingRef.current = false;
            voiceHoldStartedAtRef.current = null;
          } else {
            voiceHoldStartedAtRef.current = null;
          }

          if (next >= totalDurationSec) {
            setIsPlaying(false);
            return totalDurationSec;
          }
          return next;
        });
      }
      lastFrameTimeRef.current = now;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isOpen, isPlaying, isMuted, sceneTimings, totalDurationSec]);

  // Speak automatically + subtle chapter chime whenever chapter index advances during playback
  useEffect(() => {
    if (!isOpen || !isPlaying || isMuted) return;
    const key = `${activeSceneIndex}:${language}`;
    if (lastSpokenKeyRef.current !== key) {
      if (activeSceneIndex > 0) {
        videoAudioStudio.playCue('chapter');
      }
      speakScene(activeSceneIndex, language, isMuted, playbackSpeedRef.current);
    }
  }, [isOpen, isPlaying, isMuted, activeSceneIndex, language, speakScene]);

  // Trigger subtle synced UI & servo audio cues inside key animation moments
  useEffect(() => {
    if (!isOpen || !isPlaying || isMuted) return;
    const fireOnce = (cueKey: string, cueType: 'click' | 'success' | 'servo' | 'alert') => {
      if (!triggeredCuesRef.current.has(cueKey)) {
        triggeredCuesRef.current.add(cueKey);
        videoAudioStudio.playCue(cueType);
      }
    };

    if (activeSceneIndex === 3 && sceneProgress >= 0.38) {
      fireOnce('s3:online', 'success');
    } else if (activeSceneIndex === 5 && sceneProgress >= 0.22 && sceneProgress < 0.72) {
      fireOnce('s5:servo', 'servo');
    } else if (activeSceneIndex === 5 && sceneProgress >= 0.90) {
      fireOnce('s5:done', 'success');
    }
  }, [isOpen, isPlaying, isMuted, activeSceneIndex, sceneProgress]);

  const handleReplay = () => {
    videoAudioStudio.unlock();
    triggeredCuesRef.current.clear();
    stopSpeech();
    setElapsedSec(0);
    setIsPlaying(true);
    if (!isMuted) {
      videoAudioStudio.startAmbient();
      videoAudioStudio.playCue('chapter');
    }
    speakScene(0, language, isMuted, playbackSpeed);
  };

  const handleJumpToScene = (index: number) => {
    videoAudioStudio.unlock();
    const clampedIndex = Math.max(0, Math.min(scenes.length - 1, index));
    const targetTime = sceneTimings[clampedIndex]?.startSec ?? 0;
    triggeredCuesRef.current.clear();
    stopSpeech();
    setElapsedSec(targetTime);
    setIsPlaying(true);
    if (!isMuted) {
      videoAudioStudio.startAmbient();
      videoAudioStudio.playCue('chapter');
    }
    speakScene(clampedIndex, language, isMuted, playbackSpeed);
  };

  const handleCycleSpeed = () => {
    videoAudioStudio.unlock();
    const idx = PLAYBACK_SPEEDS.indexOf(playbackSpeed as (typeof PLAYBACK_SPEEDS)[number]);
    const nextSpeed = PLAYBACK_SPEEDS[(idx + 1) % PLAYBACK_SPEEDS.length];
    setPlaybackSpeed(nextSpeed);
    if (isPlaying && !isMuted) {
      stopSpeech();
      speakScene(activeSceneIndex, language, false, nextSpeed);
    }
  };

  const handleLanguageChange = (newLang: LanguageCode) => {
    videoAudioStudio.unlock();
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
      className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-1.5 sm:p-4 overflow-y-auto transition-colors ${
        isDark ? 'bg-slate-950/88' : 'bg-slate-900/60'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={localeBundle.modalTitle}
    >
      <div
        ref={playerContainerRef}
        className={`w-full ${
          isFullscreen
            ? 'max-w-none h-full rounded-none border-0'
            : 'max-w-5xl max-h-[96dvh] rounded-xl sm:rounded-2xl border my-auto'
        } shadow-2xl overflow-hidden flex flex-col transition-colors ${
          isDark
            ? 'bg-slate-900 border-slate-700/80 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Modal Header (Mobile-First Clean Single Row) */}
        <div
          className={`px-3 py-2.5 sm:px-5 sm:py-3 border-b flex items-center justify-between gap-2 shrink-0 ${
            isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                isDark ? 'bg-teal-500/15 border-teal-400/30' : 'bg-teal-50 border-teal-200'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isDark ? 'text-teal-300' : 'text-teal-700'}`} />
            </div>
            <div className="min-w-0">
              <h2 className={`text-xs sm:text-base font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {localeBundle.modalTitle}
              </h2>
              <p className={`hidden sm:block text-[11px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {localeBundle.voiceFallbackNotice}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <ThemeToggle variant="video" showLabel />

            <label
              className={`flex items-center gap-1 sm:gap-1.5 border rounded-xl px-2 py-1.5 text-xs ${
                isDark
                  ? 'bg-slate-800/90 border-slate-700 text-slate-200'
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <Globe className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
                aria-label={localeBundle.voiceLanguageLabel}
                className={`bg-transparent font-semibold text-xs focus:outline-none cursor-pointer max-w-[82px] sm:max-w-none ${
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
                videoAudioStudio.stopAmbient();
                onClose();
              }}
              aria-label={localeBundle.closeBtn}
              className={`min-w-[36px] min-h-[36px] p-1.5 sm:p-2 rounded-xl border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Animated Video Stage (Responsive Mobile-First Height, Zero Clipping) */}
        <div
          onClick={handleTogglePlay}
          title={isPlaying ? localeBundle.pauseBtn : localeBundle.playBtn}
          className={`relative w-full ${
            isFullscreen
              ? 'flex-1 min-h-0'
              : 'min-h-[305px] sm:min-h-[375px] sm:aspect-video'
          } overflow-y-auto sm:overflow-hidden select-none cursor-pointer transition-colors ${
            isDark
              ? 'bg-gradient-to-br from-slate-950 via-teal-950/50 to-slate-950'
              : 'bg-gradient-to-br from-slate-50 via-teal-50/75 to-white'
          }`}
        >
          {/* Subtle architectural blueprint grid */}
          <svg
            className={`absolute inset-0 w-full h-full pointer-events-none ${isDark ? 'opacity-20' : 'opacity-45'}`}
            viewBox="0 0 800 450"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern id="demoGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke={isDark ? '#14b8a6' : '#99f6e4'}
                  strokeWidth="0.7"
                  strokeOpacity={isDark ? '0.35' : '0.65'}
                />
              </pattern>
            </defs>
            <rect width="800" height="450" fill="url(#demoGrid)" />
          </svg>

          {/* Top Chapter HUD & Sound Wave Badge */}
          <div className="relative sm:absolute sm:top-3 sm:left-3 sm:right-3 z-20 px-3 pt-2.5 sm:px-0 sm:pt-0 flex items-center justify-between gap-2 pointer-events-none">
            <div
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border backdrop-blur-sm flex items-center gap-2 min-w-0 ${
                isDark
                  ? 'bg-slate-950/85 border-teal-500/35'
                  : 'bg-white/95 border-teal-300/80 shadow-xs'
              }`}
            >
              <span
                className={`text-[11px] font-mono font-bold tabular-nums shrink-0 ${
                  isDark ? 'text-teal-300' : 'text-teal-700'
                }`}
              >
                0{activeSceneIndex + 1}/0{scenes.length}
              </span>
              <span className={`text-[11px] sm:text-xs font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {activeScene.chapterTitle}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isPlaying && !isMuted && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-semibold ${
                    isDark
                      ? 'bg-slate-950/85 border-emerald-500/35 text-emerald-300'
                      : 'bg-white/95 border-emerald-300 text-emerald-700 shadow-xs'
                  }`}
                >
                  <Volume2 className="w-3 h-3" />
                  <span className="hidden sm:inline">{isVoiceCurrentlySpeaking ? 'Speaking' : 'Ambient'}</span>
                </span>
              )}
              <span
                className={`hidden sm:inline-flex px-2.5 py-1 rounded-lg border text-[11px] font-medium shrink-0 ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-700 text-teal-200'
                    : 'bg-white/90 border-slate-300 text-teal-800 shadow-xs'
                }`}
              >
                {currentLangOption.nativeName}
              </span>
            </div>
          </div>

          {/* Animated Scene Canvas (Cleanly Centered, Zero Subtitle Overlap) */}
          <div className="relative z-10 w-full sm:h-full pt-2.5 pb-4 sm:pt-12 sm:pb-5 px-3 sm:px-8 flex items-center justify-center">
            {/* SCENE 1: PATIENT ONBOARDING */}
            {activeSceneIndex === 0 && (
              <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-4 items-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`sm:col-span-7 rounded-2xl p-3.5 sm:p-5 shadow-xl border ${
                    isDark
                      ? 'bg-slate-900/95 border-teal-700/60 text-slate-100'
                      : 'bg-white/95 border-teal-200 text-slate-900'
                  }`}
                >
                  <div
                    className={`flex items-center justify-between border-b pb-2 mb-2.5 ${
                      isDark ? 'border-slate-800' : 'border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-teal-700 flex items-center justify-center text-white text-xs font-bold">
                        M
                      </div>
                      <span className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        MediMitra Intake
                      </span>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                      className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 ${
                        isDark
                          ? 'bg-teal-950/80 border-teal-600 text-teal-200'
                          : 'bg-teal-50 border-teal-300 text-teal-800'
                      }`}
                    >
                      <Globe className="w-3 h-3" />
                      <span>{currentLangOption.nativeName}</span>
                    </motion.div>
                  </div>

                  {/* Simulated Name Field */}
                  <div className="mb-2.5">
                    <div className={`text-[10px] font-semibold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Patient Name
                    </div>
                    <div
                      className={`px-3 py-1.5 sm:py-2 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                        isDark
                          ? 'border-teal-500 bg-teal-950/40 text-slate-100'
                          : 'border-teal-500 bg-teal-50/40 text-slate-800'
                      }`}
                    >
                      <span>Meera Sharma</span>
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.9, repeat: Infinity }}
                        className="w-0.5 h-3.5 bg-teal-500"
                      />
                    </div>
                  </div>

                  {/* Age group selector */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-2.5">
                    {[
                      { label: 'Child', sub: 'Under 12', active: sceneProgress < 0.35 },
                      { label: 'Adult', sub: '12 - 59', active: sceneProgress >= 0.35 },
                      { label: 'Senior', sub: '60+', active: false }
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`p-1.5 sm:p-2 rounded-xl border text-center transition-colors ${
                          item.active
                            ? isDark
                              ? 'bg-teal-950/70 border-teal-400 ring-1 ring-teal-400'
                              : 'bg-teal-50 border-teal-600 ring-1 ring-teal-600'
                            : isDark
                            ? 'bg-slate-800/70 border-slate-700'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className={`text-[11px] sm:text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.label}</div>
                        <div className={`text-[9px] sm:text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Gender selector */}
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    <div
                      className={`p-1.5 sm:p-2 rounded-xl border text-center ${
                        sceneProgress >= 0.5
                          ? 'bg-teal-600 text-white border-teal-600'
                          : isDark
                          ? 'bg-slate-800 text-slate-300 border-slate-700'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="text-[11px] sm:text-xs font-bold">Female</span>
                    </div>
                    <div
                      className={`p-1.5 sm:p-2 rounded-xl border text-center ${
                        isDark
                          ? 'bg-slate-800 text-slate-300 border-slate-700'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="text-[11px] sm:text-xs font-bold">Male</span>
                    </div>
                  </div>
                </motion.div>

                {/* Right Highlights Stack (Visible on both mobile & desktop!) */}
                <div className="sm:col-span-5 grid grid-cols-1 gap-1.5 sm:gap-2.5">
                  {activeScene.highlights.map((item, idx) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.15 }}
                      className={`p-2 sm:p-3 rounded-xl border flex items-center gap-2 ${
                        isDark
                          ? 'bg-slate-900/90 border-teal-500/30'
                          : 'bg-white/95 border-teal-200 shadow-xs'
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      <span className={`text-[11px] sm:text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{item}</span>
                    </motion.div>
                  ))}
                  <div
                    className={`hidden sm:block p-3 rounded-xl border text-[11px] ${
                      isDark
                        ? 'bg-teal-900/40 border-teal-500/30 text-teal-100'
                        : 'bg-teal-50 border-teal-200 text-teal-900 font-medium'
                    }`}
                  >
                    English · हिन्दी · Hinglish · मराठी · বাংলা · தமிழ் · తెలుగు · ગુજરાતી
                  </div>
                </div>
              </div>
            )}

            {/* SCENE 2: SYMPTOMS & SMART ADAPTIVE Q&A */}
            {activeSceneIndex === 1 && (
              <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-4 items-center">
                {/* 4 Patient Flows (2x2 on mobile so nothing clips, vertical stack on desktop) */}
                <div className="sm:col-span-5 grid grid-cols-2 sm:grid-cols-1 gap-1.5 sm:gap-2">
                  {[
                    { group: 'Male (Adult / Senior)', tag: 'Standard Clinical Flow', active: sceneProgress < 0.25 },
                    { group: 'Female (Adult / Senior)', tag: 'Allergy & Dose Safety', active: sceneProgress >= 0.25 && sceneProgress < 0.55 },
                    { group: 'Male-Child (Boy)', tag: 'Pediatric Boy Care', active: sceneProgress >= 0.55 && sceneProgress < 0.78 },
                    { group: 'Female-Child (Girl)', tag: 'Pediatric Girl Care', active: sceneProgress >= 0.78 }
                  ].map((row) => (
                    <div
                      key={row.group}
                      className={`p-2 sm:p-2.5 rounded-xl border transition-all ${
                        row.active
                          ? isDark
                            ? 'bg-teal-500/20 border-teal-400 shadow-md'
                            : 'bg-teal-600 text-white border-teal-700 shadow-sm'
                          : isDark
                          ? 'bg-slate-900/75 border-slate-700/80 opacity-80'
                          : 'bg-white/90 border-slate-200 opacity-90'
                      }`}
                    >
                      <div
                        className={`text-[11px] sm:text-xs font-bold flex items-center justify-between gap-1 ${
                          row.active || isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        <span className="truncate">{row.group}</span>
                        {row.active && (
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-200'}`} />
                        )}
                      </div>
                      <div
                        className={`text-[10px] mt-0.5 truncate ${
                          row.active
                            ? isDark
                              ? 'text-teal-200'
                              : 'text-teal-50'
                            : isDark
                            ? 'text-teal-200'
                            : 'text-slate-500'
                        }`}
                      >
                        {row.tag}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live Adaptive Question Card */}
                <div
                  className={`sm:col-span-7 rounded-2xl p-3.5 sm:p-5 shadow-xl border ${
                    isDark
                      ? 'bg-slate-900/95 text-slate-100 border-slate-700'
                      : 'bg-white text-slate-900 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border text-[10px] sm:text-[11px] font-bold ${
                        isDark
                          ? 'bg-teal-950 border-teal-700 text-teal-200'
                          : 'bg-teal-50 border-teal-200 text-teal-800'
                      }`}
                    >
                      Symptom: {sceneProgress < 0.5 ? 'Fever / Headache' : 'Stomach Upset'}
                    </span>
                    <span className={`font-mono text-[11px] sm:text-xs font-bold tabular-nums ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Step {Math.min(10, Math.max(1, Math.ceil(sceneProgress * 10)))} / 10
                    </span>
                  </div>

                  <div
                    className={`p-2.5 sm:p-3 rounded-xl border mb-2.5 ${
                      isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <p className={`text-xs sm:text-sm font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {sceneProgress >= 0.25 && sceneProgress < 0.55
                        ? 'Allergy & History Check: Do you have any known medicine allergies or gastric sensitivity?'
                        : sceneProgress >= 0.55
                        ? 'Pediatric Hydration Check: Is the child drinking fluids normally today?'
                        : 'Severity Check: How long has the fever stayed above 100.4°F?'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className={`p-2 rounded-lg border text-[11px] sm:text-xs font-bold text-center ${
                        isDark
                          ? 'border-teal-500 bg-teal-950/60 text-teal-200'
                          : 'border-teal-600 bg-teal-50 text-teal-900'
                      }`}
                    >
                      Yes — Adjust Safe Dose
                    </div>
                    <div
                      className={`p-2 rounded-lg border text-[11px] sm:text-xs font-semibold text-center ${
                        isDark
                          ? 'border-slate-700 bg-slate-800 text-slate-200'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      No — Standard Care
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SCENE 3: CLINICAL ENGINE & RECOMMENDATION */}
            {activeSceneIndex === 2 && (
              <div className="w-full max-w-3xl flex flex-col gap-2.5 sm:gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
                  {[
                    { icon: Activity, title: 'Severity & Red Flags', desc: 'Breathing, chest pain, high temp' },
                    { icon: ShieldCheck, title: 'Age & Allergy Safety', desc: 'Child-dose & allergy filter' },
                    { icon: Stethoscope, title: 'Triage Output', desc: 'Safe OTC or Doctor referral' }
                  ].map((node, i) => (
                    <motion.div
                      key={node.title}
                      animate={{
                        borderColor:
                          Math.floor(sceneProgress * 3) === i
                            ? '#14b8a6'
                            : isDark
                            ? 'rgba(51,65,85,0.8)'
                            : 'rgba(203,213,225,1)'
                      }}
                      className={`p-2.5 sm:p-3 rounded-xl border shadow-xs flex sm:block items-center gap-2.5 ${
                        isDark
                          ? 'bg-slate-900/90 border-slate-700 text-white'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <node.icon className={`w-4 h-4 sm:w-5 sm:h-5 sm:mb-1.5 shrink-0 ${isDark ? 'text-teal-300' : 'text-teal-600'}`} />
                      <div className="min-w-0">
                        <div className="text-xs font-bold leading-tight">{node.title}</div>
                        <div className={`text-[10px] mt-0.5 leading-snug ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{node.desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Split Outcome: Safe OTC vs Urgent Doctor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div
                    className={`p-3 sm:p-3.5 rounded-2xl border ${
                      isDark
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-white'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
                        <Pill className="w-4 h-4 shrink-0" />
                        Mild Case → Safe OTC Care
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                          isDark ? 'bg-emerald-500/20 text-emerald-200' : 'bg-emerald-200/80 text-emerald-900'
                        }`}
                      >
                        ESP32 READY
                      </span>
                    </div>
                    <p className={`text-[11px] leading-snug ${isDark ? 'text-emerald-100/90' : 'text-emerald-900'}`}>
                      Calibrated medicine suggestion + hydration & dosage timing with one-tap Dispense button.
                    </p>
                  </div>

                  <div
                    className={`p-3 sm:p-3.5 rounded-2xl border ${
                      isDark
                        ? 'bg-rose-950/55 border-rose-500/50 text-white'
                        : 'bg-rose-50 border-rose-300 text-rose-950 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-rose-300' : 'text-rose-800'}`}>
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        Red Flag → Nearby Doctor
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                          isDark ? 'bg-rose-500/20 text-rose-200' : 'bg-rose-200/80 text-rose-900'
                        }`}
                      >
                        URGENT CARE
                      </span>
                    </div>
                    <p className={`text-[11px] leading-snug ${isDark ? 'text-rose-100/90' : 'text-rose-900'}`}>
                      Blocks unsafe self-medication and opens nearby clinic / emergency doctor contact immediately.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SCENE 4: CLOUD SYNC & TOP-RIGHT ONLINE/OFFLINE BADGE */}
            {activeSceneIndex === 3 && (
              <div className="w-full max-w-3xl flex flex-col gap-3 sm:gap-4">
                <div
                  className={`rounded-2xl p-3 sm:p-4 border shadow-xl flex items-center justify-between gap-2 ${
                    isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      M
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        MediMitra Header (Top-Right Live Status)
                      </div>
                      <div className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        10s REST Heartbeat + Clock Calibration
                      </div>
                    </div>
                  </div>

                  {sceneProgress < 0.38 ? (
                    <div className="px-2.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 shrink-0">
                      <WifiOff className="w-3.5 h-3.5" />
                      <span>Offline</span>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-700 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 shadow-sm shrink-0"
                    >
                      <Wifi className="w-3.5 h-3.5" />
                      <span>Online · 192.168.43.84</span>
                    </motion.div>
                  )}
                </div>

                {/* Data flow SVG diagram */}
                <div
                  className={`border rounded-2xl p-3 sm:p-4 ${
                    isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-slate-900 border-slate-300 shadow-lg'
                  }`}
                >
                  <svg viewBox="0 0 680 110" className="w-full h-20 sm:h-24">
                    <line x1="120" y1="55" x2="310" y2="55" stroke="#14b8a6" strokeWidth="3" strokeDasharray="6 6" />
                    <line x1="370" y1="55" x2="560" y2="55" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 6" />

                    <motion.circle
                      r="7"
                      cy="55"
                      fill="#2dd4bf"
                      animate={{ cx: [130, 300] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.circle
                      r="7"
                      cy="55"
                      fill="#38bdf8"
                      animate={{ cx: [380, 550] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'linear', delay: 0.5 }}
                    />

                    <rect x="12" y="20" width="112" height="70" rx="12" fill="#0f172a" stroke="#14b8a6" strokeWidth="2" />
                    <text x="68" y="50" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">Web App</text>
                    <text x="68" y="68" textAnchor="middle" fill="#99f6e4" fontSize="10">Dispense Click</text>

                    <rect x="284" y="20" width="112" height="70" rx="12" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
                    <text x="340" y="50" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">Cloud Sync</text>
                    <text x="340" y="68" textAnchor="middle" fill="#6ee7b7" fontSize="10">Queue: PENDING</text>

                    <rect x="556" y="20" width="112" height="70" rx="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                    <text x="612" y="50" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">2.4 GHz Wi-Fi</text>
                    <text x="612" y="68" textAnchor="middle" fill="#7dd3fc" fontSize="10">Hotspot / Router</text>
                  </svg>
                </div>
              </div>
            )}

            {/* SCENE 5: INSIDE THE ESP32 HARDWARE MODULE */}
            {activeSceneIndex === 4 && (
              <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                {/* Hardware Wiring SVG */}
                <div className="sm:col-span-7 bg-slate-900 border border-slate-700 rounded-2xl p-2.5 sm:p-3 shadow-lg">
                  <svg viewBox="0 0 420 205" className="w-full h-auto max-h-[180px] sm:max-h-[210px]">
                    <rect x="12" y="16" width="108" height="62" rx="10" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                    <text x="66" y="40" textAnchor="middle" fill="#fcd34d" fontSize="11" fontWeight="bold">External 5V 2A</text>
                    <text x="66" y="56" textAnchor="middle" fill="#cbd5e1" fontSize="9">Dedicated Power</text>

                    <rect x="150" y="16" width="122" height="114" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                    <text x="211" y="38" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">ESP32 DevKit V1</text>
                    <text x="211" y="54" textAnchor="middle" fill="#7dd3fc" fontSize="9">2.4 GHz Wi-Fi • 2.5s Poll</text>
                    <rect x="166" y="66" width="90" height="20" rx="5" fill="#1e293b" stroke="#f97316" strokeWidth="1.2" />
                    <text x="211" y="79" textAnchor="middle" fill="#fdba74" fontSize="9" fontWeight="bold">GPIO 18 (0V Boot Lock)</text>

                    <motion.circle
                      cx="248"
                      cy="108"
                      r="7"
                      fill="#3b82f6"
                      animate={{ opacity: [0.25, 1, 0.25] }}
                      transition={{ duration: 0.9, repeat: Infinity }}
                    />
                    <text x="200" y="112" textAnchor="middle" fill="#93c5fd" fontSize="9" fontWeight="bold">GPIO 2 Blue LED</text>

                    <rect x="302" y="16" width="104" height="72" rx="10" fill="#1e293b" stroke="#14b8a6" strokeWidth="2" />
                    <text x="354" y="40" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">SG90 Servo</text>
                    <text x="354" y="56" textAnchor="middle" fill="#99f6e4" fontSize="9">25° Medicine Gate</text>

                    <path d="M 256 76 L 284 76 L 284 52 L 302 52" fill="none" stroke="#f97316" strokeWidth="2.5" />
                    <path d="M 120 34 L 138 34 L 138 8 L 354 8 L 354 16" fill="none" stroke="#ef4444" strokeWidth="2.5" />
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
                <div
                  className={`sm:col-span-5 border rounded-2xl p-3 space-y-1.5 ${
                    isDark
                      ? 'bg-slate-900/95 border-blue-500/35 text-white'
                      : 'bg-white border-blue-200 text-slate-900 shadow-lg'
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 text-xs font-bold border-b pb-1.5 ${
                      isDark ? 'text-blue-300 border-slate-800' : 'text-blue-700 border-slate-100'
                    }`}
                  >
                    <Cpu className="w-4 h-4" />
                    <span>Blue LED Signal Guide</span>
                  </div>
                  {[
                    { code: '0.25s Fast', desc: 'Connecting to Wi-Fi / Hotspot' },
                    { code: 'LED OFF', desc: 'Linked Online with App' },
                    { code: '0.45s', desc: 'Setup Portal 192.168.4.1' },
                    { code: '1.2s Slow', desc: '1 Slow Blink After Dispense' }
                  ].map((led) => (
                    <div
                      key={led.code}
                      className={`flex items-center justify-between text-[11px] px-2.5 py-1 rounded-lg ${
                        isDark ? 'bg-slate-800/70' : 'bg-slate-50 border border-slate-200'
                      }`}
                    >
                      <span className={`font-mono font-bold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>{led.code}</span>
                      <span className={`truncate ml-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{led.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCENE 6: LIVE DISPENSE & CONFIRMATION */}
            {activeSceneIndex === 5 && (
              <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center">
                <div className="sm:col-span-7 bg-slate-900 border border-teal-500/40 rounded-2xl p-3 sm:p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                      <Zap className="w-4 h-4" />
                      SG90 Actuator Motion
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-extrabold text-amber-300 tabular-nums">
                      Angle: {String(servoAngle).padStart(2, '0')}°
                    </span>
                  </div>

                  <svg viewBox="0 0 380 175" className="w-full h-32 sm:h-40">
                    <rect x="34" y="46" width="110" height="66" rx="10" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                    <text x="89" y="75" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">SG90 SERVO</text>
                    <text x="89" y="92" textAnchor="middle" fill="#7dd3fc" fontSize="9">GPIO 18 PWM</text>

                    <circle cx="136" cy="60" r="10" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2" />
                    <g transform={`rotate(${servoAngle} 136 60)`}>
                      <rect x="132" y="54" width="76" height="12" rx="6" fill="#f59e0b" stroke="#fef3c7" strokeWidth="1.5" />
                      <circle cx="200" cy="60" r="3" fill="#0f172a" />
                    </g>

                    <rect x="242" y="20" width="96" height="24" rx="6" fill="#0f172a" stroke="#14b8a6" strokeWidth="1.5" />
                    <text x="290" y="36" textAnchor="middle" fill="#99f6e4" fontSize="10" fontWeight="bold">Medicine Slot</text>

                    <g transform={`translate(0, ${sceneProgress >= 0.35 ? Math.min(82, (sceneProgress - 0.35) * 240) : 0})`}>
                      <rect x="276" y="48" width="28" height="14" rx="7" fill="#34d399" stroke="#ecfdf5" strokeWidth="1.5" />
                    </g>

                    <path d="M 234 134 L 246 156 L 334 156 L 346 134" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                    <text x="290" y="168" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="bold">Collection Tray</text>
                  </svg>
                </div>

                <div className="sm:col-span-5 grid grid-cols-2 sm:grid-cols-1 gap-2.5 sm:gap-3">
                  <div
                    className={`p-3 sm:p-3.5 rounded-2xl border ${
                      isDark
                        ? 'bg-slate-900/95 border-blue-500/40 text-white'
                        : 'bg-white border-blue-200 text-slate-900 shadow-lg'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[11px] sm:text-xs font-bold ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>GPIO 2 LED</span>
                      <span
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border transition-all duration-500 shrink-0 ${
                          slowBlueLedActive
                            ? 'bg-blue-400 border-blue-200 shadow-[0_0_18px_rgba(96,165,250,0.95)]'
                            : isDark
                            ? 'bg-slate-800 border-slate-600'
                            : 'bg-slate-200 border-slate-300'
                        }`}
                      />
                    </div>
                    <p className={`text-[10px] sm:text-[11px] mt-1 leading-snug ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {slowBlueLedActive
                        ? 'Slow 1.2s Blue Blink ON — Confirmed!'
                        : 'Waits for 45° cycle before confirmation blink.'}
                    </p>
                  </div>

                  <div
                    className={`p-3 sm:p-3.5 rounded-2xl border shadow-lg ${
                      isDark
                        ? 'bg-slate-900 text-slate-100 border-slate-700'
                        : 'bg-white text-slate-900 border-slate-200'
                    }`}
                  >
                    <div className={`text-[10px] font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Screen Status
                    </div>
                    <div
                      className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl font-mono text-[11px] sm:text-xs font-extrabold flex items-center justify-between ${
                        dispenseStatusLabel === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : dispenseStatusLabel === 'PROCESSING'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      <span className="truncate">{dispenseStatusLabel}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dedicated Non-Overlapping Synchronized Caption Strip */}
        <div
          className={`px-3.5 py-2.5 sm:px-6 sm:py-3 border-t flex items-center justify-center gap-3 shrink-0 ${
            isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <p
            className={`text-center text-xs sm:text-sm font-medium max-w-3xl leading-relaxed ${
              isDark ? 'text-slate-100' : 'text-slate-800'
            }`}
          >
            {activeScene.subtitle}
          </p>
          {needsMobileAudioTap && !isMuted && (
            <button
              type="button"
              onClick={handleTapEnableVoice}
              className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Tap for Voice</span>
            </button>
          )}
        </div>

        {/* Standard Normal Video Control Bar (Mobile Touch Optimized) */}
        <div
          className={`px-3 py-2.5 sm:px-5 sm:py-3.5 border-t space-y-2.5 shrink-0 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          {/* Interactive Scrubber / Seek Timeline with Chapter Markers */}
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
              {sceneTimings.slice(1).map((t, idx) => (
                <div
                  key={idx}
                  style={{ left: `${(t.startSec / Math.max(1, totalDurationSec)) * 100}%` }}
                  className={`absolute top-0 bottom-0 w-0.5 ${isDark ? 'bg-slate-950/80' : 'bg-white/90'}`}
                />
              ))}
            </div>
            <input
              type="range"
              min={0}
              max={totalDurationSec}
              step={0.1}
              value={elapsedSec}
              onChange={(e) => handleSeekTo(Number(e.target.value))}
              aria-label="Seek video timeline"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
          </div>

          {/* Standard Transport & Utility Row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Left Transport Controls + Time Clock */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="min-h-[38px] px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>
                  {elapsedSec >= totalDurationSec
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
                title="Rewind 10s (Left Arrow)"
                className={`min-h-[38px] px-2 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
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
                title="Forward 10s (Right Arrow)"
                className={`min-h-[38px] px-2 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
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
                aria-label="Previous chapter"
                title="Previous chapter"
                className={`min-h-[38px] min-w-[36px] p-1.5 rounded-xl border disabled:opacity-40 flex items-center justify-center transition-colors cursor-pointer ${
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
                aria-label="Next chapter"
                title="Next chapter"
                className={`min-h-[38px] min-w-[36px] p-1.5 rounded-xl border disabled:opacity-40 flex items-center justify-center transition-colors cursor-pointer ${
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
                className={`hidden sm:flex min-h-[38px] min-w-[36px] p-1.5 rounded-xl border items-center justify-center transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Time Readout */}
              <span
                className={`min-h-[38px] px-2.5 py-1.5 rounded-xl border font-mono text-[11px] sm:text-xs font-bold tabular-nums whitespace-nowrap flex items-center ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-100'
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                {formatClock(elapsedSec, totalDurationSec)} / {formatClock(totalDurationSec, totalDurationSec)}
              </span>
            </div>

            {/* Right Controls: Speed + Mute + Fullscreen */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={handleCycleSpeed}
                title="Playback speed"
                className={`min-h-[38px] px-2.5 py-1.5 rounded-xl border font-mono text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
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
                title="Mute / Unmute (M)"
                className={`min-h-[38px] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
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
                <span className="hidden sm:inline">{isMuted ? localeBundle.enableVoiceBtn : localeBundle.muteVoiceBtn}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleFullscreen}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
                className={`min-h-[38px] min-w-[38px] p-1.5 rounded-xl border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
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
