'use client';

import { useState, useEffect } from 'react';
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
  Activity,
  AlertTriangle,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'websites' | 'vps' | 'domains' | 'billing';

interface HostingerData {
  websites: any[];
  vps: any[];
  domains: any[];
}

export default function AdminHostingClient() {
  const [activeTab, setActiveTab] = useState<Tab>('websites');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<HostingerData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHostingerData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/hosting');
      const json = await res.json();
      
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to sync with Hostinger');
      }
      
      setData(json.data);
      toast.success('Successfully synced with Hostinger API');
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostingerData();
  }, []);

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
            onClick={fetchHostingerData}
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
          {data?.websites && <span className="ml-1 text-xs bg-slate-200 dark:bg-slate-700 px-1.5 rounded">{data.websites.length}</span>}
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
          {data?.vps && <span className="ml-1 text-xs bg-slate-200 dark:bg-slate-700 px-1.5 rounded">{data.vps.length}</span>}
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
          {data?.domains && <span className="ml-1 text-xs bg-slate-200 dark:bg-slate-700 px-1.5 rounded">{data.domains.length}</span>}
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-white/10 p-8 min-h-[400px] shadow-sm relative">
        {loading && !data && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 rounded-2xl">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        )}

        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto py-12">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              API Connection Error
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {error}
            </p>
            <p className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-left">
              Ensure your <b>HOSTINGER_API_KEY</b> is correct in your environment variables, and that it has the required scopes.
            </p>
          </div>
        ) : !data ? (
           <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto py-12">
              <Activity className="w-8 h-8 text-slate-300 mb-4" />
              <p className="text-slate-500">Initializing Hostinger connection...</p>
           </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'websites' && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Managed Websites</h3>
                {data.websites.length === 0 ? (
                  <p className="text-slate-500 text-sm">No websites found on this account.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.websites.map((site, i) => (
                      <li key={i} className="py-4 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{site.domain || 'Unnamed Website'}</div>
                          <div className="text-xs text-slate-500">Status: {site.status || 'Active'}</div>
                        </div>
                        <a href={`https://${site.domain}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-sm">Visit Site</a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === 'vps' && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">VPS Instances</h3>
                {data.vps.length === 0 ? (
                  <p className="text-slate-500 text-sm">No VPS instances found.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.vps.map((vps, i) => (
                      <li key={i} className="py-4 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{vps.name || 'Unnamed VPS'}</div>
                          <div className="text-xs text-slate-500">IP: {vps.ip || 'Pending'}</div>
                        </div>
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs">Manage</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === 'domains' && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Registered Domains</h3>
                {data.domains.length === 0 ? (
                  <p className="text-slate-500 text-sm">No domains found.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.domains.map((domain, i) => (
                      <li key={i} className="py-4 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{domain.name || 'Unnamed Domain'}</div>
                          <div className="text-xs text-slate-500">Expires: {domain.expires_at || 'Unknown'}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
