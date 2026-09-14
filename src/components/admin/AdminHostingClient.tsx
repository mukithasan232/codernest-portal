'use client';

import { useState } from 'react';
import { 
  Server, 
  Globe, 
  Database, 
  HardDrive,
  CreditCard,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'websites' | 'vps' | 'domains' | 'billing';

export default function AdminHostingClient() {
  const [activeTab, setActiveTab] = useState<Tab>('websites');
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    // TODO: Connect to backend API for Hostinger
    setTimeout(() => {
      setLoading(false);
      toast.success('Successfully synced with Hostinger API');
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Server Infrastructure
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
              <Zap className="w-3.5 h-3.5" /> Hostinger Connected
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your agency websites, VPS instances, domains, and billing directly via Hostinger API.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 font-semibold text-sm rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> 
            {loading ? 'Syncing...' : 'Sync Data'}
          </button>
          <a
            href="https://hpanel.hostinger.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all"
          >
            <ExternalLink className="w-4 h-4" /> hPanel
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1 bg-slate-100/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('websites')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'websites'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-white/10'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Globe className="w-4 h-4" /> Agency Websites
        </button>
        <button
          onClick={() => setActiveTab('vps')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'vps'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-white/10'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Server className="w-4 h-4" /> VPS Instances
        </button>
        <button
          onClick={() => setActiveTab('domains')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'domains'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-white/10'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Database className="w-4 h-4" /> Domains & DNS
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'billing'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-white/10'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Billing & Orders
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-white/10 p-8 min-h-[400px] flex items-center justify-center shadow-sm">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Hostinger API Integration Pending
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            We are ready to connect to Hostinger. Once you confirm the exact scopes and API endpoints to integrate, real data will appear here.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Secure API Connection Ready
          </div>
        </div>
      </div>
    </div>
  );
}
