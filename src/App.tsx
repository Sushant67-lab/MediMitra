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
import { 
  UserProfile, 
  SymptomCategory, 
  TriageAssessment, 
  MedicalRecord 
} from './types/medical';
import { 
  saveUserProfileToFirestore, 
  saveAssessmentToFirestore,
  logOutFromFirebase
} from './services/firebase';

const INITIAL_PROFILE: UserProfile = {
  id: 'user-default',
  name: '',
  email: '',
  age: 30,
  ageCategory: 'adult',
  sex: 'female',
  isPregnantOrNursing: false
};

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('curahealth_auth') === 'true';
  });

  // Patient profile state
  const [currentProfile, setCurrentProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('curahealth_patient_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        const storedEmail = localStorage.getItem('curahealth_user_email');
        if (storedEmail) {
          parsed.email = storedEmail;
        }
        return parsed;
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

  // Save profile to localStorage
  useEffect(() => {
    try {
      if (currentProfile.name || currentProfile.email) {
        localStorage.setItem('curahealth_patient_profile', JSON.stringify(currentProfile));
      }
    } catch (e) {
      console.error('Error saving profile', e);
    }
  }, [currentProfile]);

  const handleLogin = (profile: UserProfile) => {
    setCurrentProfile(profile);
    setIsAuthenticated(true);
    localStorage.setItem('curahealth_auth', 'true');
    localStorage.setItem('curahealth_user_email', profile.email);
    localStorage.setItem('curahealth_patient_profile', JSON.stringify(profile));
    saveUserProfileToFirestore(profile);
    setCurrentView('front');
  };

  const handleSignOut = () => {
    logOutFromFirebase();
    setIsAuthenticated(false);
    localStorage.removeItem('curahealth_auth');
    localStorage.removeItem('curahealth_patient_profile');
    localStorage.removeItem('curahealth_user_email');
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

  // If user is not signed in, show simple Sign In / Sign Up screen
  if (!isAuthenticated) {
    return (
      <AuthScreen
        onLogin={handleLogin}
        onContinueAsGuest={() => {
          setIsAuthenticated(true);
          localStorage.setItem('curahealth_auth', 'true');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Simple Header */}
      <Header
        currentProfile={currentProfile}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenDoctors={() => setCurrentView('doctors')}
        onGoHome={() => setCurrentView('front')}
        onSignOut={handleSignOut}
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

      {/* Simple Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-5 mt-8 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MediMitra • Digital Medical Companion & Doctor Referral</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-teal-600 hover:underline cursor-pointer"
            >
              Switch Profile
            </button>
            <span>•</span>
            <span className="text-slate-500 font-semibold">Emergency: 112 / 911</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
