import React, { useState } from 'react';
import { 
  X, 
  User 
} from 'lucide-react';
import { UserProfile, AgeCategory, BiologicalSex } from '../types/medical';

import { saveUserProfileToFirestore } from '../services/firebase';

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
  const [name, setName] = useState(currentProfile.name);
  const [ageCategory, setAgeCategory] = useState<AgeCategory>(currentProfile.ageCategory);
  const [sex, setSex] = useState<BiologicalSex>(currentProfile.sex);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      id: currentProfile.id || `user-${Date.now()}`,
      name: name.trim() || 'Patient',
      email: currentProfile.email || 'patient@curahealth.local',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-700 to-teal-800 text-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Edit Patient Information</h2>
            <p className="text-xs text-teal-100/90">Update who is receiving checkup care</p>
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
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Name of the Patient <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Patient Name"
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Who is this for?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'child', label: 'Kid / Child', icon: '🧒' },
                  { id: 'adult', label: 'Adult', icon: '🧑' },
                  { id: 'senior', label: 'Old Person', icon: '👴' }
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setAgeCategory(c.id as AgeCategory)}
                    className={`py-2.5 text-center text-xs font-bold rounded-xl border-2 transition-all cursor-pointer ${
                      ageCategory === c.id
                        ? 'bg-teal-50 border-teal-600 text-teal-950 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-base mb-0.5">{c.icon}</span>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Gender
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSex('female')}
                  className={`py-2.5 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer ${
                    sex === 'female'
                      ? 'bg-teal-50 border-teal-600 text-teal-950 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Woman / Female
                </button>
                <button
                  type="button"
                  onClick={() => setSex('male')}
                  className={`py-2.5 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer ${
                    sex === 'male'
                      ? 'bg-teal-50 border-teal-600 text-teal-950 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Man / Male
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors cursor-pointer"
              >
                Save Details
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
