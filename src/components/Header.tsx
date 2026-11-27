import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  LogOut,
  Cpu,
  Wifi,
  WifiOff,
  X,
  Sun,
  Moon,
  UserCheck
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
import { ThemeToggle } from './ThemeToggle';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
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
  const { isDark, toggleTheme } = useTheme();
  const ui = getAppStrings(language);
  const displayName = currentProfile.name ? currentProfile.name.split(' ')[0] : ui.patientWord;
  const avatarChar = (currentProfile.name || ui.patientWord).charAt(0).toUpperCase();

  const [deviceInfo, setDeviceInfo] = useState<DispenserDevice | null>(null);
  const [, setFreshnessTick] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

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

  const portalTarget = typeof document !== 'undefined' ? document.body : null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-teal-100/80 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-5xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between gap-2 h-16">
          {/* Brand Logo & Title */}
          <div 
            onClick={onGoHome}
            className="cursor-pointer group shrink-0"
          >
            <MediMitraLogo size="sm" showTagline />
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            {/* Desktop Navigation Controls (>= md) */}
            <div className="hidden md:flex items-center gap-2">
              {/* Find Doctors Button */}
              <button
                type="button"
                onClick={onOpenDoctors}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/60 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>{t.nearestDoctors}</span>
              </button>

              {/* IoT Dispenser Hardware Setup Button (Authorized Operator Only) */}
              {onOpenHardwareGuide && (
                <button
                  type="button"
                  onClick={onOpenHardwareGuide}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-teal-800 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/70 border border-teal-200 dark:border-teal-800/80 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  title={ui.esp32DispenserTooltip}
                >
                  <Cpu className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
                  <span>{ui.esp32DispenserBtn}</span>
                </button>
              )}
            </div>

            {/* Active User Profile Pill (Always visible on Mobile & Desktop) */}
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 sm:gap-2 pl-1.5 pr-2.5 sm:pl-2 sm:pr-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-medium transition-colors cursor-pointer shrink-0 min-h-[34px]"
              title={t.editPatient}
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-medium text-[10px] sm:text-[11px] shrink-0">
                {avatarChar}
              </div>
              <span className="font-medium text-slate-800 dark:text-slate-100 max-w-[74px] sm:max-w-[100px] truncate">
                {displayName}
              </span>
            </button>

            {/* Theme Toggle (Desktop >= md) */}
            <div className="hidden md:flex shrink-0">
              <ThemeToggle variant="surface" />
            </div>

            {/* Language Selector (Always visible on Mobile & Desktop) */}
            <LanguageSelector variant="light" />

            {/* Desktop ESP32 Connection Status & Sign Out (>= md) */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onOpenHardwareGuide}
                disabled={!onOpenHardwareGuide}
                title={connectionTooltip}
                aria-label={connectionTooltip}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                  onOpenHardwareGuide ? 'cursor-pointer' : 'cursor-default'
                } ${
                  isEspOnline
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/70'
                    : 'bg-rose-50/80 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80 hover:bg-rose-100/80 dark:hover:bg-rose-900/60'
                }`}
              >
                {isEspOnline ? (
                  <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                <span>
                  {isEspOnline ? ui.esp32ConnectedShort : ui.esp32OfflineShort}
                </span>
              </button>

              <button
                type="button"
                onClick={onSignOut}
                className="p-1.5 rounded-lg text-slate-400 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer shrink-0"
                title={t.signOut}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Animated Mobile Hamburger Menu Button (< md) */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shrink-0 min-w-[38px] min-h-[38px] flex items-center justify-center touch-manipulation"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <div className="w-4 h-3.5 flex flex-col justify-between items-center relative">
                <motion.span
                  animate={isMobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="w-4 h-0.5 rounded-full bg-current origin-center block"
                />
                <motion.span
                  animate={isMobileMenuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="w-4 h-0.5 rounded-full bg-current block"
                />
                <motion.span
                  animate={isMobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="w-4 h-0.5 rounded-full bg-current origin-center block"
                />
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Animated Mobile Side Hamburger Drawer (< md) */}
      {portalTarget &&
        createPortal(
          <AnimatePresence>
            {isMobileMenuOpen && (
              <div className="md:hidden fixed inset-0 z-[160]">
                {/* Fading Backdrop */}
                <motion.div
                  key="mobile-drawer-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
                />

                {/* Sliding Side Drawer Panel */}
                <motion.aside
                  key="mobile-drawer-panel"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'tween', duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
                  className="fixed inset-y-0 right-0 w-[295px] max-w-[85vw] rounded-l-3xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-y-auto"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Navigation menu"
                >
                  {/* Drawer Header */}
                  <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                    <MediMitraLogo size="sm" />
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center touch-manipulation"
                      aria-label="Close menu"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>

                  {/* Patient Summary Card */}
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-semibold text-sm shrink-0">
                          {avatarChar}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {currentProfile.name || ui.patientWord}
                          </p>
                          {currentProfile.email && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {currentProfile.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onOpenAuth();
                        }}
                        className="p-2 rounded-2xl text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/60 transition-colors cursor-pointer shrink-0"
                        title={t.editPatient}
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Drawer Navigation Items */}
                  <nav className="p-3.5 space-y-2.5">
                    {/* Nearest Doctors */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenDoctors();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-800 dark:hover:text-teal-300 border border-slate-200/90 dark:border-slate-800 transition-colors cursor-pointer touch-manipulation"
                    >
                      <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>{t.nearestDoctors}</span>
                    </button>

                    {/* ESP32 Dispenser (Shown ONLY when operator email & password verified) */}
                    {onOpenHardwareGuide && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onOpenHardwareGuide();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-teal-800 dark:text-teal-200 bg-teal-50/80 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/70 border border-teal-200 dark:border-teal-800/80 transition-colors cursor-pointer touch-manipulation"
                      >
                        <Cpu className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
                        <span>{ui.esp32DispenserBtn}</span>
                      </button>
                    )}

                    {/* Light / Dark Theme Toggle */}
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 transition-colors cursor-pointer touch-manipulation"
                    >
                      <div className="flex items-center gap-3">
                        {isDark ? (
                          <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <Moon className="w-4 h-4 text-slate-600 shrink-0" />
                        )}
                        <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {isDark ? 'Dark' : 'Light'}
                      </span>
                    </button>

                    {/* ESP32 Live Connection Status */}
                    <button
                      type="button"
                      disabled={!onOpenHardwareGuide}
                      onClick={() => {
                        if (!onOpenHardwareGuide) return;
                        setIsMobileMenuOpen(false);
                        onOpenHardwareGuide();
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold border transition-colors touch-manipulation ${
                        onOpenHardwareGuide ? 'cursor-pointer' : 'cursor-default'
                      } ${
                        isEspOnline
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80'
                          : 'bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isEspOnline ? (
                          <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <WifiOff className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                        )}
                        <span>ESP32 Status</span>
                      </div>
                      <span className="text-xs font-bold">
                        {isEspOnline ? ui.esp32ConnectedShort : ui.esp32OfflineShort}
                      </span>
                    </button>

                    {/* Log Out / Sign Out */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onSignOut();
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-800/70 transition-colors cursor-pointer touch-manipulation"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>{t.signOut}</span>
                      </button>
                    </div>
                  </nav>
                </motion.aside>
              </div>
            )}
          </AnimatePresence>,
          portalTarget
        )}
    </header>
  );
};
