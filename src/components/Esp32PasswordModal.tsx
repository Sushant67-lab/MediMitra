import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, Cpu, Eye, EyeOff, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getAppStrings } from '../data/appTranslations';

const ESP32_ACCESS_PASS = '81080731@5@';

interface Esp32PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export const Esp32PasswordModal: React.FC<Esp32PasswordModalProps> = ({
  isOpen,
  onClose,
  onVerified
}) => {
  const { language } = useLanguage();
  const ui = getAppStrings(language);

  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPasswordInput('');
      setShowPassword(false);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ESP32_ACCESS_PASS) {
      setErrorMsg(null);
      setPasswordInput('');
      onVerified();
    } else {
      setErrorMsg(ui.esp32WrongPassword);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-teal-300 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>{ui.esp32LockBadge}</span>
              </span>
              <h2 className="text-base font-semibold leading-tight text-white">
                {ui.esp32LockTitle}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            {ui.esp32LockSubtitle}
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              {ui.esp32PasswordLabel} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-teal-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder={ui.esp32PasswordPlaceholder}
                className="w-full pl-10 pr-10 py-2.5 text-sm font-medium rounded-xl border border-slate-300 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white text-slate-900 placeholder:text-slate-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {ui.cancelBtn}
            </button>
            <button
              type="submit"
              disabled={!passwordInput}
              className="flex-1 py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{ui.esp32UnlockBtn}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
