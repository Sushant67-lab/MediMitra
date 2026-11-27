/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FrontPage } from './components/FrontPage';
import { TriageChatbot } from './components/TriageChatbot';
import { TriageResultView } from './components/TriageResultView';
import { DoctorLocator } from './components/DoctorLocator';
import { AuthScreen } from './components/AuthScreen';
import { AuthModal } from './components/AuthModal';
import { Esp32HardwareGuideModal } from './components/Esp32HardwareGuideModal';
import { Esp32PasswordModal } from './components/Esp32PasswordModal';
import { 
  UserProfile, 
  SymptomCategory, 
  TriageAssessment 
} from './types/medical';
import { 
  saveUserProfileToFirestore, 
  saveAssessmentToFirestore,
  logOutFromFirebase
} from './services/firebase';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

const INITIAL_PROFILE: UserProfile = {
  id: 'user-default',
  name: '',
  email: '',
  age: 30,
  ageCategory: 'adult',
  sex: 'female',
  isPregnantOrNursing: false
};

function MainApp() {
  const { t } = useLanguage();
  // Authentication State (requires verified email session — guest mode disabled)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const authFlag = localStorage.getItem('curahealth_auth') === 'true';
      if (!authFlag) return false;
      const storedEmail = (localStorage.getItem('curahealth_user_email') || '').trim().toLowerCase();
      if (storedEmail && storedEmail.includes('@') && storedEmail !== 'patient@medimitra.local') {
        return true;
      }
      const saved = localStorage.getItem('curahealth_patient_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        const pEmail = String(parsed?.email || '').trim().toLowerCase();
        return Boolean(pEmail && pEmail.includes('@') && pEmail !== 'patient@medimitra.local');
      }
      return false;
    } catch {
      return false;
    }
  });

  // Patient profile state
  const [currentProfile, setCurrentProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('curahealth_patient_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          const storedEmail = localStorage.getItem('curahealth_user_email');
          if (storedEmail) {
            parsed.email = storedEmail;
          }
          return parsed;
        }
      }
      return INITIAL_PROFILE;
    } catch {
      return INITIAL_PROFILE;
    }
  });

  // Navigation View State
  const [currentView, setCurrentView] = useState<'front' | 'triage_chat' | 'triage_result' | 'doctors'>('front');
  const [activeSymptom, setActiveSymptom] = useState<SymptomCategory>('fever');
  const [userCustomNote, setUserCustomNote] = useState<string | undefined>(undefined);
  const [currentAssessment, setCurrentAssessment] = useState<TriageAssessment | null>(null);
  const [isAssessmentSaved, setIsAssessmentSaved] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isHardwareGuideOpen, setIsHardwareGuideOpen] = useState(false);
  const [isEsp32PasswordOpen, setIsEsp32PasswordOpen] = useState(false);
  const [isEsp32Authorized, setIsEsp32Authorized] = useState<boolean>(false);
  const [pendingEsp32Action, setPendingEsp32Action] = useState<(() => void) | null>(null);

  const requestEsp32Access = (onGranted: () => void) => {
    if (isEsp32Authorized) {
      onGranted();
      return;
    }
    setPendingEsp32Action(() => onGranted);
    setIsEsp32PasswordOpen(true);
  };

  // Save profile to localStorage
  useEffect(() => {
    try {
      if (currentProfile.name || currentProfile.email) {
        localStorage.setItem('curahealth_patient_profile', JSON.stringify(currentProfile));
      }
    } catch {
      // Non-fatal storage error
    }
  }, [currentProfile]);

  const handleLogin = (profile: UserProfile, options?: { isEsp32Operator?: boolean }) => {
    setCurrentProfile(profile);
    setIsAuthenticated(true);
    setIsEsp32Authorized(Boolean(options?.isEsp32Operator));
    try {
      localStorage.setItem('curahealth_auth', 'true');
      localStorage.setItem('curahealth_user_email', profile.email);
      localStorage.setItem('curahealth_patient_profile', JSON.stringify(profile));
    } catch {
      // Non-fatal storage error
    }
    saveUserProfileToFirestore(profile);
    setCurrentView('front');
  };

  const handleSignOut = () => {
    logOutFromFirebase();
    setIsAuthenticated(false);
    setIsEsp32Authorized(false);
    setIsHardwareGuideOpen(false);
    setPendingEsp32Action(null);
    setIsEsp32PasswordOpen(false);
    try {
      localStorage.removeItem('curahealth_auth');
      localStorage.removeItem('curahealth_patient_profile');
      localStorage.removeItem('curahealth_user_email');
    } catch {
      // Non-fatal storage error
    }
    setCurrentProfile(INITIAL_PROFILE);
    setCurrentView('front');
  };

  const handleStartTriage = (symptom: SymptomCategory, customNote?: string) => {
    setActiveSymptom(symptom);
    setUserCustomNote(customNote);
    setIsAssessmentSaved(false);
    setCurrentView('triage_chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteAssessment = (assessment: TriageAssessment) => {
    setCurrentAssessment(assessment);
    setIsAssessmentSaved(false);
    setCurrentView('triage_result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveRecord = (assessment: TriageAssessment) => {
    setIsAssessmentSaved(true);
    if (currentProfile?.id) {
      saveAssessmentToFirestore(currentProfile.id, assessment, currentProfile);
    }
  };

  // If user is not signed in, show Sign In / Sign Up screen
  if (!isAuthenticated) {
    return (
      <AuthScreen
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900 dark:selection:bg-teal-900 dark:selection:text-teal-100 transition-colors duration-200">
      {/* Simple Header */}
      <Header
        currentProfile={currentProfile}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenDoctors={() => setCurrentView('doctors')}
        onGoHome={() => setCurrentView('front')}
        onSignOut={handleSignOut}
        onOpenHardwareGuide={
          isEsp32Authorized ? () => setIsHardwareGuideOpen(true) : undefined
        }
      />

      {/* Main Views */}
      <main className="flex-1">
        {currentView === 'front' && (
          <FrontPage
            currentProfile={currentProfile}
            onStartTriage={handleStartTriage}
            onOpenDoctors={() => setCurrentView('doctors')}
          />
        )}

        {currentView === 'triage_chat' && (
          <TriageChatbot
            currentProfile={currentProfile}
            symptom={activeSymptom}
            userCustomNote={userCustomNote}
            onBack={() => setCurrentView('front')}
            onCompleteAssessment={handleCompleteAssessment}
            onDirectDoctorReferral={() => setCurrentView('doctors')}
          />
        )}

        {currentView === 'triage_result' && currentAssessment && (
          <TriageResultView
            assessment={currentAssessment}
            currentProfile={currentProfile}
            onSaveRecord={handleSaveRecord}
            onOpenDoctors={() => setCurrentView('doctors')}
            onStartNew={() => setCurrentView('front')}
            canAccessEsp32={isEsp32Authorized}
            onRequestEsp32Access={requestEsp32Access}
            isSaved={isAssessmentSaved}
          />
        )}

        {currentView === 'doctors' && (
          <DoctorLocator
            onBack={() => setCurrentView('front')}
            preferredSpecialty={
              activeSymptom === 'skin_rash' 
                ? 'Dermatologist' 
                : activeSymptom === 'cold_sneezing' 
                ? 'ENT' 
                : currentProfile.ageCategory === 'child' 
                ? 'Pediatrician' 
                : undefined
            }
          />
        )}
      </main>

      {/* Profile Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentProfile={currentProfile}
        onSelectProfile={(p) => setCurrentProfile(p)}
      />

      {/* Global ESP32 IoT Dispenser Hardware Guide Modal */}
      <Esp32HardwareGuideModal
        isOpen={isHardwareGuideOpen}
        onClose={() => setIsHardwareGuideOpen(false)}
      />

      {/* ESP32 Password Gate Modal */}
      <Esp32PasswordModal
        isOpen={isEsp32PasswordOpen}
        defaultEmail={currentProfile.email || ''}
        onClose={() => {
          setIsEsp32PasswordOpen(false);
          setPendingEsp32Action(null);
        }}
        onVerified={() => {
          setIsEsp32Authorized(true);
          setIsEsp32PasswordOpen(false);
          const action = pendingEsp32Action;
          setPendingEsp32Action(null);
          if (action) action();
        }}
      />

      {/* Simple Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 py-5 mt-8 text-center text-xs text-slate-400 dark:text-slate-500 transition-colors">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{t.footerTagline}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
            >
              {t.switchProfileBtn}
            </button>
            <span>•</span>
            <span className="text-slate-500 dark:text-slate-300 font-semibold">{t.emergencyNumber}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <MainApp />
      </LanguageProvider>
    </ThemeProvider>
  );
}
