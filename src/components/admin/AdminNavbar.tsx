'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X, Bell, Search, Globe, LogOut, User, Settings as SettingsIcon } from 'lucide-react';
import Image from 'next/image';
import { signOut } from 'next-auth/react';

export default function AdminNavbar() {
  const pathname = usePathname();
  const { appUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Simple breadcrumb generator
  const getBreadcrumb = () => {
    const paths = pathname.split('/').filter(Boolean);
    if (paths.length === 1 && paths[0] === 'admin') return 'Overview';
    if (paths.length > 1) {
      const last = paths[paths.length - 1];
      return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' ');
    }
    return '';
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-[73px] bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-white/5 z-50 flex items-center justify-between px-4 md:px-8">
      
      {/* Left side: Breadcrumb & Mobile Menu Toggle */}
      <div className="flex items-center gap-4">
        <button 
          className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="hidden md:flex items-center gap-2 text-sm font-medium">
          <span className="text-slate-500 dark:text-slate-400">Admin</span>
          <span className="text-slate-400 dark:text-slate-600">/</span>
          <span className="text-slate-900 dark:text-white">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-3 md:gap-5">
        
        <Link 
          href="/" 
          title="Go to Website"
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition rounded-full hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2 text-sm font-semibold"
        >
          <Globe className="w-5 h-5" /> <span className="hidden sm:inline">View Site</span>
        </Link>

        {/* Profile Dropdown */}
        <div className="relative border-l border-slate-200 dark:border-white/10 pl-3 md:pl-5" ref={dropdownRef}>
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 focus:outline-none group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 transition">
                {appUser?.displayName || 'Admin User'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-medium">
                {appUser?.role?.replace('_', ' ') || 'Admin'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700/50 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-950 transition">
              {appUser?.photoURL ? (
                <Image src={appUser.photoURL} alt="Avatar" width={36} height={36} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {appUser?.displayName?.charAt(0) || 'A'}
                </span>
              )}
            </div>
          </button>

          {/* Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl shadow-black/10 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 sm:hidden">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {appUser?.displayName || 'Admin User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {appUser?.email || 'admin@example.com'}
                </p>
              </div>
              
              <Link 
                href="/admin/profile" 
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                <User className="w-4 h-4" /> My Profile
              </Link>
              
              <Link 
                href="/admin/settings" 
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                <SettingsIcon className="w-4 h-4" /> Settings
              </Link>
              
              <div className="h-px bg-slate-100 dark:bg-white/5 my-1"></div>
              
              <button 
                onClick={handleSignOut}
                className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
