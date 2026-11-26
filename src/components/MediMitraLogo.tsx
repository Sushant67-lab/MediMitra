import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import hdLogoUrl from '../assets/images/medimitra_hd_logo_1795620816102.jpg';

interface MediMitraLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  imageOnly?: boolean;
  showBadge?: boolean;
}

export const MediMitraLogo: React.FC<MediMitraLogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
  imageOnly = false,
  showBadge = false
}) => {
  const { t } = useLanguage();

  const iconDimensions = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  }[size];

  const textSize = {
    sm: 'text-sm sm:text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  }[size];

  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 select-none ${className}`}>
      {/* High-Resolution MediMitra Emblem */}
      <div className={`relative ${iconDimensions} rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center shrink-0 shadow-xs ring-1 ring-teal-200/50 dark:ring-teal-500/30 bg-white dark:bg-slate-800`}>
        <img
          src={hdLogoUrl}
          alt={t.brandName}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover hover:scale-105 transition-transform"
        />
      </div>

      {/* Brand Wordmark */}
      {!imageOnly && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 leading-tight">
            <span className={`font-semibold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap ${textSize}`}>
              {t.brandName === 'MediMitra' ? (
                <>Medi<span className="text-teal-600 dark:text-teal-400 font-semibold">Mitra</span></>
              ) : (
                t.brandName
              )}
            </span>
            {showBadge && (
              <span className="text-[10px] font-medium bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-200 px-2 py-0.5 rounded-full border border-teal-200/70 dark:border-teal-800 hidden sm:inline-block">
                {t.brandTagline}
              </span>
            )}
          </div>
          {showTagline && (
            <p className={`text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-tight mt-0.5 whitespace-nowrap ${
              size === 'sm' ? 'hidden sm:block' : ''
            }`}>
              {t.brandTagline}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
