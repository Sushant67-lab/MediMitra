import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  ShieldAlert, 
  Stethoscope,
  Info
} from 'lucide-react';
import { 
  SymptomCategory, 
  UserProfile, 
  ChatMessage, 
  TriageAssessment,
  QuestionContext 
} from '../types/medical';
import { 
  getAdaptiveQuestion, 
  evaluateTriage, 
  getLocalizedSymptomName 
} from '../data/medicalKnowledge';
import { 
  QUESTION_TRANSLATIONS, 
  QuestionId, 
  TRIAGE_UI_STRINGS 
} from '../data/triageTranslations';
import { useLanguage } from '../context/LanguageContext';
import { getAppStrings } from '../data/appTranslations';

interface TriageChatbotProps {
  currentProfile: UserProfile;
  symptom: SymptomCategory;
  initialFeeling?: string;
  userCustomNote?: string;
  onBack: () => void;
  onCompleteAssessment: (assessment: TriageAssessment) => void;
  onDirectDoctorReferral: () => void;
}

export const TriageChatbot: React.FC<TriageChatbotProps> = ({
  currentProfile,
  symptom,
  initialFeeling,
  userCustomNote,
  onCompleteAssessment,
  onDirectDoctorReferral
}) => {
  const { t, language } = useLanguage();
  const appUi = getAppStrings(language);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answerIndices, setAnswerIndices] = useState<Record<string, number>>({});
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [customInput, setCustomInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [hasTriggeredRedFlag, setHasTriggeredRedFlag] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const questionPanelRef = useRef<HTMLDivElement>(null);

  const ui = TRIAGE_UI_STRINGS[language] || TRIAGE_UI_STRINGS.en;
  const localizedSymptomName = getLocalizedSymptomName(symptom, language);
  const displayPatientName = currentProfile.name?.trim() || appUi.patientWord;

  const questionContext: QuestionContext = {
    ageCategory: currentProfile.ageCategory,
    age: currentProfile.age,
    sex: currentProfile.sex,
    isPregnantOrNursing: currentProfile.isPregnantOrNursing,
    symptom,
    answers,
    answerIndices
  };

  const currentQuestionData = getAdaptiveQuestion(currentStep, questionContext, language);

  // Initialize intake session on mount or symptom change
  useEffect(() => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const welcomeMessages: ChatMessage[] = [
      {
        id: 'msg-welcome-1',
        sender: 'bot',
        metaType: 'welcome',
        text: `${t.chatWelcome} (${localizedSymptomName})`,
        timestamp: nowTime,
        badge: ui.checkupBadge
      }
    ];

    if (userCustomNote) {
      welcomeMessages.push({
        id: 'msg-user-note',
        sender: 'user',
        text: userCustomNote,
        timestamp: nowTime
      });
      welcomeMessages.push({
        id: 'msg-ack-note',
        sender: 'bot',
        metaType: 'ack_note',
        text: ui.noteAck,
        timestamp: nowTime
      });
    } else if (initialFeeling) {
      welcomeMessages.push({
        id: 'msg-user-feeling',
        sender: 'user',
        metaType: 'feeling',
        text: `${ui.feelingPrefix} ${initialFeeling}`,
        timestamp: nowTime
      });
    }

    // Add first question
    const q1 = getAdaptiveQuestion(1, questionContext, language);
    if (q1) {
      welcomeMessages.push({
        id: `msg-q-1`,
        sender: 'bot',
        metaType: 'question',
        stepNumber: 1,
        text: q1.question,
        questionId: q1.id,
        options: q1.options,
        badge: q1.badge,
        timestamp: nowTime
      });
    }

    setChatHistory(welcomeMessages);
  }, [symptom]);

  // Scroll chat container internally when new messages arrive
  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [chatHistory, isTyping, language]);

  // Automatically scroll the page smoothly to the active question card when it appears or advances
  useEffect(() => {
    if (isTyping || !currentQuestionData) return;
    const timer = window.setTimeout(() => {
      const panel = questionPanelRef.current;
      if (!panel) return;
      const rect = panel.getBoundingClientRect();
      const headerOffset = 76;
      const isFullyVisible = rect.top >= headerOffset && rect.bottom <= window.innerHeight - 8;
      if (!isFullyVisible) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
    return () => window.clearTimeout(timer);
  }, [currentStep, isTyping, symptom, currentQuestionData?.id]);

  const handleSelectOption = (option: string, optionIndex?: number) => {
    if (!currentQuestionData) return;

    const qId = currentQuestionData.id;

    // Language-independent red flag detection (index-based + text fallback)
    const isRedFlagByIndex =
      typeof optionIndex === 'number' &&
      ((qId === 'q6_red_flags' && optionIndex > 0) ||
        (qId === 'q5_headache_type' && optionIndex === 3) ||
        (qId === 'q5_rash_appearance' && optionIndex === 4) ||
        (qId === 'q5_cut_characteristics' && optionIndex === 4));

    const isRedFlagByText =
      option.includes('breathing') ||
      option.includes('Stiff neck') ||
      option.includes('thunderclap') ||
      option.includes('fluids down') ||
      option.includes('Purple spots') ||
      option.includes('Active bleeding');

    const isRedFlag = isRedFlagByIndex || isRedFlagByText;

    if (isRedFlag) {
      setHasTriggeredRedFlag(true);
    }

    const updatedAnswers = {
      ...answers,
      [qId]: option
    };
    setAnswers(updatedAnswers);

    const updatedIndices =
      typeof optionIndex === 'number'
        ? { ...answerIndices, [qId]: optionIndex }
        : answerIndices;
    if (typeof optionIndex === 'number') {
      setAnswerIndices(updatedIndices);
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: option,
      questionId: qId,
      selectedOptionIndex: optionIndex,
      timestamp: nowTime
    };

    setChatHistory(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate clinical reasoning pause
    setTimeout(() => {
      const nextStep = currentStep + 1;
      const updatedCtx: QuestionContext = {
        ...questionContext,
        answers: updatedAnswers,
        answerIndices: updatedIndices
      };

      const nextQuestion = getAdaptiveQuestion(nextStep, updatedCtx, language);

      if (nextQuestion) {
        let botAck = '';
        if (currentStep === 1) {
          botAck = ui.ackStep1(option);
        } else if (currentStep === 2) {
          botAck = ui.ackStep2(option);
        } else if (currentStep === 5) {
          botAck = ui.ackStep5;
        } else if (currentStep === 6 && isRedFlag) {
          botAck = ui.ackStep6RedFlag;
        } else if (currentStep === 6) {
          botAck = ui.ackStep6Safe;
        } else if (currentStep === 8) {
          botAck = ui.ackStep8;
        }

        const newMessages: ChatMessage[] = [];
        if (botAck) {
          newMessages.push({
            id: `ack-${Date.now()}`,
            sender: 'bot',
            metaType: 'ack_step',
            ackStep: currentStep,
            ackQuestionId: qId,
            ackOptionIndex: optionIndex,
            text: botAck,
            timestamp: nowTime,
            isRedFlagWarning: isRedFlag
          });
        }

        newMessages.push({
          id: `q-${nextStep}-${Date.now()}`,
          sender: 'bot',
          metaType: 'question',
          stepNumber: nextStep,
          text: nextQuestion.question,
          questionId: nextQuestion.id,
          options: nextQuestion.options,
          badge: nextQuestion.badge,
          timestamp: nowTime
        });

        setChatHistory(prev => [...prev, ...newMessages]);
        setCurrentStep(nextStep);
        setIsTyping(false);
      } else {
        // All 10 questions finished -> MediMitra automatically decides severity & recommendation in current language!
        setIsTyping(false);
        const finalAssessment = evaluateTriage(updatedCtx, updatedAnswers, language);
        onCompleteAssessment(finalAssessment);
      }
    }, 550);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const text = customInput.trim();
    setCustomInput('');
    handleSelectOption(text);
  };

  // Resolve message text & badge dynamically in the active language so switching languages mid-chat updates everything immediately
  const resolveLocalizedMessage = (msg: ChatMessage): { text: string; badge?: string } => {
    if (msg.metaType === 'welcome') {
      return {
        text: `${t.chatWelcome} (${localizedSymptomName})`,
        badge: ui.checkupBadge
      };
    }
    if (msg.metaType === 'ack_note') {
      return { text: ui.noteAck };
    }
    if (msg.metaType === 'feeling' && initialFeeling) {
      return { text: `${ui.feelingPrefix} ${initialFeeling}` };
    }
    if (msg.metaType === 'restart') {
      return { text: `${ui.restartedText} ${localizedSymptomName}.` };
    }
    if (msg.metaType === 'question' && msg.stepNumber) {
      const q = getAdaptiveQuestion(msg.stepNumber, questionContext, language);
      if (q) {
        return { text: q.question, badge: q.badge };
      }
    }
    if (msg.sender === 'user' && msg.questionId && typeof msg.selectedOptionIndex === 'number') {
      const qBundle = QUESTION_TRANSLATIONS[language]?.[msg.questionId as QuestionId];
      const translatedOption = qBundle?.options?.[msg.selectedOptionIndex];
      if (translatedOption) {
        return { text: translatedOption };
      }
    }
    if (msg.metaType === 'ack_step' && msg.ackStep) {
      let optText = msg.questionId ? answers[msg.questionId] : '';
      if (msg.ackQuestionId && typeof msg.ackOptionIndex === 'number') {
        optText =
          QUESTION_TRANSLATIONS[language]?.[msg.ackQuestionId as QuestionId]?.options?.[msg.ackOptionIndex] ||
          answers[msg.ackQuestionId] ||
          '';
      }
      if (msg.ackStep === 1) return { text: ui.ackStep1(optText) };
      if (msg.ackStep === 2) return { text: ui.ackStep2(optText) };
      if (msg.ackStep === 5) return { text: ui.ackStep5 };
      if (msg.ackStep === 6) {
        return { text: msg.isRedFlagWarning ? ui.ackStep6RedFlag : ui.ackStep6Safe };
      }
      if (msg.ackStep === 8) return { text: ui.ackStep8 };
    }
    return { text: msg.text, badge: msg.badge };
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">

      {/* Red Flag Alert Banner (If user flagged a severe symptom during triage) */}
      {hasTriggeredRedFlag && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 flex items-center justify-between gap-3 text-rose-900 dark:text-rose-200 shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">{ui.redFlagBannerTitle}</span> {ui.redFlagBannerDesc}
            </div>
          </div>
          <button
            onClick={onDirectDoctorReferral}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white shrink-0 cursor-pointer shadow-xs"
          >
            {ui.redFlagBannerBtn}
          </button>
        </motion.div>
      )}

      {/* Auto-fit Chat Messages Timeline */}
      <div
        ref={chatContainerRef}
        className="bg-slate-50/70 dark:bg-slate-900/90 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 max-h-[380px] sm:max-h-[480px] overflow-y-auto space-y-4 shadow-xs transition-colors"
      >
        <AnimatePresence initial={false}>
          {chatHistory.map((msg) => {
            const isBot = msg.sender === 'bot';
            const resolved = resolveLocalizedMessage(msg);
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs mt-1">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[88%] sm:max-w-[80%] space-y-1.5 ${isBot ? 'text-left' : 'text-right'}`}>
                  {resolved.badge && (
                    <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-900 dark:text-teal-300 uppercase tracking-wider mb-0.5">
                      {resolved.badge}
                    </span>
                  )}

                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl leading-relaxed shadow-xs ${
                      isBot
                        ? msg.isRedFlagWarning
                          ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100 rounded-tl-none font-semibold text-sm'
                          : msg.questionId
                          ? 'bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-none font-semibold text-sm sm:text-base'
                          : 'bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none font-normal text-xs sm:text-sm'
                        : 'bg-teal-600 text-white rounded-tr-none font-medium text-xs sm:text-sm'
                    }`}
                  >
                    {resolved.text}
                  </div>

                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block px-1 font-normal">
                    {msg.timestamp}
                  </span>
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 dark:bg-slate-600 text-white flex items-center justify-center shrink-0 shadow-xs font-medium text-xs mt-1">
                    {displayPatientName.charAt(0).toUpperCase()}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 p-2"
          >
            <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center">
              <Stethoscope className="w-3.5 h-3.5 animate-spin" />
            </div>
            <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
              {ui.analyzingText}
              <span className="animate-pulse">...</span>
            </span>
          </motion.div>
        )}
      </div>

      {/* Adaptive Answer Choice Panel for the Current Question */}
      {currentQuestionData && !isTyping && (
        <motion.div
          ref={questionPanelRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="scroll-mt-20 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-teal-200 dark:border-teal-800/80 shadow-sm space-y-3 transition-colors"
        >
          {/* Current Question Header - Clean Semibold and Legible */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800 uppercase tracking-wider">
                {t.question} {currentStep} {t.of} 10
              </span>
              {currentQuestionData.badge && (
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  • {currentQuestionData.badge}
                </span>
              )}
            </div>

            <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug">
              {currentQuestionData.question}
            </h2>

            {currentQuestionData.subtext && (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal flex items-center gap-1.5 pt-0.5">
                <Info className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>{currentQuestionData.subtext}</span>
              </p>
            )}
          </div>

          {/* Interactive Option Chips - Refined Medium Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {currentQuestionData.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt, idx)}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/70 hover:border-teal-500 dark:hover:border-teal-500 hover:bg-teal-50/70 dark:hover:bg-teal-950/50 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-medium text-left transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99]"
              >
                <span className="group-hover:text-teal-900 dark:group-hover:text-teal-200 text-slate-800 dark:text-slate-100 leading-snug">{opt}</span>
                <span className="text-slate-400 dark:text-slate-500 group-hover:text-teal-700 dark:group-hover:text-teal-300 text-sm font-mono ml-2 shrink-0">
                  →
                </span>
              </button>
            ))}
          </div>

          {/* Optional Custom Free Text Input */}
          <form onSubmit={handleCustomSubmit} className="pt-2 flex items-center gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder={t.customInputPlaceholder}
              className="flex-1 px-4 py-3 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 dark:focus:border-teal-500 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={!customInput.trim()}
              className={`px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                customInput.trim()
                  ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>{t.sendBtn}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
};
