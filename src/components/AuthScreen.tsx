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
  Loader2
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
  // Step 1: Patient Details (Name, Who is this for, Gender)
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

      // Small pause to allow user to see the success confirmation
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
      case 'child': return 'Kid / Child';
      case 'senior': return 'Old Person';
      default: return 'Adult';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/70 via-slate-50 to-white flex flex-col justify-center items-center p-4 relative">
      {/* Top Right Language Selector */}
      <div className="absolute top-3 right-3 sm:top-5 sm:right-6 z-40">
        <LanguageSelector variant="light" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
      >
        {/* MediMitra Header with Logo, Name & Health Proverb */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white p-6 text-center space-y-2">
          <div className="flex justify-center">
            <MediMitraLogo size="md" className="[&_span]:text-white [&_.text-teal-600]:text-teal-200" />
          </div>
          <div className="pt-1">
            <p className="text-xs sm:text-sm text-teal-100 font-medium italic tracking-wide">
              {t.proverb}
            </p>
            <p className="text-[11px] text-teal-200/90 font-normal mt-0.5">
              {t.proverbSub}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              /* STEP 1: PATIENT DETAILS ONLY */
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handlePatientDetailsSubmit}
                className="space-y-4"
              >
                <div className="text-center pb-1">
                  <h2 className="text-lg font-semibold text-slate-900">
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
              /* STEP 2: SIGN IN / SIGN UP WITH USER EMAIL */
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Patient Summary Pill */}
                <div className="p-3 rounded-2xl bg-teal-50/80 border border-teal-200/80 flex items-center justify-between text-xs text-teal-950">
                  <div>
                    <span className="text-[10px] text-teal-700 uppercase font-semibold block">
                      Patient Selected:
                    </span>
                    <span className="font-semibold">{name}</span> •{' '}
                    <span className="capitalize">{getCategoryLabel(selectedCategory)}</span> •{' '}
                    <span className="capitalize">{selectedSex}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                    className="p-1 rounded-lg text-teal-700 hover:bg-teal-100 transition-colors cursor-pointer disabled:opacity-50"
                    title="Edit Patient Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-center pb-1">
                  <h2 className="text-lg font-semibold text-slate-900">
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
                <div className="flex border-b border-slate-200 bg-slate-50 p-1 rounded-xl gap-1">
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
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
