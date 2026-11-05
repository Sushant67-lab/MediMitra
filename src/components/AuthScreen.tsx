import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  ArrowRight, 
  ArrowLeft, 
  Mail, 
  Lock, 
  Edit3,
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ShieldCheck,
  Cpu,
  Stethoscope,
  Heart,
  Activity
} from 'lucide-react';
import { UserProfile, AgeCategory, BiologicalSex } from '../types/medical';
import { MediMitraLogo } from './MediMitraLogo';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import { authenticateWithEmail, authenticateWithGoogle } from '../services/firebase';

interface AuthScreenProps {
  onLogin: (profile: UserProfile) => void;
  onContinueAsGuest: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLogin,
  onContinueAsGuest
}) => {
  const { t } = useLanguage();

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
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setFirebaseStatus('Saving user profile to Firebase database...');

    try {
      const user = await authenticateWithEmail(
        email, 
        password, 
        {
          name: name.trim() || 'Patient',
          ageCategory: selectedCategory,
          sex: selectedSex
        },
        authMode
      );

      setFirebaseStatus('✓ Successfully recorded in Firebase database!');

      try {
        localStorage.setItem('curahealth_user_email', user.email);
        localStorage.setItem('curahealth_auth', 'true');
        localStorage.setItem('curahealth_patient_profile', JSON.stringify(user));
      } catch (err) {
        console.warn('Storage warning', err);
      }

      setTimeout(() => {
        onLogin(user);
      }, 400);
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setErrorMessage(err?.message || 'Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setFirebaseStatus('Connecting with Google & recording in Firebase...');

    try {
      const user = await authenticateWithGoogle({
        ageCategory: selectedCategory,
        sex: selectedSex,
        name: name.trim()
      });

      setFirebaseStatus('✓ Successfully recorded in Firebase database!');

      try {
        localStorage.setItem('curahealth_user_email', user.email);
        localStorage.setItem('curahealth_auth', 'true');
        localStorage.setItem('curahealth_patient_profile', JSON.stringify(user));
      } catch (err) {
        console.warn('Storage warning', err);
      }

      setTimeout(() => {
        onLogin(user);
      }, 400);
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setErrorMessage(err?.message || 'Google sign-in was cancelled or encountered an issue.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryLabel = (cat: AgeCategory) => {
    switch (cat) {
      case 'child': return t.kidLabel;
      case 'senior': return t.seniorLabel;
      default: return t.adultLabel;
    }
  };

  // -------------------------------------------------------------
  // REUSABLE STEP 2 AUTH COMPONENT (Used in both Mobile and Tablet/Desktop)
  // -------------------------------------------------------------
  const renderStep2Auth = () => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Patient Summary Pill */}
      <div className="p-3.5 rounded-2xl bg-teal-50/90 border border-teal-200/90 flex items-center justify-between text-xs text-teal-950">
        <div>
          <span className="text-[10px] text-teal-700 uppercase font-semibold block tracking-wider">
            Patient Selected:
          </span>
          <span className="font-semibold">{name}</span> •{' '}
          <span className="capitalize">{getCategoryLabel(selectedCategory)}</span> •{' '}
          <span className="capitalize">{selectedSex === 'female' ? t.femaleLabel : t.maleLabel}</span>
        </div>
        <button
          type="button"
          onClick={() => setStep(1)}
          disabled={isLoading}
          className="p-1.5 rounded-lg text-teal-700 hover:bg-teal-100 transition-colors cursor-pointer disabled:opacity-50"
          title="Edit Patient Details"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="text-center pb-1">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          {authMode === 'signin' ? t.authStepTitle : t.createAccountBtn}
        </h2>
        <p className="text-xs text-slate-500 font-normal mt-0.5">
          {t.authStepSubtitle}
        </p>
      </div>

      {/* Google 1-Click Sign-In */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center justify-center gap-2.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
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

      <div className="flex items-center gap-3 my-2">
        <div className="h-px bg-slate-200 flex-1"></div>
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">{t.orContinueWith}</span>
        <div className="h-px bg-slate-200 flex-1"></div>
      </div>

      {/* Sign In vs Sign Up Tab Switcher */}
      <div className="flex border border-slate-200 bg-slate-50 p-1 rounded-xl gap-1">
        <button
          type="button"
          onClick={() => { setAuthMode('signin'); setErrorMessage(null); }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            authMode === 'signin'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setAuthMode('signup'); setErrorMessage(null); }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            authMode === 'signup'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Firebase Sync Status Indicator */}
      {firebaseStatus && (
        <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600" />
          <span className="font-medium">{firebaseStatus}</span>
        </div>
      )}

      {/* Sign In / Sign Up Form */}
      <form onSubmit={handleFinalAuthSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            {t.emailLabel} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              className="w-full pl-10 pr-3.5 py-2.5 text-xs font-normal rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50 text-slate-900 disabled:opacity-50"
            />
          </div>
          <span className="text-[11px] text-teal-700 mt-1 block">
            ✓ {t.emailDisclaimer}
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            {t.passwordLabel} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordPlaceholder}
              className="w-full pl-10 pr-3.5 py-2.5 text-xs font-normal rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50 text-slate-900 disabled:opacity-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>
                {authMode === 'signin' ? t.enterCheckupBtn : t.createAccountBtn}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Back control & Guest mode */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <button
          type="button"
          onClick={() => setStep(1)}
          disabled={isLoading}
          className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>{t.editDetails}</span>
        </button>

        <button
          type="button"
          onClick={onContinueAsGuest}
          disabled={isLoading}
          className="text-teal-700 hover:text-teal-900 font-medium hover:underline cursor-pointer"
        >
          {t.guestModeBtn}
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-slate-50 flex flex-col justify-center">
      {/* ============================================================= */}
      {/* 1. MOBILE VIEW (< md / under 768px): FULL-SCREEN MODERN CARD  */}
      {/* ============================================================= */}
      <div className="block md:hidden w-full min-h-screen bg-slate-50 flex flex-col justify-between">
        {/* Full-bleed Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-teal-900 text-white p-6 text-center space-y-2 relative overflow-hidden w-full shrink-0">
          <div className="absolute top-0 right-0 w-36 h-36 bg-teal-600/20 rounded-full blur-2xl pointer-events-none" />
          
          {/* Top Language Selector on Mobile */}
          <div className="absolute top-3 right-3 z-30">
            <LanguageSelector variant="light" />
          </div>

          <div className="flex justify-center relative z-10 pt-1">
            <MediMitraLogo size="md" className="[&_span]:text-white [&_.text-teal-600]:text-teal-200" />
          </div>
          <div className="pt-1 relative z-10">
            <p className="text-xs sm:text-sm text-teal-100 font-medium italic tracking-wide">
              {t.proverb}
            </p>
            <p className="text-[11px] text-teal-200/90 font-normal mt-0.5">
              {t.proverbSub}
            </p>
          </div>
        </div>

        {/* Mobile Form Body - Fills full width & height smoothly */}
        <div className="flex-1 w-full p-5 sm:p-6 bg-white flex flex-col justify-center">
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
                  <div className="text-center pb-1">
                    <h2 className="text-lg font-bold text-slate-900">
                      {t.whoNeedsCheckup}
                    </h2>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      {t.step1Subtitle}
                    </p>
                  </div>

                  {/* 1. Name of the patient */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      {t.patientNameLabel} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t.patientNamePlaceholder}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50/50 text-slate-900"
                      />
                    </div>
                  </div>

                  {/* 2. Who is this for? (Kid / Adult / Old Person) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      {t.whoIsThisFor}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'child', label: t.kidLabel, sub: t.kidSub, icon: '🧒' },
                        { id: 'adult', label: t.adultLabel, sub: t.adultSub, icon: '🧑' },
                        { id: 'senior', label: t.seniorLabel, sub: t.seniorSub, icon: '👴' }
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id as AgeCategory)}
                          className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                            selectedCategory === cat.id
                              ? 'bg-teal-50 border-teal-600 text-teal-950 shadow-xs ring-1 ring-teal-600'
                              : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-xl mb-0.5">{cat.icon}</span>
                          <span className="text-xs font-semibold block">{cat.label}</span>
                          <span className="text-[10px] text-slate-500 font-normal block">{cat.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Gender (Woman / Man) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      {t.genderLabel}
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedSex('female')}
                        className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          selectedSex === 'female'
                            ? 'bg-teal-50 border-teal-600 text-teal-950 shadow-xs ring-1 ring-teal-600'
                            : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-xs font-semibold block">{t.femaleLabel}</span>
                        <span className="text-[10px] text-slate-500 font-normal">{t.femaleSub}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedSex('male')}
                        className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          selectedSex === 'male'
                            ? 'bg-teal-50 border-teal-600 text-teal-950 shadow-xs ring-1 ring-teal-600'
                            : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-xs font-semibold block">{t.maleLabel}</span>
                        <span className="text-[10px] text-slate-500 font-normal">{t.maleSub}</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!canProceedToAuth}
                    className="w-full mt-2 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>{t.continueToCheckup}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.form>
              ) : (
                renderStep2Auth()
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Sub Footer */}
        <div className="py-2.5 text-center text-[10px] text-slate-400 bg-white border-t border-slate-100 shrink-0">
          MediMitra AI Medical Triage & Automated ESP32 Dispenser
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TABLET & LAPTOP VIEW (>= md): FULL-SCREEN BLEED HEALTHCARE PORTAL      */}
      {/* ========================================================================= */}
      <div className="hidden md:grid md:grid-cols-12 w-full min-h-screen bg-slate-50">
        {/* Left Column: Full-height Hero & Trust Suite (Edge-to-Edge) */}
        <div className="md:col-span-5 lg:col-span-5 bg-gradient-to-br from-teal-950 via-teal-900 to-slate-900 text-white min-h-screen p-6 md:p-8 lg:p-12 xl:p-14 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-5 lg:space-y-6 relative z-10">
            <MediMitraLogo size="lg" className="[&_span]:text-white [&_.text-teal-600]:text-teal-300" />

            <div className="space-y-2 pt-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-teal-300 bg-teal-950/80 px-2.5 py-1 rounded-md border border-teal-700/60 inline-block shadow-xs">
                Digital Swasthya Kendra
              </span>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
                Intelligent Clinical Triage & Dispensing
              </h1>
              <p className="text-xs lg:text-sm text-teal-100/90 italic pt-0.5 leading-relaxed">
                "{t.proverb}" — {t.proverbSub}
              </p>
            </div>

            {/* Clinical Trust Badges */}
            <div className="space-y-3.5 pt-3 border-t border-teal-800/80">
              <div className="flex items-start gap-2.5 lg:gap-3 text-xs text-teal-100">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-teal-800/60 border border-teal-700/50 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-teal-300" />
                </div>
                <div>
                  <strong className="text-white block font-semibold text-xs">End-to-End Privacy</strong>
                  <span className="text-teal-200/80 text-[11px] leading-tight block">HIPAA & Clinical intake security standards.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 lg:gap-3 text-xs text-teal-100">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-teal-800/60 border border-teal-700/50 flex items-center justify-center shrink-0">
                  <Cpu className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-teal-300" />
                </div>
                <div>
                  <strong className="text-white block font-semibold text-xs">ESP32 Hardware Sync</strong>
                  <span className="text-teal-200/80 text-[11px] leading-tight block">Automated precision physical medicine dispensing.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 lg:gap-3 text-xs text-teal-100">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-teal-800/60 border border-teal-700/50 flex items-center justify-center shrink-0">
                  <Activity className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-teal-300" />
                </div>
                <div>
                  <strong className="text-white block font-semibold text-xs">Verified OTC Guidance</strong>
                  <span className="text-teal-200/80 text-[11px] leading-tight block">Adaptive symptom reasoning before dispensing.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-teal-800/80 text-[11px] text-teal-300/80 flex items-center justify-between relative z-10">
            <span>Firebase Cloud Firestore</span>
            <span>v2.5 Connected</span>
          </div>
        </div>

        {/* Right Column: Full-height Intake Suite (No stark empty white space) */}
        <div className="md:col-span-7 lg:col-span-7 min-h-screen bg-gradient-to-b from-teal-50/40 via-slate-50 to-teal-50/20 flex flex-col justify-between p-5 md:p-7 lg:p-10 relative overflow-y-auto">
          {/* Top Header Row with Language Selector */}
          <div className="w-full flex items-center justify-between pb-2 shrink-0">
            <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider bg-teal-100/70 border border-teal-200/80 px-2.5 py-1 rounded-lg">
              Patient Check-Up Desk
            </span>
            <LanguageSelector variant="light" />
          </div>

          {/* Form Box - Elegantly framed inside a clean medical card */}
          <div className="w-full max-w-xl mx-auto my-auto bg-white rounded-3xl shadow-md border border-teal-100/80 p-6 md:p-8">
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
                  <div className="border-b border-slate-100 pb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
                        Patient Intake • Step 1 of 2
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        50% Completed
                      </span>
                    </div>
                    {/* Visual Progress Line */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-600 rounded-full w-1/2 transition-all duration-300" />
                    </div>
                    <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mt-3">
                      {t.whoNeedsCheckup}
                    </h2>
                    <p className="text-xs text-slate-500 font-normal">
                      {t.step1Subtitle}
                    </p>
                  </div>

                  {/* 1. Patient Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                      {t.patientNameLabel} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-teal-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t.patientNamePlaceholder}
                        className="w-full pl-10 pr-4 py-2.5 lg:py-3 text-sm font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50/50 text-slate-900 transition-all"
                      />
                    </div>
                  </div>

                  {/* 2. Age Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                      {t.whoIsThisFor}
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { id: 'child', label: t.kidLabel, sub: t.kidSub, icon: '🧒' },
                        { id: 'adult', label: t.adultLabel, sub: t.adultSub, icon: '🧑' },
                        { id: 'senior', label: t.seniorLabel, sub: t.seniorSub, icon: '👴' }
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id as AgeCategory)}
                          className={`p-2.5 lg:p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                            selectedCategory === cat.id
                              ? 'bg-teal-50 border-teal-600 text-teal-950 shadow-sm ring-1 ring-teal-600 scale-[1.02]'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-2xl mb-1">{cat.icon}</span>
                          <span className="text-xs font-bold block text-slate-900">{cat.label}</span>
                          <span className="text-[10px] text-teal-700 font-medium block mt-0.5">{cat.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Gender */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                      {t.genderLabel}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedSex('female')}
                        className={`p-2.5 lg:p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                          selectedSex === 'female'
                            ? 'bg-teal-50 border-teal-600 text-teal-950 shadow-sm ring-1 ring-teal-600'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-teal-100/70 text-teal-800 flex items-center justify-center shrink-0">
                          <Heart className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold block text-slate-900">{t.femaleLabel}</span>
                          <span className="text-[10px] text-slate-500 font-normal">{t.femaleSub}</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedSex('male')}
                        className={`p-2.5 lg:p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                          selectedSex === 'male'
                            ? 'bg-teal-50 border-teal-600 text-teal-950 shadow-sm ring-1 ring-teal-600'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-teal-100/70 text-teal-800 flex items-center justify-center shrink-0">
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold block text-slate-900">{t.maleLabel}</span>
                          <span className="text-[10px] text-slate-500 font-normal">{t.maleSub}</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!canProceedToAuth}
                    className="w-full mt-2 py-3 lg:py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>{t.continueToCheckup}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.form>
              ) : (
                renderStep2Auth()
              )}
            </AnimatePresence>
          </div>

          {/* Reassurance footer strip to ground the bottom */}
          <div className="w-full pt-3 text-center text-[11px] text-slate-400 border-t border-slate-200/60 flex items-center justify-center gap-2 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span>MediMitra AI Clinical Triage • ESP32 Dispenser Synchronized • Certified Guidelines</span>
          </div>
        </div>
      </div>
    </div>
  );
};
