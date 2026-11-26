import React, { useState, useEffect } from 'react';
import { 
  X, 
  User 
} from 'lucide-react';
import { UserProfile, AgeCategory, BiologicalSex } from '../types/medical';
import { saveUserProfileToFirestore } from '../services/firebase';
import { useLanguage } from '../context/LanguageContext';
import { getAppStrings } from '../data/appTranslations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onSelectProfile: (profile: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSelectProfile
}) => {
  const { t, language } = useLanguage();
  const ui = getAppStrings(language);
  const [name, setName] = useState(currentProfile.name);
  const [ageCategory, setAgeCategory] = useState<AgeCategory>(currentProfile.ageCategory);
  const [sex, setSex] = useState<BiologicalSex>(currentProfile.sex);

  useEffect(() => {
    if (isOpen) {
      setName(currentProfile.name);
      setAgeCategory(currentProfile.ageCategory);
      setSex(currentProfile.sex);
    }
  }, [isOpen, currentProfile]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      id: currentProfile.id || `user-${Date.now()}`,
      name: name.trim() || ui.patientWord,
      email: currentProfile.email || 'patient@medimitra.local',
      age: ageCategory === 'child' ? 7 : ageCategory === 'senior' ? 65 : 30,
      ageCategory,
      sex,
      isPregnantOrNursing: false
    };
    onSelectProfile(updated);
    saveUserProfileToFirestore(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-700 to-teal-800 text-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">{t.editPatient}</h2>
            <p className="text-xs text-teal-100/90">{ui.editPatientInfoSubtitle}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                {t.patientNameLabel} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.patientNamePlaceholder}
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 dark:focus:border-teal-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                {t.whoIsThisFor}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'child', label: t.kidLabel, icon: '🧒' },
                  { id: 'adult', label: t.adultLabel, icon: '🧑' },
                  { id: 'senior', label: t.seniorLabel, icon: '👴' }
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setAgeCategory(c.id as AgeCategory)}
                    className={`py-2.5 text-center text-xs font-bold rounded-xl border-2 transition-all cursor-pointer ${
                      ageCategory === c.id
                        ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-600 dark:border-teal-500 text-teal-950 dark:text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="block text-base mb-0.5">{c.icon}</span>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                {t.genderLabel}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSex('female')}
                  className={`py-2.5 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer ${
                    sex === 'female'
                      ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-600 dark:border-teal-500 text-teal-950 dark:text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {t.femaleLabel}
                </button>
                <button
                  type="button"
                  onClick={() => setSex('male')}
                  className={`py-2.5 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer ${
                    sex === 'male'
                      ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-600 dark:border-teal-500 text-teal-950 dark:text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {t.maleLabel}
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {ui.cancelBtn}
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors cursor-pointer"
              >
                {ui.saveDetailsBtn}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
