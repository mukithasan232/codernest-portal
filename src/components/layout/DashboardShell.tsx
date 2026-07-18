"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Briefcase, 
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
  MessageSquareQuote,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/components/providers/AuthProvider';
import toast from 'react-hot-toast';

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logOut, appUser } = useAuth();
  
  const isAdmin = appUser?.role === 'SUPER_ADMIN' || session.user.role === 'EDITOR';

  const sidebarLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Image Orders', href: '/dashboard/image-orders', icon: Zap },
    { name: 'Invoices', href: '/dashboard/invoices', icon: DollarSign },
    ...(isAdmin ? [
      { name: 'Admin Panel', href: '/admin', icon: Briefcase },
      { name: 'CRM / Leads', href: '/admin/leads', icon: Users },
      { name: 'CMS / Blog', href: '/admin/cms/blog', icon: FileText },
    ] : []),
  ];

  const handleSignOut = async () => {
    await logOut();
    router.refresh();
    router.push('/');
    toast.success('Successfully logged out');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/95 dark:bg-[#0a0f1c]/95 backdrop-blur-2xl border-r border-slate-200 dark:border-white/10 p-4">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-6 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00F2FE] to-[#3B82F6] flex items-center justify-center shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)] dark:shadow-[0_0_15px_-3px_rgba(59,130,246,0.5)]">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">CoderNest</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.name} href={link.href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#00F2FE]/10 to-[#3B82F6]/10 text-blue-600 dark:text-white border border-[#3B82F6]/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent'
                }`}
              >
                <link.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-blue-500 dark:text-[#00F2FE]' : 'text-slate-500 group-hover:text-blue-500 dark:group-hover:text-[#3B82F6]'}`} />
                <span className="font-medium text-sm">{link.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-white/5">
        <button 
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-600 dark:group-hover:text-red-400" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-50 flex overflow-hidden selection:bg-blue-500/30">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 h-screen sticky top-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Overlay */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 dark:bg-[#0a0f1c]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#00F2FE] to-[#3B82F6] flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">CoderNest</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-900/20 dark:bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 z-50 shadow-2xl"
            >
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 z-50"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        {/* Top Header */}
        <header className="hidden lg:flex h-20 items-center justify-between px-8 border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-[#030712]/50 backdrop-blur-md sticky top-0 z-10 transition-colors">
          <div className="flex-1" /> {/* Spacer */}
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {appUser?.displayName || 'User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {appUser?.email || 'admin@codernest.cloud'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#00F2FE] p-[2px]">
                <div className="w-full h-full rounded-full bg-white dark:bg-[#0a0f1c] flex items-center justify-center border border-transparent">
                  <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00F2FE] to-[#3B82F6]">
                    {(appUser?.displayName || 'AD').substring(0, 2).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 p-4 lg:p-8 pt-24 lg:pt-8 relative z-0">
          {/* Ambient Glow for Main Content */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#3B82F6]/5 to-transparent blur-[120px] pointer-events-none -z-10" />
          {children}
        </div>
      </main>
    </div>
  );
}
