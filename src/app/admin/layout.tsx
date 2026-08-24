'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  BarChart3, Users, FileText, LogOut, ShieldCheck,
  Megaphone, Briefcase, Image as ImageIcon, DollarSign,
  LayoutDashboard, Layers, Settings, UserCheck, Zap,
  Activity, Mail
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminNavbar from '@/components/admin/AdminNavbar';

const NAV_ITEMS = [
  { href: '/admin',              icon: BarChart3,       label: 'Overview' },
  { href: '/admin/live-traffic', icon: Activity,        label: 'Live Traffic' },
  { href: '/admin/leads',        icon: Megaphone,       label: 'CRM / Leads' },
  { href: '/admin/email-marketing', icon: Mail,         label: 'Email Campaigns' },
  { href: '/admin/automation',   icon: Zap,             label: 'Automation' },
  { href: '/admin/projects',     icon: Briefcase,       label: 'Projects' },
  { href: '/admin/clients',      icon: UserCheck,       label: 'Clients' },
  { href: '/admin/image-orders', icon: ImageIcon,       label: 'Image Orders' },
  { href: '/admin/invoices',     icon: DollarSign,      label: 'Invoices' },
  { href: '/admin/team',         icon: Users,           label: 'Team Management' },
];

const CMS_ITEMS = [
  { href: '/admin/cms/blog',          icon: FileText, label: 'Blog CMS' },
  { href: '/admin/cms/case-studies',  icon: Layers,   label: 'Portfolio Manager' },
  { href: '/admin/cms/pricing',       icon: DollarSign, label: 'Pricing' },
  { href: '/admin/pages',             icon: LayoutDashboard, label: 'Page Builder' },
  { href: '/admin/media',             icon: ImageIcon, label: 'Media Library' },
  { href: '/admin/settings',          icon: Settings, label: 'Global Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logOut, appUser } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  async function handleLogout() {
    await logOut();
    toast.success('Logged out');
    router.push('/');
  }

  const isEditor = appUser?.role === 'EDITOR';
  
  // Filter CMS items for EDITOR (hide Pricing and Settings)
  const allowedCmsItems = isEditor 
    ? CMS_ITEMS.filter(item => !['Pricing', 'Global Settings'].includes(item.label))
    : CMS_ITEMS;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden pt-[73px]">
      <AdminNavbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-white/5 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col pt-[73px] ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 flex-1 overflow-y-auto">
          {/* Main nav (Hidden for Editors) */}
          {!isEditor && (
            <nav className="space-y-1 mb-6">
              {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                    isActive(href)
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>
          )}

          {/* CMS section */}
          <div>
            <div className="flex items-center gap-2 px-3 mb-2">
              <LayoutDashboard className="w-3.5 h-3.5 text-slate-500 dark:text-slate-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-600">Content CMS</span>
            </div>
            <nav className="space-y-1">
              {allowedCmsItems.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                    isActive(href)
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom */}
        <div className="p-5 border-t border-slate-200 dark:border-white/5 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all">
            <Users className="w-4 h-4" /> Client View
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/5 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-950/80 hidden md:flex flex-col flex-shrink-0">
        <div className="p-5 flex-1 overflow-y-auto">
          {/* Admin badge */}
          <div className="flex items-center gap-2 px-3 py-2.5 mb-6 bg-purple-100 dark:bg-purple-600/10 border border-purple-200 dark:border-purple-500/20 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-widest">Admin Panel</span>
          </div>

          {/* Main nav (Hidden for Editors) */}
          {!isEditor && (
            <nav className="space-y-1 mb-6">
              {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                    isActive(href)
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>
          )}

          {/* CMS section */}
          <div>
            <div className="flex items-center gap-2 px-3 mb-2">
              <LayoutDashboard className="w-3.5 h-3.5 text-slate-500 dark:text-slate-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-600">Content CMS</span>
            </div>
            <nav className="space-y-1">
              {allowedCmsItems.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                    isActive(href)
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom */}
        <div className="p-5 border-t border-slate-200 dark:border-white/5 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all">
            <Users className="w-4 h-4" /> Client View
          </Link>
          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/5 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950">
        {children}
      </main>
    </div>
  );
}
