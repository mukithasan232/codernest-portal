'use client';

/**
 * Admin Command Center — Main Dashboard
 * Real-time stats + Kanban leads board + quick links
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import KanbanBoard from '@/components/admin/KanbanBoard';
import Link from 'next/link';
import {
  TrendingUp, Users, Image as ImageIcon, Briefcase,
  LayoutDashboard, BookOpen, DollarSign, Mail,
  ArrowUpRight, Layers
} from 'lucide-react';

interface Stats {
  totalLeads: number;
  totalUsers: number;
  pendingOrders: number;
  openProjects: number;
}

const QUICK_LINKS = [
  { href: '/admin/cms/blog',         icon: BookOpen,       label: 'Blog Posts',     color: 'text-blue-400',   bg: 'bg-blue-400/10' },
  { href: '/admin/cms/case-studies', icon: Layers,         label: 'Case Studies',   color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { href: '/admin/cms/pricing',      icon: DollarSign,     label: 'Pricing',        color: 'text-green-400',  bg: 'bg-green-400/10' },
  { href: '/admin/image-orders',     icon: ImageIcon,      label: 'Image Orders',   color: 'text-pink-400',   bg: 'bg-pink-400/10' },
  { href: '/admin/projects',         icon: Briefcase,      label: 'Projects',       color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { href: '/admin/invoices',         icon: DollarSign,     label: 'Invoices',       color: 'text-cyan-400',   bg: 'bg-cyan-400/10' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalLeads: 0, totalUsers: 0, pendingOrders: 0, openProjects: 0 });
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      const [{ count: leadsCount }, { count: usersCount }, { count: ordersCount }, { count: projectsCount }] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('imageOrders').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
      ]);
      setStats({
        totalLeads: leadsCount ?? 0,
        totalUsers: usersCount ?? 0,
        pendingOrders: ordersCount ?? 0,
        openProjects: projectsCount ?? 0,
      });
    };
    fetchStats();
  }, [supabase]);

  const statCards = [
    { label: 'Total Leads',    value: stats.totalLeads,    icon: Mail,       color: 'text-blue-400',   bg: 'bg-blue-400/10' },
    { label: 'Total Users',    value: stats.totalUsers,    icon: Users,      color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Image Orders',   value: stats.pendingOrders, icon: ImageIcon,  color: 'text-pink-400',   bg: 'bg-pink-400/10' },
    { label: 'Open Projects',  value: stats.openProjects,  icon: Briefcase,  color: 'text-green-400',  bg: 'bg-green-400/10' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Agency Command Center</h1>
          <p className="text-slate-400 mt-1">Real-time overview of leads, orders, and performance.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/cms" className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-white hover:bg-white/10 transition flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" /> CMS
          </Link>
          <Link href="/admin/image-orders" className="px-4 py-2 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-500 transition flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Image Orders
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass p-5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${s.bg}`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{s.label}</p>
                  <p className="text-2xl font-extrabold text-white">{s.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_LINKS.map(link => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="glass rounded-2xl border border-white/10 p-4 flex flex-col items-center gap-2 hover:border-white/20 hover:scale-[1.02] transition-all text-center group"
              >
                <div className={`w-10 h-10 rounded-xl ${link.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${link.color}`} />
                </div>
                <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Kanban Board */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Leads Pipeline</h2>
          <Link href="/admin/leads" className="text-sm text-blue-400 hover:underline flex items-center gap-1">
            Full view <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <KanbanBoard />
      </div>
    </div>
  );
}
