'use client';

import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Avoid hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/5 animate-pulse" />
    );
  }

  const getIcon = () => {
    if (theme === 'light') return <Sun className="w-5 h-5 text-amber-500" />;
    if (theme === 'dark') return <Moon className="w-5 h-5 text-blue-400" />;
    return <Monitor className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors"
        aria-label="Toggle theme"
      >
        {getIcon()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="p-1 flex flex-col gap-1">
            <button
              onClick={() => { setTheme('light'); setIsOpen(false); }}
              className={`flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                theme === 'light' ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <Sun className="w-4 h-4" /> Light
            </button>
            <button
              onClick={() => { setTheme('dark'); setIsOpen(false); }}
              className={`flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                theme === 'dark' ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <Moon className="w-4 h-4" /> Dark
            </button>
            <button
              onClick={() => { setTheme('system'); setIsOpen(false); }}
              className={`flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                theme === 'system' ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <Monitor className="w-4 h-4" /> System
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
