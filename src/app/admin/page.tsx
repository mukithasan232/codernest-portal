import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import KanbanBoard from '@/components/admin/KanbanBoard';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  TrendingUp, Users, Image as ImageIcon, Briefcase,
  LayoutDashboard, BookOpen, DollarSign, Mail,
  ArrowUpRight, Layers
} from 'lucide-react';

const QUICK_LINKS = [
  { href: '/admin/cms/blog',         icon: BookOpen,       label: 'Blog Posts',     color: 'text-blue-500 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-400/10' },
  { href: '/admin/cms/case-studies', icon: Layers,         label: 'Case Studies',   color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-400/10' },
  { href: '/admin/cms/pricing',      icon: DollarSign,     label: 'Pricing',        color: 'text-green-500 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-400/10' },
  { href: '/admin/image-orders',     icon: ImageIcon,      label: 'Image Orders',   color: 'text-pink-500 dark:text-pink-400',   bg: 'bg-pink-50 dark:bg-pink-400/10' },
  { href: '/admin/projects',         icon: Briefcase,      label: 'Projects',       color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-400/10' },
  { href: '/admin/invoices',         icon: DollarSign,     label: 'Invoices',       color: 'text-cyan-500 dark:text-cyan-400',   bg: 'bg-cyan-50 dark:bg-cyan-400/10' },
];

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR')) {
    redirect('/');
  }

  const [totalLeads, totalUsers, pendingOrders, openProjects] = await Promise.all([
    prisma.lead.count(),
    prisma.user.count(),
    prisma.imageOrder.count(),
    prisma.project.count(),
  ]);

  const statCards = [
    { label: 'Total Leads',    value: totalLeads,    icon: Mail,       color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-400/10' },
    { label: 'Total Revenue',  value: '$45,230',     icon: DollarSign, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-400/10' },
    { label: 'Total Users',    value: totalUsers,    icon: Users,      color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-400/10' },
    { label: 'Open Projects',  value: openProjects,  icon: Briefcase,  color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-400/10' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Agency Command Center</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time overview of leads, orders, and performance.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/cms" className="px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition flex items-center gap-2 shadow-sm">
            <LayoutDashboard className="w-4 h-4" /> CMS
          </Link>
          <Link href="/admin/image-orders" className="px-4 py-2 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-500 transition flex items-center gap-2 shadow-sm">
            <ImageIcon className="w-4 h-4" /> Image Orders
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${s.bg}`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_LINKS.map(link => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 p-4 flex flex-col items-center gap-2 hover:border-blue-500/50 dark:hover:border-white/20 hover:scale-[1.02] transition-all text-center group shadow-sm"
              >
                <div className={`w-10 h-10 rounded-xl ${link.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${link.color}`} />
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Kanban Board */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Leads Pipeline</h2>
          <Link href="/admin/leads" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            Full view <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <KanbanBoard />
      </div>
    </div>
  );
}
