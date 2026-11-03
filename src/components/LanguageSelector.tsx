import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage, LanguageCode } from '../context/LanguageContext';

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
  const { language, setLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentOption = languages.find(l => l.code === language) || languages[0];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const buttonStyles = {
    light: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs',
    dark: 'bg-teal-900/60 hover:bg-teal-900/80 text-teal-100 border border-teal-500/30 shadow-xs backdrop-blur-xs',
    transparent: 'hover:bg-slate-100 text-slate-700 border border-transparent'
  }[variant];

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500/30 ${buttonStyles}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Choose Language / भाषा चुनें"
      >
        <Globe className={`w-3.5 h-3.5 ${variant === 'dark' ? 'text-teal-300' : 'text-teal-600'}`} />
        <span className="text-xs font-semibold">{currentOption.nativeName}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${variant === 'dark' ? 'text-teal-300' : 'text-slate-400'}`} />
      </button>

      {isOpen && (
        <div 
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150`}
          role="menu"
        >
          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Select Language</span>
            <span className="text-teal-600">भाषा</span>
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
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
                      ? 'bg-teal-50 text-teal-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50 font-medium'
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
                    <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
