'use client';

import { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Clock, MapPin, Users, Bot, User } from 'lucide-react';

interface BlogAnalyticsModalProps {
  slug: string;
  onClose: () => void;
}

interface AnalyticsData {
  views: number;
  trend: number;
  averageTimeSpent: number;
  topLocations: { name: string; count: number }[];
  recentVisitors: {
    id: string;
    timestamp: string;
    isBot: boolean;
    location: string;
  }[];
}

export default function BlogAnalyticsModal({ slug, onClose }: BlogAnalyticsModalProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/admin/blog-stats/${slug}`);
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [slug]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Analytics: /{slug}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 text-sm font-medium">Crunching real-time data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500 bg-red-50 dark:bg-red-500/10 rounded-xl">
              <p className="font-semibold">{error}</p>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Top Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Users className="w-3.5 h-3.5" /> Total Real Views
                  </span>
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white leading-none">
                      {data.views.toLocaleString()}
                    </span>
                    <div className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-md mb-1 ${data.trend >= 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400' : 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                      {data.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(data.trend)}%
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Clock className="w-3.5 h-3.5" /> Avg Time Spent
                  </span>
                  <div className="text-4xl font-extrabold text-slate-900 dark:text-white leading-none">
                    {formatTime(data.averageTimeSpent)}
                  </div>
                </div>
              </div>

              {/* Two columns for insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Locations */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" /> Top Locations
                  </h3>
                  {data.topLocations.length > 0 ? (
                    <ul className="space-y-2">
                      {data.topLocations.map((loc, i) => (
                        <li key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-white/5 text-sm">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{loc.name}</span>
                          <span className="text-slate-500 font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded shadow-sm">{loc.count}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No location data yet.</p>
                  )}
                </div>

                {/* Recent Visitors */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-400" /> Recent Visitors
                  </h3>
                  {data.recentVisitors.length > 0 ? (
                    <ul className="space-y-2">
                      {data.recentVisitors.map((v) => (
                        <li key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-white/5 text-sm">
                          <div className="flex items-center gap-2">
                            {v.isBot ? (
                              <div title="Bot traffic"><Bot className="w-4 h-4 text-slate-400" /></div>
                            ) : (
                              <div title="Real user"><User className="w-4 h-4 text-blue-500" /></div>
                            )}
                            <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                              {v.location}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No recent visitors.</p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
