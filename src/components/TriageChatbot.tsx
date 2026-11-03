import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HeartPulse, 
  Send, 
  ArrowLeft, 
  RotateCcw, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  User,
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
import { getAdaptiveQuestion, evaluateTriage, COMMON_SYMPTOMS } from '../data/medicalKnowledge';
import { MediMitraLogo } from './MediMitraLogo';
import { useLanguage } from '../context/LanguageContext';

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
  onBack,
  onCompleteAssessment,
  onDirectDoctorReferral
}) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [customInput, setCustomInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [hasTriggeredRedFlag, setHasTriggeredRedFlag] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const symptomInfo = COMMON_SYMPTOMS.find(s => s.id === symptom) || COMMON_SYMPTOMS[0];

  const questionContext: QuestionContext = {
    ageCategory: currentProfile.ageCategory,
    age: currentProfile.age,
    sex: currentProfile.sex,
    isPregnantOrNursing: currentProfile.isPregnantOrNursing,
    symptom,
    answers
  };

  const currentQuestionData = getAdaptiveQuestion(currentStep, questionContext);

  // Initialize intake session on mount
  useEffect(() => {
    const welcomeMessages: ChatMessage[] = [
      {
        id: 'msg-welcome-1',
        sender: 'bot',
        text: `${t.chatWelcome} (${symptomInfo.name})`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        badge: `${t.brandName} Check-up`
      }
    ];

    if (userCustomNote) {
      welcomeMessages.push({
        id: 'msg-user-note',
        sender: 'user',
        text: userCustomNote,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      welcomeMessages.push({
        id: 'msg-ack-note',
        sender: 'bot',
        text: `Thank you for sharing that. Let's ask a few simple questions tailored for you.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } else if (initialFeeling) {
      welcomeMessages.push({
        id: 'msg-user-feeling',
        sender: 'user',
        text: `I'm feeling: ${initialFeeling}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    // Add first question
    const q1 = getAdaptiveQuestion(1, questionContext);
    if (q1) {
      welcomeMessages.push({
        id: `msg-q-1`,
        sender: 'bot',
        text: q1.question,
        questionId: q1.id,
        options: q1.options,
        badge: q1.badge,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    setChatHistory(welcomeMessages);
  }, [symptom]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const handleSelectOption = (option: string) => {
    if (!currentQuestionData) return;

    // Check if this option is a red flag
    const isRedFlag = 
      option.includes('breathing') || 
      option.includes('Stiff neck') || 
      option.includes('thunderclap') ||
      option.includes('fluids down') ||
      option.includes('Purple spots') ||
      option.includes('Active bleeding');

    if (isRedFlag) {
      setHasTriggeredRedFlag(true);
    }

    const updatedAnswers = {
      ...answers,
      [currentQuestionData.id]: option
    };
    setAnswers(updatedAnswers);

    // Add user message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: option,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate clinical reasoning pause
    setTimeout(() => {
      const nextStep = currentStep + 1;
      const updatedCtx: QuestionContext = {
        ...questionContext,
        answers: updatedAnswers
      };

      const nextQuestion = getAdaptiveQuestion(nextStep, updatedCtx);

      if (nextQuestion) {
        // Empathetic acknowledgment
        let botAck = '';
        if (currentStep === 1) {
          botAck = `Understood. Age group set to ${option}. Calibrating pediatric & adult dosage algorithms...`;
        } else if (currentStep === 2) {
          botAck = `Noted your health context (${option}). Ensuring all medication checks reflect this.`;
        } else if (currentStep === 5) {
          botAck = `Clinical specifics recorded. Now screening for potential warning signs...`;
        } else if (currentStep === 6 && isRedFlag) {
          botAck = `⚠️ Caution: You selected a high-priority red flag symptom. Emergency medical attention may be needed.`;
        } else if (currentStep === 6) {
          botAck = `No acute red flags indicated. Checking allergy and medication history...`;
        } else if (currentStep === 8) {
          botAck = `Checked prior medication timing to prevent compound dosage risks.`;
        }

        const newMessages: ChatMessage[] = [];
        if (botAck) {
          newMessages.push({
            id: `ack-${Date.now()}`,
            sender: 'bot',
            text: botAck,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRedFlagWarning: isRedFlag
          });
        }

        newMessages.push({
          id: `q-${nextStep}-${Date.now()}`,
          sender: 'bot',
          text: nextQuestion.question,
          questionId: nextQuestion.id,
          options: nextQuestion.options,
          badge: nextQuestion.badge,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        setChatHistory(prev => [...prev, ...newMessages]);
        setCurrentStep(nextStep);
        setIsTyping(false);
      } else {
        // All 13 questions finished -> finalize clinical assessment!
        setIsTyping(false);
        const finalAssessment = evaluateTriage(updatedCtx, updatedAnswers);
        onCompleteAssessment(finalAssessment);
      }
    }, 600);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const text = customInput.trim();
    setCustomInput('');
    handleSelectOption(text);
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setAnswers({});
    setHasTriggeredRedFlag(false);
    const q1 = getAdaptiveQuestion(1, questionContext);
    setChatHistory([
      {
        id: 'msg-restart',
        sender: 'bot',
        text: `Consultation restarted. Let's begin the 10-step health check for ${symptomInfo.name}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      ...(q1 ? [{
        id: 'q-1-re',
        sender: 'bot' as const,
        text: q1.question,
        questionId: q1.id,
        options: q1.options,
        badge: q1.badge,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }] : [])
    ]);
  };

  const progressPercentage = Math.min(100, Math.round(((currentStep - 1) / 10) * 100));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">
      {/* Top Session Bar with MediMitra Logo */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Go back to home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <MediMitraLogo size="sm" />

          <div className="border-l border-slate-200 pl-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                {symptomInfo.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Patient: <span className="font-medium text-slate-800">{currentProfile.name}</span> ({currentProfile.ageCategory}, {currentProfile.age}y, {currentProfile.sex})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs font-bold text-teal-700">
              Question {Math.min(currentStep, 10)} of 10
            </span>
            <div className="w-32 bg-slate-100 rounded-full h-2 mt-1 overflow-hidden border border-slate-200">
              <motion.div 
                className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Restart interview"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Red Flag Alert Banner (If user flagged a severe symptom during triage) */}
      {hasTriggeredRedFlag && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 flex items-center justify-between gap-3 text-rose-900 shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">High Priority Indicator Flagged:</span> One or more answers suggest emergency medical evaluation may be required.
            </div>
          </div>
          <button
            onClick={onDirectDoctorReferral}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white shrink-0 cursor-pointer shadow-xs"
          >
            Find Emergency Doctors Now
          </button>
        </motion.div>
      )}

      {/* Elongated Chat Messages Timeline */}
      <div className="bg-slate-50/70 rounded-3xl p-5 sm:p-8 border border-slate-200 min-h-[560px] sm:min-h-[640px] max-h-[740px] overflow-y-auto space-y-5 shadow-xs">
        <AnimatePresence initial={false}>
          {chatHistory.map((msg) => {
            const isBot = msg.sender === 'bot';
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
                  {msg.badge && (
                    <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-md bg-teal-100 text-teal-900 uppercase tracking-wider mb-0.5">
                      {msg.badge}
                    </span>
                  )}

                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl leading-relaxed shadow-xs ${
                      isBot
                        ? msg.isRedFlagWarning
                          ? 'bg-rose-50 border border-rose-300 text-rose-950 rounded-tl-none font-semibold text-sm'
                          : msg.questionId
                          ? 'bg-white border border-slate-200/90 text-slate-900 rounded-tl-none font-semibold text-sm sm:text-base'
                          : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none font-normal text-xs sm:text-sm'
                        : 'bg-teal-600 text-white rounded-tr-none font-medium text-xs sm:text-sm'
                    }`}
                  >
                    {msg.text}
                  </div>

                  <span className="text-[10px] text-slate-400 block px-1 font-normal">
                    {msg.timestamp}
                  </span>
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-xs font-medium text-xs mt-1">
                    {currentProfile.name.charAt(0)}
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
            className="flex items-center gap-2 text-xs text-slate-500 p-2"
          >
            <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center">
              <Stethoscope className="w-3.5 h-3.5 animate-spin" />
            </div>
            <span className="flex items-center gap-1 font-medium text-slate-600">
              MediMitra is analyzing symptoms
              <span className="animate-pulse">...</span>
            </span>
          </motion.div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Adaptive Answer Choice Panel for the Current Question */}
      {currentQuestionData && !isTyping && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-teal-200 shadow-sm space-y-3"
        >
          {/* Current Question Header - Clean Semibold and Legible */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 uppercase tracking-wider">
                {t.question} {currentStep} {t.of} 10
              </span>
              {currentQuestionData.badge && (
                <span className="text-[11px] font-medium text-slate-600">
                  • {currentQuestionData.badge}
                </span>
              )}
            </div>

            <h2 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
              {currentQuestionData.question}
            </h2>

            {currentQuestionData.subtext && (
              <p className="text-xs text-slate-500 font-normal flex items-center gap-1.5 pt-0.5">
                <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>{currentQuestionData.subtext}</span>
              </p>
            )}
          </div>

          {/* Interactive Option Chips - Refined Medium Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {currentQuestionData.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt)}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/40 hover:border-teal-500 hover:bg-teal-50/70 text-slate-800 text-xs sm:text-sm font-medium text-left transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99]"
              >
                <span className="group-hover:text-teal-900 text-slate-800 leading-snug">{opt}</span>
                <span className="text-slate-400 group-hover:text-teal-700 text-sm font-mono ml-2 shrink-0">
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
              className="flex-1 px-4 py-3 text-sm font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50 text-slate-950 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!customInput.trim()}
              className={`px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                customInput.trim()
                  ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
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
