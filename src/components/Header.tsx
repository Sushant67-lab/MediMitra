import React from 'react';
import { 
  MapPin, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { UserProfile } from '../types/medical';
import { MediMitraLogo } from './MediMitraLogo';

interface HeaderProps {
  currentProfile: UserProfile;
  onOpenAuth: () => void;
  onOpenDoctors: () => void;
  onGoHome: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProfile,
  onOpenAuth,
  onOpenDoctors,
  onGoHome,
  onSignOut
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-teal-100/80 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title with new MediMitra Logo */}
          <div 
            onClick={onGoHome}
            className="cursor-pointer group"
          >
            <MediMitraLogo size="sm" showTagline />
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Firebase Live Database Badge */}
            <div 
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-800"
              title="Realtime Firebase Firestore: medimitra-3be2c"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium">Firebase Connected</span>
            </div>

            {/* Find Doctors Button */}
            <button
              onClick={onOpenDoctors}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>Nearest Doctors</span>
            </button>

            {/* Active User Profile Pill */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-xs font-medium transition-colors cursor-pointer"
              title="Click to edit patient details (Synced with Firebase)"
            >
              <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-medium text-[11px]">
                {currentProfile.name ? currentProfile.name.charAt(0).toUpperCase() : 'P'}
              </div>
              <span className="font-medium text-slate-800 max-w-[90px] truncate">
                {currentProfile.name ? currentProfile.name.split(' ')[0] : 'Patient'}
              </span>
              <span className="text-[10px] text-slate-500 capitalize hidden sm:inline font-normal">
                ({currentProfile.ageCategory === 'child' ? 'Kid' : currentProfile.ageCategory === 'senior' ? 'Old' : 'Adult'})
              </span>
            </button>

            {/* Sign Out / Switch */}
            <button
              onClick={onSignOut}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Sign Out / Switch Account"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
