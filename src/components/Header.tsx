import { useEffect, useState } from 'react';
import { 
  MapPin, 
  LogOut,
  Cpu,
  Wifi,
  WifiOff
} from 'lucide-react';
import { UserProfile } from '../types/medical';
import { DispenserDevice } from '../types/dispensing';
import { 
  DEFAULT_DEVICE_ID, 
  isDeviceOnlineNow, 
  subscribeToDeviceStatus 
} from '../services/dispensingService';
import { MediMitraLogo } from './MediMitraLogo';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import { getAppStrings } from '../data/appTranslations';

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
  const { t, language } = useLanguage();
  const ui = getAppStrings(language);
  const displayName = currentProfile.name ? currentProfile.name.split(' ')[0] : ui.patientWord;
  const avatarChar = (currentProfile.name || ui.patientWord).charAt(0).toUpperCase();

  const [deviceInfo, setDeviceInfo] = useState<DispenserDevice | null>(null);
  const [, setFreshnessTick] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToDeviceStatus(DEFAULT_DEVICE_ID, (device) => {
      setDeviceInfo(device);
    });
    const timer = window.setInterval(() => {
      setFreshnessTick((prev) => prev + 1);
    }, 5000);

    return () => {
      unsubscribe();
      window.clearInterval(timer);
    };
  }, []);

  const isEspOnline = isDeviceOnlineNow(deviceInfo);
  const connectionTooltip = isEspOnline
    ? [
        ui.esp32OnlineStatus,
        deviceInfo?.wifiSsid ? deviceInfo.wifiSsid : null,
        deviceInfo?.ipAddress ? deviceInfo.ipAddress : null
      ]
        .filter(Boolean)
        .join(' · ')
    : `${ui.esp32OfflineStatus} — ${ui.esp32DispenserTooltip}`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-teal-100/80 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div 
            onClick={onGoHome}
            className="cursor-pointer group"
          >
            <MediMitraLogo size="sm" showTagline />
          </div>

          {/* Navigation Controls (Top Right Side) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Find Doctors Button */}
            <button
              onClick={onOpenDoctors}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>{t.nearestDoctors}</span>
            </button>

            {/* IoT Dispenser Hardware Setup Button (Password Protected) */}
            {onOpenHardwareGuide && (
              <button
                onClick={onOpenHardwareGuide}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title={ui.esp32DispenserTooltip}
              >
                <Cpu className="w-3.5 h-3.5 text-teal-700" />
                <span className="hidden md:inline">{ui.esp32DispenserBtn}</span>
              </button>
            )}

            {/* Active User Profile Pill */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 pl-2 pr-2.5 sm:pr-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-xs font-medium transition-colors cursor-pointer shrink-0"
              title={t.editPatient}
            >
              <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-medium text-[11px]">
                {avatarChar}
              </div>
              <span className="font-medium text-slate-800 max-w-[70px] sm:max-w-[100px] truncate hidden sm:inline">
                {displayName}
              </span>
            </button>

            {/* Top Right Language Selector */}
            <LanguageSelector variant="light" />

            {/* Live ESP32 Connection Indicator Icon (Top Right) */}
            <button
              type="button"
              onClick={onOpenHardwareGuide}
              disabled={!onOpenHardwareGuide}
              title={connectionTooltip}
              aria-label={connectionTooltip}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                onOpenHardwareGuide ? 'cursor-pointer' : 'cursor-default'
              } ${
                isEspOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-rose-50/80 text-rose-700 border-rose-200 hover:bg-rose-100/80'
              }`}
            >
              {isEspOnline ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              )}
              <span>
                {isEspOnline ? ui.esp32ConnectedShort : ui.esp32OfflineShort}
              </span>
            </button>

            {/* Sign Out / Switch */}
            <button
              onClick={onSignOut}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
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
