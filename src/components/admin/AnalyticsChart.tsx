'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, Activity, Eye, AlertTriangle, ExternalLink } from 'lucide-react';
import type { AnalyticsResult } from '@/lib/actions/analytics.actions';

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 shadow-2xl text-sm">
      <p className="text-slate-400 font-medium mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-300">{entry.name}:</span>
          <span className="font-bold text-white">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({
  icon: Icon, label, value, color,
}: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest">{label}</p>
        <p className="text-xl font-extrabold text-white">{value}</p>
      </div>
    </div>
  );
}

// ─── Not Configured Placeholder ───────────────────────────────────────────────
function NotConfigured({ reason }: { reason: 'not_configured' | 'error'; error?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
        <AlertTriangle className="w-7 h-7 text-amber-400" />
      </div>
      <div>
        <h3 className="font-bold text-white text-base mb-1">
          {reason === 'not_configured' ? 'Analytics Not Configured' : 'Analytics Unavailable'}
        </h3>
        <p className="text-slate-400 text-sm max-w-xs">
          {reason === 'not_configured'
            ? 'Add your GA4_PROPERTY_ID and Google Service Account credentials to your environment variables to enable this chart.'
            : 'Could not fetch analytics data. Check your service account credentials and property ID.'}
        </p>
      </div>
      {reason === 'not_configured' && (
        <a
          href="https://console.cloud.google.com/iam-admin/serviceaccounts"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
        >
          Set up Service Account <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AnalyticsChart({ result }: { result: AnalyticsResult }) {
  if (!result.success) {
    return (
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">Website Analytics</h2>
            <p className="text-xs text-slate-500">Last 7 days</p>
          </div>
        </div>
        <NotConfigured reason={result.reason} error={result.error} />
      </div>
    );
  }

  const { data, totals } = result;
  const peakDay = data.reduce((a, b) => (b.pageviews > a.pageviews ? b : a), data[0]);

  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">Website Analytics</h2>
            <p className="text-xs text-slate-500">Last 7 days — powered by Google Analytics</p>
          </div>
        </div>
        {/* Legend dots */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Pageviews
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Active Users
          </span>
        </div>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-5 pb-0">
        <StatPill
          icon={Eye}
          label="Total Pageviews"
          value={totals.pageviews.toLocaleString()}
          color="bg-blue-500/10 text-blue-400"
        />
        <StatPill
          icon={Activity}
          label="Total Active Users"
          value={totals.activeUsers.toLocaleString()}
          color="bg-emerald-500/10 text-emerald-400"
        />
        <StatPill
          icon={TrendingUp}
          label="Peak Day"
          value={peakDay ? `${peakDay.date} (${peakDay.pageviews.toLocaleString()})` : '—'}
          color="bg-purple-500/10 text-purple-400"
        />
      </div>

      {/* Chart */}
      <div className="p-5 pt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorActiveUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="pageviews"
              name="Pageviews"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorPageviews)"
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6', stroke: '#1e3a5f', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="activeUsers"
              name="Active Users"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorActiveUsers)"
              dot={false}
              activeDot={{ r: 4, fill: '#10b981', stroke: '#064e3b', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
