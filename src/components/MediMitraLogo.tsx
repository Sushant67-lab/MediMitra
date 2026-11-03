import React from 'react';

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
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  }[size];

  const textSize = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  }[size];

  const logoUrl = `${import.meta.env.BASE_URL || './'}assets/aistudio/image_8f9dd967.png`.replace(/\/\//g, '/');

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official User Healthcare Emblem */}
      <div className={`relative ${iconDimensions} rounded-2xl overflow-hidden flex items-center justify-center shrink-0 shadow-xs ring-1 ring-teal-200/50 bg-white`}>
        <img 
          src={logoUrl} 
          alt="MediMitra Logo" 
          className="w-full h-full object-contain p-0.5 hover:scale-105 transition-transform" 
        />
      </div>

      {/* Brand Wordmark */}
      {!imageOnly && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-tight">
            <span className={`font-semibold tracking-tight text-slate-900 ${textSize}`}>
              Medi<span className="text-teal-600 font-semibold">Mitra</span>
            </span>
            {showBadge && (
              <span className="text-[10px] font-medium bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200/70 hidden sm:inline-block">
                Your Health Friend
              </span>
            )}
          </div>
          {showTagline && (
            <p className="text-[11px] text-slate-500 font-normal leading-tight mt-0.5">
              Aapka Digital Swasthya Saathi
            </p>
          )}
        </div>
      )}
    </div>
  );
};
