import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'surface' | 'glass' | 'video';
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'surface',
  showLabel = false,
  className = ''
}) => {
  const { isDark, toggleTheme } = useTheme();

  const label = isDark ? 'Light' : 'Dark';
  const title = isDark ? 'Switch to Light theme' : 'Switch to Dark theme';

  const variantClasses =
    variant === 'glass'
      ? 'bg-white/15 hover:bg-white/25 border border-white/25 text-white backdrop-blur-xs'
      : variant === 'video'
      ? isDark
        ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300'
        : 'bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700'
      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-700';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={title}
      aria-label={title}
      aria-pressed={isDark}
      className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${variantClasses} ${className}`}
    >
      {isDark ? (
        <Sun className={`w-3.5 h-3.5 shrink-0 ${variant === 'glass' ? 'text-amber-200' : 'text-amber-400'}`} />
      ) : (
        <Moon className={`w-3.5 h-3.5 shrink-0 ${variant === 'glass' ? 'text-teal-100' : 'text-slate-600'}`} />
      )}
      {showLabel && (
        <span className="hidden sm:inline">{label}</span>
      )}
    </button>
  );
};
