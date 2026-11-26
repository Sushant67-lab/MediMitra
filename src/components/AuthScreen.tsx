import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  ArrowRight, 
  ArrowLeft, 
  Mail, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ShieldCheck,
  Cpu,
  Activity,
  Eye,
  EyeOff,
  PlayCircle
} from 'lucide-react';
import { UserProfile, AgeCategory, BiologicalSex } from '../types/medical';
import { MediMitraLogo } from './MediMitraLogo';
import { LanguageSelector } from './LanguageSelector';
import { ThemeToggle } from './ThemeToggle';
import { AppDemoVideoModal } from './AppDemoVideoModal';
import { useLanguage } from '../context/LanguageContext';
import { getAppStrings } from '../data/appTranslations';
import { DEMO_VIDEO_TRANSLATIONS } from '../data/demoVideoTranslations';
import { authenticateWithEmail, authenticateWithGoogle } from '../services/firebase';

interface AuthScreenProps {
  onLogin: (profile: UserProfile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLogin
}) => {
  const { t, language } = useLanguage();
  const ui = getAppStrings(language);
  const demoVideoCopy = DEMO_VIDEO_TRANSLATIONS[language] || DEMO_VIDEO_TRANSLATIONS.en;
  const [isDemoVideoOpen, setIsDemoVideoOpen] = useState(false);

  // Step 1: Patient Demographics (Name, Age Category, Gender)
  // Step 2: Sign In / Sign Up with user email to enter checkup
  const [step, setStep] = useState<1 | 2>(1);

  // Patient info states
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AgeCategory>('adult');
  const [selectedSex, setSelectedSex] = useState<BiologicalSex>('female');

  // Auth credentials states
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Loading & status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [firebaseStatus, setFirebaseStatus] = useState<string | null>(null);

  const canProceedToAuth = name.trim().length > 0;

  const handlePatientDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canProceedToAuth) return;
    setStep(2);
    setErrorMessage(null);
  };

  const handleFinalAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    if (password.length < 6) {
      setErrorMessage(ui.passwordMinError);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setFirebaseStatus(
      authMode === 'signin'
        ? 'Verifying registered email in Firebase database...'
        : ui.savingFirebaseStatus
    );

    try {
      const user = await authenticateWithEmail(
        email, 
        password, 
        {
          name: name.trim() || ui.patientWord,
          ageCategory: selectedCategory,
          sex: selectedSex
        },
        authMode
      );

      setFirebaseStatus(
        authMode === 'signin'
          ? '✓ Email verified in database!'
          : `✓ ${ui.savedFirebaseStatus}`
      );

      try {
        localStorage.setItem('curahealth_user_email', user.email);
        localStorage.setItem('curahealth_auth', 'true');
        localStorage.setItem('curahealth_patient_profile', JSON.stringify(user));
      } catch {
        // Non-fatal storage error
      }

      setTimeout(() => {
        onLogin(user);
      }, 400);
    } catch (err: any) {
      setFirebaseStatus(null);
      setErrorMessage(err?.message || ui.authGenericError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setFirebaseStatus(ui.connectingGoogleStatus);

    try {
      const user = await authenticateWithGoogle({
        ageCategory: selectedCategory,
        sex: selectedSex,
        name: name.trim()
      });

      setFirebaseStatus(`✓ ${ui.savedFirebaseStatus}`);

      try {
        localStorage.setItem('curahealth_user_email', user.email);
        localStorage.setItem('curahealth_auth', 'true');
        localStorage.setItem('curahealth_patient_profile', JSON.stringify(user));
      } catch {
        // Non-fatal storage error
      }

      setTimeout(() => {
        onLogin(user);
      }, 400);
    } catch {
      setFirebaseStatus(null);
      setErrorMessage(ui.googleCancelledError);
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // REUSABLE STEP 2 AUTH COMPONENT (Used in both Mobile and Tablet/Desktop)
  // -------------------------------------------------------------
  const renderStep2Auth = () => {
    return (
      <motion.div
        key="step2"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.2 }}
        className="space-y-4"
      >
        {/* Clean Header */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {authMode === 'signin' ? t.authStepTitle : t.createAccountBtn}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
            {t.authStepSubtitle}
          </p>
        </div>

        {/* Sign In vs Sign Up Segmented Control */}
        <div className="grid grid-cols-2 bg-slate-100/90 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700 gap-1">
          <button
            type="button"
            onClick={() => { setAuthMode('signin'); setErrorMessage(null); }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              authMode === 'signin'
                ? 'bg-white dark:bg-slate-900 text-teal-900 dark:text-teal-300 shadow-xs ring-1 ring-slate-200/60 dark:ring-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {ui.signInTab}
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setErrorMessage(null);
              if (!name.trim()) {
                setStep(1);
              }
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              authMode === 'signup'
                ? 'bg-white dark:bg-slate-900 text-teal-900 dark:text-teal-300 shadow-xs ring-1 ring-slate-200/60 dark:ring-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {ui.signUpTab}
          </button>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Firebase Sync Status Indicator */}
        {firebaseStatus && (
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600 dark:text-teal-400" />
            <span className="font-medium">{firebaseStatus}</span>
          </div>
        )}

        {/* Primary Email & Password Form */}
        <form onSubmit={handleFinalAuthSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              {t.emailLabel} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm font-normal rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 dark:focus:border-teal-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all disabled:opacity-50"
              />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-teal-700 dark:text-teal-400 mt-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>{t.emailDisclaimer}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              {t.passwordLabel} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                className="w-full pl-10 pr-10 py-2.5 text-sm font-normal rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 dark:focus:border-teal-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:bg-teal-700/50 text-white font-semibold text-xs uppercase tracking-wider shadow-md shadow-teal-700/20 disabled:shadow-none flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{ui.savingText}</span>
              </>
            ) : (
              <>
                <span>
                  {authMode === 'signin' ? t.enterCheckupBtn : t.createAccountBtn}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 py-0.5">
          <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
          <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold">{t.orContinueWith}</span>
          <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
        </div>

        {/* Google 1-Click Sign-In BELOW */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-600 text-slate-800 dark:text-slate-100 font-semibold text-xs flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{t.googleSignInBtn}</span>
        </button>

        {/* Footer Back Control */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => { setStep(1); setErrorMessage(null); }}
            disabled={isLoading}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.backHomeBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const nextMode = authMode === 'signin' ? 'signup' : 'signin';
              setAuthMode(nextMode);
              setErrorMessage(null);
              if (nextMode === 'signup' && !name.trim()) {
                setStep(1);
              }
            }}
            disabled={isLoading}
            className="text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 font-semibold hover:underline cursor-pointer"
          >
            {authMode === 'signin' ? t.needAccount : t.alreadyHaveAccount}
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-950 flex flex-col justify-center transition-colors">
      {/* ============================================================= */}
      {/* 1. MOBILE VIEW (< md / under 768px): FULL-SCREEN MODERN CARD  */}
      {/* ============================================================= */}
      <div className="block md:hidden w-full min-h-screen bg-white dark:bg-slate-950 flex flex-col justify-between">
        {/* Full-bleed Header */}
        <div className="bg-gradient-to-br from-teal-700 via-teal-800 to-teal-950 text-white px-6 pt-6 pb-10 text-center space-y-2 relative z-30 w-full shrink-0">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-teal-400/15 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-emerald-400/10 rounded-full blur-2xl" />
          </div>
          
          {/* Top Video Guide Icon, Theme Toggle & Language Selector on Mobile */}
          <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsDemoVideoOpen(true)}
              aria-label={demoVideoCopy.buttonLabel}
              title={demoVideoCopy.buttonLabel}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white backdrop-blur-xs transition-colors cursor-pointer flex items-center justify-center shrink-0"
            >
              <PlayCircle className="w-5 h-5 text-teal-100 shrink-0" />
            </button>
            <ThemeToggle variant="glass" />
          </div>
          <div className="absolute top-3 right-3 z-30">
            <LanguageSelector variant="light" />
          </div>

          <div className="flex justify-center relative z-10 pt-2">
            <MediMitraLogo size="md" className="[&_span]:text-white [&_.text-teal-600]:text-teal-200" />
          </div>
          <div className="pt-1 relative z-10">
            <p className="text-xs sm:text-sm text-teal-50 font-medium italic tracking-wide">
              {t.proverb}
            </p>
            <p className="text-[11px] text-teal-200/90 font-normal mt-0.5">
              {t.proverbSub}
            </p>
          </div>
        </div>

        {/* Mobile Form Body - Layered Sheet overlapping header */}
        <div className="flex-1 w-full -mt-5 rounded-t-3xl bg-white dark:bg-slate-900 px-5 pt-6 pb-5 relative z-20 shadow-[0_-10px_30px_rgba(4,47,46,0.12)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form
                  key="mobile-step1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handlePatientDetailsSubmit}
                  className="space-y-4"
                >
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {ui.welcomeHeading}
                    </h2>
                  </div>

                  {/* 1. Name of the patient */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                      {t.patientNameLabel} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-teal-600 dark:text-teal-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t.patientNamePlaceholder}
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 dark:focus:border-teal-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* 2. Who is this for? (Kid / Adult / Old Person) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                      {t.whoIsThisFor}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'child', label: t.kidLabel, sub: t.kidSub, emoji: '🧒' },
                        { id: 'adult', label: t.adultLabel, sub: t.adultSub, emoji: '🧑' },
                        { id: 'senior', label: t.seniorLabel, sub: t.seniorSub, emoji: '👴' }
                      ].map(({ id, label, sub, emoji }) => {
                        const isSelected = selectedCategory === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setSelectedCategory(id as AgeCategory)}
                            className={`relative p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                              isSelected
                                ? 'bg-teal-50/80 dark:bg-teal-950/70 border-teal-600 dark:border-teal-500 text-teal-950 dark:text-white shadow-xs ring-1 ring-teal-600 dark:ring-teal-500'
                                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-300 dark:hover:border-teal-600 hover:bg-teal-50/20 dark:hover:bg-teal-950/30'
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 absolute top-1.5 right-1.5" />
                            )}
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 transition-colors text-xl leading-none ${
                              isSelected ? 'bg-teal-100/80 dark:bg-teal-900/70' : 'bg-slate-100/80 dark:bg-slate-700/70'
                            }`}>
                              <span role="img" aria-label={label}>{emoji}</span>
                            </div>
                            <span className="text-xs font-semibold block leading-tight">{label}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal block mt-0.5">{sub}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Gender (Woman / Man) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                      {t.genderLabel}
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedSex('female')}
                        className={`relative p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedSex === 'female'
                            ? 'bg-teal-50/80 dark:bg-teal-950/70 border-teal-600 dark:border-teal-500 text-teal-950 dark:text-white shadow-xs ring-1 ring-teal-600 dark:ring-teal-500'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-300 dark:hover:border-teal-600 hover:bg-teal-50/20 dark:hover:bg-teal-950/30'
                        }`}
                      >
                        {selectedSex === 'female' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 absolute top-2 right-2" />
                        )}
                        <span className="text-xs font-semibold block truncate px-2">{t.femaleLabel}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal block truncate mt-0.5">{t.femaleSub}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedSex('male')}
                        className={`relative p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedSex === 'male'
                            ? 'bg-teal-50/80 dark:bg-teal-950/70 border-teal-600 dark:border-teal-500 text-teal-950 dark:text-white shadow-xs ring-1 ring-teal-600 dark:ring-teal-500'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-300 dark:hover:border-teal-600 hover:bg-teal-50/20 dark:hover:bg-teal-950/30'
                        }`}
                      >
                        {selectedSex === 'male' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 absolute top-2 right-2" />
                        )}
                        <span className="text-xs font-semibold block truncate px-2">{t.maleLabel}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal block truncate mt-0.5">{t.maleSub}</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!canProceedToAuth}
                    onClick={() => setAuthMode('signup')}
                    className="w-full mt-2 py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:bg-teal-700/45 text-white font-semibold text-xs uppercase tracking-wider shadow-md shadow-teal-700/20 disabled:shadow-none flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>{t.continueToCheckup}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setErrorMessage(null);
                        setStep(2);
                      }}
                      className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 hover:underline cursor-pointer"
                    >
                      {t.alreadyHaveAccount}
                    </button>
                  </div>
                </motion.form>
              ) : (
                renderStep2Auth()
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Sub Footer */}
        <div className="py-2.5 text-center text-[10px] text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
          {ui.mobileSubFooter}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TABLET & LAPTOP VIEW (>= md): FULL-SCREEN BLEED HEALTHCARE PORTAL      */}
      {/* ========================================================================= */}
      <div className="hidden md:grid md:grid-cols-12 w-full min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Left Column: Full-height Hero & Trust Suite (Edge-to-Edge) */}
        <div className="md:col-span-5 lg:col-span-5 bg-gradient-to-br from-teal-950 via-teal-900 to-slate-900 text-white min-h-screen p-6 md:p-8 lg:p-12 xl:p-14 flex flex-col justify-between relative overflow-hidden">
          {/* Ambient radial glow */}
          <div className="absolute -top-16 -right-16 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-6 relative z-10">
            <MediMitraLogo size="lg" className="[&_span]:text-white [&_.text-teal-600]:text-teal-300" />

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-0.5 bg-teal-400 rounded-full" />
                <span className="text-[11px] uppercase font-bold tracking-[0.18em] text-teal-300">
                  {ui.digitalSwasthyaKendra}
                </span>
              </div>
              <h1 className="text-2xl lg:text-[28px] xl:text-3xl font-bold text-white tracking-tight leading-snug">
                {ui.heroTitle}
              </h1>
              <blockquote className="border-l-2 border-teal-400/70 pl-3.5 py-0.5 text-xs lg:text-sm text-teal-100/90 italic leading-relaxed">
                "{t.proverb}" — <span className="not-italic text-teal-200/80">{t.proverbSub}</span>
              </blockquote>
            </div>

            {/* Clinical Trust Pillars */}
            <div className="space-y-2.5 pt-4 border-t border-teal-800/70">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xs">
                <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-400/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-teal-300" />
                </div>
                <div>
                  <strong className="text-white block font-semibold text-xs">{ui.pillarPrivacyTitle}</strong>
                  <span className="text-teal-200/75 text-[11px] leading-snug block mt-0.5">{ui.pillarPrivacyDesc}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xs">
                <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-400/30 flex items-center justify-center shrink-0">
                  <Cpu className="w-4 h-4 text-teal-300" />
                </div>
                <div>
                  <strong className="text-white block font-semibold text-xs">{ui.pillarEsp32Title}</strong>
                  <span className="text-teal-200/75 text-[11px] leading-snug block mt-0.5">{ui.pillarEsp32Desc}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xs">
                <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-400/30 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-teal-300" />
                </div>
                <div>
                  <strong className="text-white block font-semibold text-xs">{ui.pillarOtcTitle}</strong>
                  <span className="text-teal-200/75 text-[11px] leading-snug block mt-0.5">{ui.pillarOtcDesc}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-teal-800/70 text-[11px] text-teal-300/80 flex items-center justify-between gap-3 relative z-10">
            <button
              type="button"
              onClick={() => setIsDemoVideoOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-teal-400/35 text-white font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
            >
              <PlayCircle className="w-4 h-4 text-teal-300 shrink-0" />
              <span>{demoVideoCopy.buttonLabel}</span>
            </button>
            <span className="font-medium text-teal-200/90 whitespace-nowrap shrink-0">{ui.clinicalVersion}</span>
          </div>
        </div>

        {/* Right Column: Full-height Intake Suite */}
        <div className="md:col-span-7 lg:col-span-7 min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-50/70 via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 flex flex-col justify-between p-5 md:p-7 lg:p-10 relative overflow-y-auto transition-colors">
          {/* Top Header Row with Theme Toggle & Language Selector */}
          <div className="w-full flex items-center justify-end gap-2 pb-2 shrink-0">
            <ThemeToggle variant="surface" showLabel />
            <LanguageSelector variant="light" />
          </div>

          {/* Form Box - Elevated Clinical Card */}
          <div className="w-full max-w-xl mx-auto my-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-teal-950/[0.06] dark:shadow-black/40 border border-slate-200/80 dark:border-slate-800 ring-1 ring-slate-900/[0.03] dark:ring-white/[0.03] p-6 md:p-8 transition-colors">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form
                  key="desktop-step1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handlePatientDetailsSubmit}
                  className="space-y-4 lg:space-y-5"
                >
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3.5">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {ui.welcomeHeading}
                    </h2>
                  </div>

                  {/* 1. Patient Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                      {t.patientNameLabel} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-teal-600 dark:text-teal-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t.patientNamePlaceholder}
                        className="w-full pl-10 pr-4 py-2.5 lg:py-3 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 dark:focus:border-teal-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* 2. Age Category */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                      {t.whoIsThisFor}
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { id: 'child', label: t.kidLabel, sub: t.kidSub, emoji: '🧒' },
                        { id: 'adult', label: t.adultLabel, sub: t.adultSub, emoji: '🧑' },
                        { id: 'senior', label: t.seniorLabel, sub: t.seniorSub, emoji: '👴' }
                      ].map(({ id, label, sub, emoji }) => {
                        const isSelected = selectedCategory === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setSelectedCategory(id as AgeCategory)}
                            className={`relative p-3 lg:p-3.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                              isSelected
                                ? 'bg-teal-50/80 dark:bg-teal-950/70 border-teal-600 dark:border-teal-500 text-teal-950 dark:text-white shadow-sm ring-1 ring-teal-600 dark:ring-teal-500'
                                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-300 dark:hover:border-teal-600 hover:bg-teal-50/20 dark:hover:bg-teal-950/30'
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 absolute top-2 right-2" />
                            )}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-colors text-2xl leading-none ${
                              isSelected ? 'bg-teal-100/80 dark:bg-teal-900/70 shadow-xs' : 'bg-slate-100/80 dark:bg-slate-700/70'
                            }`}>
                              <span role="img" aria-label={label}>{emoji}</span>
                            </div>
                            <span className="text-xs font-bold block text-slate-900 dark:text-white">{label}</span>
                            <span className="text-[10px] text-teal-700 dark:text-teal-400 font-medium block mt-0.5">{sub}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Gender */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                      {t.genderLabel}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedSex('female')}
                        className={`relative p-3 lg:p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedSex === 'female'
                            ? 'bg-teal-50/80 dark:bg-teal-950/70 border-teal-600 dark:border-teal-500 text-teal-950 dark:text-white shadow-sm ring-1 ring-teal-600 dark:ring-teal-500'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-300 dark:hover:border-teal-600 hover:bg-teal-50/20 dark:hover:bg-teal-950/30'
                        }`}
                      >
                        {selectedSex === 'female' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 absolute top-2.5 right-2.5" />
                        )}
                        <span className="text-xs font-bold block text-slate-900 dark:text-white truncate px-3">{t.femaleLabel}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal block truncate mt-0.5">{t.femaleSub}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedSex('male')}
                        className={`relative p-3 lg:p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedSex === 'male'
                            ? 'bg-teal-50/80 dark:bg-teal-950/70 border-teal-600 dark:border-teal-500 text-teal-950 dark:text-white shadow-sm ring-1 ring-teal-600 dark:ring-teal-500'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-300 dark:hover:border-teal-600 hover:bg-teal-50/20 dark:hover:bg-teal-950/30'
                        }`}
                      >
                        {selectedSex === 'male' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 absolute top-2.5 right-2.5" />
                        )}
                        <span className="text-xs font-bold block text-slate-900 dark:text-white truncate px-3">{t.maleLabel}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal block truncate mt-0.5">{t.maleSub}</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!canProceedToAuth}
                    onClick={() => setAuthMode('signup')}
                    className="w-full mt-2 py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:bg-teal-700/45 text-white font-semibold text-xs uppercase tracking-wider shadow-md shadow-teal-700/20 disabled:shadow-none flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>{t.continueToCheckup}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setErrorMessage(null);
                        setStep(2);
                      }}
                      className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 hover:underline cursor-pointer"
                    >
                      {t.alreadyHaveAccount}
                    </button>
                  </div>
                </motion.form>
              ) : (
                renderStep2Auth()
              )}
            </AnimatePresence>
          </div>

          {/* Reassurance footer strip to ground the bottom */}
          <div className="w-full pt-3 text-center text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-center gap-2 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span>{ui.desktopSubFooter}</span>
          </div>
        </div>
      </div>

      <AppDemoVideoModal
        isOpen={isDemoVideoOpen}
        onClose={() => setIsDemoVideoOpen(false)}
      />
    </div>
  );
};
