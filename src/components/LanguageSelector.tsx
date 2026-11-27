import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Globe, ChevronDown, Check, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getAppStrings } from '../data/appTranslations';

interface LanguageSelectorProps {
  variant?: 'light' | 'dark' | 'transparent';
  className?: string;
  align?: 'left' | 'right';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'light',
  className = '',
  align = 'right'
}) => {
  const { language, setLanguage, languages, t } = useLanguage();
  const ui = getAppStrings(language);
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left?: number; right?: number }>({ top: 0, right: 16 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const desktopMenuRef = useRef<HTMLDivElement>(null);

  const currentOption = languages.find(l => l.code === language) || languages[0];

  const updateDesktopPosition = () => {
    if (!buttonRef.current || typeof window === 'undefined') return;
    const rect = buttonRef.current.getBoundingClientRect();
    const top = Math.min(rect.bottom + 6, Math.max(12, window.innerHeight - 360));
    if (align === 'left') {
      setCoords({ top, left: Math.max(12, rect.left) });
    } else {
      setCoords({ top, right: Math.max(12, window.innerWidth - rect.right) });
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    updateDesktopPosition();

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inTrigger = containerRef.current?.contains(target);
      const inMobileMenu = mobileMenuRef.current?.contains(target);
      const inDesktopMenu = desktopMenuRef.current?.contains(target);
      if (!inTrigger && !inMobileMenu && !inDesktopMenu) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleReposition = () => updateDesktopPosition();

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isOpen, align]);

  const buttonStyles = {
    light: 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-100 border border-slate-200/90 dark:border-slate-700 shadow-2xs',
    dark: 'bg-teal-900/60 hover:bg-teal-900/80 text-teal-100 border border-teal-500/30 shadow-xs backdrop-blur-xs',
    transparent: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-transparent'
  }[variant];

  const portalTarget = typeof document !== 'undefined' ? document.body : null;

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500/30 ${buttonStyles}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={t.languageSelect}
      >
        <Globe className={`w-3.5 h-3.5 shrink-0 ${variant === 'dark' ? 'text-teal-300' : 'text-teal-600 dark:text-teal-400'}`} />
        <span className="sm:hidden text-[11px] font-semibold uppercase">{currentOption.code}</span>
        <span className="hidden sm:inline text-xs font-semibold">{currentOption.nativeName}</span>
        <ChevronDown className={`w-3 h-3 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${variant === 'dark' ? 'text-teal-300' : 'text-slate-400 dark:text-slate-400'}`} />
      </button>

      {isOpen && portalTarget && createPortal(
        <>
          {/* Mobile Full-Visibility Language Sheet (< 640px) - Never clipped by parent overflow */}
          <div
            className="sm:hidden fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xs flex items-end justify-center p-3 pb-5"
            onClick={() => setIsOpen(false)}
          >
            <div
              ref={mobileMenuRef}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              role="menu"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/70">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    {ui.selectLanguageHeader} ({languages.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
                  aria-label="Close language selector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 max-h-[75dvh] overflow-y-auto">
                {languages.map((item) => {
                  const isSelected = item.code === language;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        setLanguage(item.code);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-3 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer touch-manipulation ${
                        isSelected
                          ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-500 text-teal-900 dark:text-teal-200 font-semibold shadow-2xs'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium'
                      }`}
                      role="menuitem"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">{item.flag}</span>
                        <div className="flex flex-col min-w-0">
                          <span className="leading-tight truncate">{item.nativeName}</span>
                          {item.nativeName !== item.label && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-400 font-normal truncate">{item.label}</span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Desktop / Tablet Anchored Popover (>= 640px) */}
          <div
            ref={desktopMenuRef}
            style={{
              top: `${coords.top}px`,
              ...(coords.left !== undefined ? { left: `${coords.left}px` } : {}),
              ...(coords.right !== undefined ? { right: `${coords.right}px` } : {})
            }}
            className="hidden sm:block fixed w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 z-[200]"
            role="menu"
          >
            <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <span>{ui.selectLanguageHeader}</span>
            </div>

            <div className="max-h-[75vh] overflow-y-auto py-1">
              {languages.map((item) => {
                const isSelected = item.code === language;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      setLanguage(item.code);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-900 dark:text-teal-200 font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium'
                    }`}
                    role="menuitem"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">{item.flag}</span>
                      <div className="flex flex-col">
                        <span className="leading-tight">{item.nativeName}</span>
                        {item.nativeName !== item.label && (
                          <span className="text-[10px] text-slate-400 font-normal">{item.label}</span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>,
        portalTarget
      )}
    </div>
  );
};
