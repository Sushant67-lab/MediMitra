import { 
  MapPin, 
  LogOut,
  ChevronDown,
  Cpu
} from 'lucide-react';
import { UserProfile } from '../types/medical';
import { MediMitraLogo } from './MediMitraLogo';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  currentProfile: UserProfile;
  onOpenAuth: () => void;
  onOpenDoctors: () => void;
  onGoHome: () => void;
  onSignOut: () => void;
  onOpenHardwareGuide?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProfile,
  onOpenAuth,
  onOpenDoctors,
  onGoHome,
  onSignOut,
  onOpenHardwareGuide
}) => {
  const { t } = useLanguage();

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

          {/* Navigation Controls (Top Right Side) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Find Doctors Button */}
            <button
              onClick={onOpenDoctors}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>{t.nearestDoctors}</span>
            </button>

            {/* IoT Dispenser Hardware Setup Button */}
            {onOpenHardwareGuide && (
              <button
                onClick={onOpenHardwareGuide}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
                title="ESP32 IoT Dispenser Setup & Schematic"
              >
                <Cpu className="w-3.5 h-3.5 text-teal-700" />
                <span>ESP32 Dispenser</span>
              </button>
            )}

            {/* Active User Profile Pill */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-xs font-medium transition-colors cursor-pointer"
              title={t.editPatient}
            >
              <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-medium text-[11px]">
                {currentProfile.name ? currentProfile.name.charAt(0).toUpperCase() : 'P'}
              </div>
              <span className="font-medium text-slate-800 max-w-[80px] sm:max-w-[100px] truncate">
                {currentProfile.name ? currentProfile.name.split(' ')[0] : 'Patient'}
              </span>
            </button>

            {/* Top Right Language Selector */}
            <LanguageSelector variant="light" />

            {/* Sign Out / Switch */}
            <button
              onClick={onSignOut}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title={t.signOut}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
