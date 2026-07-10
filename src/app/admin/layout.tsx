'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  BarChart3, Users, FileText, LogOut, ShieldCheck,
  Megaphone, Briefcase, Image as ImageIcon, DollarSign,
  LayoutDashboard, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { href: '/admin',              icon: BarChart3,       label: 'Overview' },
  { href: '/admin/leads',        icon: Megaphone,       label: 'Leads' },
  { href: '/admin/projects',     icon: Briefcase,       label: 'Projects' },
  { href: '/admin/image-orders', icon: ImageIcon,       label: 'Image Orders' },
  { href: '/admin/invoices',     icon: DollarSign,      label: 'Invoices' },
];

const CMS_ITEMS = [
  { href: '/admin/cms/blog',          icon: FileText, label: 'Blog Posts' },
  { href: '/admin/cms/case-studies',  icon: Layers,   label: 'Case Studies' },
  { href: '/admin/cms/pricing',       icon: DollarSign, label: 'Pricing' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logOut } = useAuth();
  const router = useRouter();

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  async function handleLogout() {
    await logOut();
    toast.success('Logged out');
    router.push('/');
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden pt-[73px]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-slate-950/80 hidden md:flex flex-col flex-shrink-0">
        <div className="p-5 flex-1 overflow-y-auto">
          {/* Admin badge */}
          <div className="flex items-center gap-2 px-3 py-2.5 mb-6 bg-purple-600/10 border border-purple-500/20 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Admin Panel</span>
          </div>

          {/* Main nav */}
          <nav className="space-y-1 mb-6">
            {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                  isActive(href)
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            ))}
          </nav>

          {/* CMS section */}
          <div>
            <div className="flex items-center gap-2 px-3 mb-2">
              <LayoutDashboard className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Content CMS</span>
            </div>
            <nav className="space-y-1">
              {CMS_ITEMS.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                    isActive(href)
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
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
        <div className="p-5 border-t border-white/5 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <Users className="w-4 h-4" /> Client View
          </Link>
          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8 bg-slate-950">
        {children}
      </main>
    </div>
  );
}
