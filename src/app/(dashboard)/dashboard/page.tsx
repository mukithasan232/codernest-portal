'use client';

/**
 * Client Dashboard — Main overview page
 * Shows: projects with milestone progress, image orders, credit counter
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Project, ImageOrder } from '@/types';
import { FREE_IMAGE_CREDIT_LIMIT } from '@/types';
import MilestoneTracker from '@/components/dashboard/MilestoneTracker';
import ImageOrderCard from '@/components/dashboard/ImageOrderCard';
import Link from 'next/link';
import {
  FolderKanban, Image as ImageIcon, DollarSign, Zap,
  ArrowRight, MessageSquare, Plus, Users, FileText
} from 'lucide-react';

export default function DashboardPage() {
  const { appUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [orders, setOrders] = useState<ImageOrder[]>([]);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    if (!appUser) return;

    const fetchData = async () => {
      // Fetch projects
      const { data: projData } = await supabase
        .from('projects')
        .select('*')
        .eq('clientId', appUser.id)
        .order('createdAt', { ascending: false });
      if (projData) setProjects(projData as Project[]);

      // Fetch image orders
      const { data: orderData } = await supabase
        .from('imageOrders')
        .select('*')
        .eq('clientId', appUser.id)
        .order('createdAt', { ascending: false });
      if (orderData) setOrders(orderData as ImageOrder[]);

      // Set credits from appUser directly since it's already fetched by AuthProvider
      setCreditsUsed(appUser.freeCreditsUsed ?? 0);
    };

    fetchData();

    // Setup channels for realtime updates
    const channel = supabase.channel('dashboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `clientId=eq.${appUser.id}` }, (payload) => {
        if (payload.eventType === 'INSERT') setProjects(p => [payload.new as Project, ...p]);
        if (payload.eventType === 'UPDATE') setProjects(p => p.map(x => x.id === payload.new.id ? payload.new as Project : x));
        if (payload.eventType === 'DELETE') setProjects(p => p.filter(x => x.id !== payload.old.id));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'imageOrders', filter: `clientId=eq.${appUser.id}` }, (payload) => {
        if (payload.eventType === 'INSERT') setOrders(o => [payload.new as ImageOrder, ...o]);
        if (payload.eventType === 'UPDATE') setOrders(o => o.map(x => x.id === payload.new.id ? payload.new as ImageOrder : x));
        if (payload.eventType === 'DELETE') setOrders(o => o.filter(x => x.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [appUser, supabase]);

  const activeProjects = projects.filter(p => p.status === 'in-progress');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing');
  const creditsLeft = Math.max(0, FREE_IMAGE_CREDIT_LIMIT - creditsUsed);

  const stats = [
    { label: 'Active Projects', value: activeProjects.length, icon: FolderKanban, color: 'text-blue-400',   bg: 'bg-blue-400/10' },
    { label: 'Completed',       value: completedProjects.length, icon: FolderKanban, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Pending Orders',  value: pendingOrders.length,   icon: ImageIcon,    color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Free Credits',    value: `${creditsLeft}/${FREE_IMAGE_CREDIT_LIMIT}`, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Welcome back, {appUser?.displayName?.split(' ')[0] ?? 'there'}! 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Here&apos;s what&apos;s happening with your work.</p>
        </div>
        <Link
          href="/image-studio/upload"
          id="dashboard-upload-btn"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex-shrink-0 shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)]"
        >
          <Plus className="w-4 h-4" /> New Image Order
        </Link>
      </div>

      {/* Admin App Hub (Visible only to admins) */}
      {(appUser?.role === 'admin' || appUser?.role === 'super_admin') && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">App Workspace</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <Link 
              href="/crm"
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-slate-200 dark:bg-white/5 dark:border-white/10 backdrop-blur-md shadow-sm dark:shadow-lg cursor-pointer hover:-translate-y-2 hover:border-blue-500/50 dark:hover:border-[#00F2FE]/50 transition-all duration-300 group"
            >
              <div className="p-4 rounded-full bg-slate-100 text-blue-600 dark:bg-white/10 dark:text-[#00F2FE] group-hover:scale-110 transition-transform mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">CRM / Leads</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage client pipeline</p>
            </Link>
            
            <Link 
              href="/cms"
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-slate-200 dark:bg-white/5 dark:border-white/10 backdrop-blur-md shadow-sm dark:shadow-lg cursor-pointer hover:-translate-y-2 hover:border-purple-500/50 dark:hover:border-[#A855F7]/50 transition-all duration-300 group"
            >
              <div className="p-4 rounded-full bg-slate-100 text-purple-600 dark:bg-white/10 dark:text-[#A855F7] group-hover:scale-110 transition-transform mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">CMS / Blog</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage public content</p>
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/5 backdrop-blur-md shadow-sm dark:shadow-none">
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Projects with milestones */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Projects</h2>
            <Link href="/dashboard/projects" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeProjects.length === 0 ? (
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 p-10 text-center space-y-3 backdrop-blur-md shadow-sm dark:shadow-none">
              <FolderKanban className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
              <p className="text-slate-500 dark:text-slate-400">No active projects yet.</p>
              <Link href="/pricing" className="inline-block px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 transition-all shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)]">
                Browse Packages
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activeProjects.slice(0, 3).map(project => (
                <div key={project.id} className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 p-5 hover:border-blue-500/50 dark:hover:border-white/20 transition-all shadow-sm dark:shadow-none backdrop-blur-md">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{project.title}</h3>
                      <p className="text-xs text-slate-500 capitalize mt-0.5">{project.type} project</p>
                    </div>
                    <Link href={`/dashboard/projects/${project.id}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      Details
                    </Link>
                  </div>
                  <MilestoneTracker milestones={project.milestones ?? []} projectTitle="" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Image Orders + Support */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Image Orders</h2>
            <Link href="/dashboard/image-orders" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 p-8 text-center space-y-3 backdrop-blur-md shadow-sm dark:shadow-none">
              <ImageIcon className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">No image orders yet.</p>
              <Link href="/image-studio/upload" className="inline-block px-5 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-500 transition-all shadow-[0_0_15px_-3px_rgba(147,51,234,0.4)]">
                Try Image Studio
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 3).map(order => (
                <ImageOrderCard key={order.id} order={order} />
              ))}
            </div>
          )}

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard/invoices" className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 p-4 flex items-center gap-3 hover:border-green-500/50 dark:hover:border-white/20 transition-all shadow-sm dark:shadow-none backdrop-blur-md">
              <DollarSign className="w-5 h-5 text-green-500 dark:text-green-400" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Invoices</span>
            </Link>
            <Link href="/contact" className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 p-4 flex items-center gap-3 hover:border-blue-500/50 dark:hover:border-white/20 transition-all shadow-sm dark:shadow-none backdrop-blur-md">
              <MessageSquare className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Support</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
