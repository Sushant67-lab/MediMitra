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
  ChevronRight,
  Pencil
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

            {/* Active User Profile Badge (Display-only on Mobile & Desktop) */}
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 pr-2.5 sm:pl-2 sm:pr-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-medium shrink-0 min-h-[34px] select-none">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-medium text-[10px] sm:text-[11px] shrink-0">
                {avatarChar}
              </div>
              <span className="font-medium text-slate-800 dark:text-slate-100 max-w-[74px] sm:max-w-[100px] truncate">
                {displayName}
              </span>
            </div>

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
              whileTap={{ scale: 0.94 }}
              transition={{ duration: 0.12 }}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="md:hidden relative rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center touch-manipulation"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <div className="w-[18px] h-[14px] flex flex-col justify-between items-end relative">
                <motion.span
                  animate={isMobileMenuOpen ? { rotate: 45, y: 6, width: 18 } : { rotate: 0, y: 0, width: 18 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="h-[2px] rounded-full bg-current origin-center block"
                />
                <motion.span
                  animate={isMobileMenuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                  className="w-[13px] h-[2px] rounded-full bg-current origin-right block"
                />
                <motion.span
                  animate={isMobileMenuOpen ? { rotate: -45, y: -6, width: 18 } : { rotate: 0, y: 0, width: 18 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="h-[2px] rounded-full bg-current origin-center block"
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
                {/* Fading Scrim Backdrop */}
                <motion.div
                  key="mobile-drawer-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fixed inset-0 bg-slate-950/50"
                />

                {/* Sliding Side Drawer Panel */}
                <motion.aside
                  key="mobile-drawer-panel"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'tween', duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="fixed inset-y-0 right-0 w-[308px] max-w-[86vw] rounded-l-[28px] bg-white dark:bg-slate-900 border-l border-slate-200/70 dark:border-slate-800 shadow-[-20px_0_60px_rgba(15,23,42,0.16)] dark:shadow-[-20px_0_60px_rgba(0,0,0,0.65)] flex flex-col justify-between overflow-hidden will-change-transform"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Navigation menu"
                >
                  <div className="flex-1 overflow-y-auto overscroll-contain">
                    {/* Drawer Header */}
                    <div className="px-5 pt-5 pb-4 flex items-center justify-between">
                      <MediMitraLogo size="sm" />
                      <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 active:scale-95 text-slate-500 dark:text-slate-300 transition-all cursor-pointer flex items-center justify-center touch-manipulation"
                        aria-label="Close menu"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Patient Summary Card */}
                    <div className="mx-4 mb-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-600 to-emerald-600 text-white flex items-center justify-center font-semibold text-sm shadow-xs shrink-0">
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
                        className="w-9 h-9 rounded-xl text-slate-500 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-white dark:hover:bg-slate-700/70 transition-colors cursor-pointer flex items-center justify-center shrink-0 touch-manipulation"
                        title={t.editPatient}
                        aria-label={t.editPatient}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Clean List Rows */}
                    <nav className="px-4 divide-y divide-slate-100 dark:divide-slate-800/80">
                      {/* Nearest Doctors */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onOpenDoctors();
                        }}
                        className="w-full py-3.5 px-1.5 flex items-center justify-between gap-3 text-left group hover:bg-slate-50/70 dark:hover:bg-slate-800/40 rounded-xl transition-colors cursor-pointer touch-manipulation"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="block text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                              {t.nearestDoctors}
                            </span>
                            <span className="block text-[11px] text-slate-400 dark:text-slate-500 truncate">
                              Clinics & doctors nearby
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors shrink-0" />
                      </button>

                      {/* ESP32 Dispenser (Authorized Operator Only) */}
                      {onOpenHardwareGuide && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            onOpenHardwareGuide();
                          }}
                          className="w-full py-3.5 px-1.5 flex items-center justify-between gap-3 text-left group hover:bg-slate-50/70 dark:hover:bg-slate-800/40 rounded-xl transition-colors cursor-pointer touch-manipulation"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                              <Cpu className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="block text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                                {ui.esp32DispenserBtn}
                              </span>
                              <span className="block text-[11px] text-slate-400 dark:text-slate-500 truncate">
                                Wiring & firmware setup
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors shrink-0" />
                        </button>
                      )}

                      {/* Light / Dark Theme Switch Row */}
                      <button
                        type="button"
                        onClick={toggleTheme}
                        role="switch"
                        aria-checked={isDark}
                        className="w-full py-3.5 px-1.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/70 dark:hover:bg-slate-800/40 rounded-xl transition-colors cursor-pointer touch-manipulation"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <span className="block text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                              Appearance
                            </span>
                            <span className="block text-[11px] text-slate-400 dark:text-slate-500 truncate">
                              {isDark ? 'Dark mode active' : 'Light mode active'}
                            </span>
                          </div>
                        </div>

                        {/* Smooth Switch Track */}
                        <div
                          className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 flex items-center shrink-0 ${
                            isDark ? 'bg-teal-600 justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'
                          }`}
                        >
                          <motion.span
                            layout
                            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                            className="w-5 h-5 rounded-full bg-white shadow-xs block"
                          />
                        </div>
                      </button>

                      {/* ESP32 Hardware Status Row */}
                      <button
                        type="button"
                        disabled={!onOpenHardwareGuide}
                        onClick={() => {
                          if (!onOpenHardwareGuide) return;
                          setIsMobileMenuOpen(false);
                          onOpenHardwareGuide();
                        }}
                        className={`w-full py-3.5 px-1.5 flex items-center justify-between gap-3 text-left rounded-xl transition-colors touch-manipulation ${
                          onOpenHardwareGuide
                            ? 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer'
                            : 'cursor-default'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isEspOnline
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {isEspOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <span className="block text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                              Dispenser Unit
                            </span>
                            <span className="block text-[11px] text-slate-400 dark:text-slate-500 truncate">
                              {deviceInfo?.wifiSsid || 'Hardware telemetry'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isEspOnline ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span
                            className={`text-xs font-semibold ${
                              isEspOnline
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {isEspOnline ? ui.esp32ConnectedShort : ui.esp32OfflineShort}
                          </span>
                        </div>
                      </button>
                    </nav>
                  </div>

                  {/* Pinned Clean Bottom Action: Log Out */}
                  <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/35 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors cursor-pointer touch-manipulation"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>{t.signOut}</span>
                    </button>
                  </div>
                </motion.aside>
              </div>
            )}
          </AnimatePresence>,
          portalTarget
        )}
    </header>
  );
};
