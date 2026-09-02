'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Activity, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { AnalyticsResult } from '@/lib/actions/analytics.actions';

// ─── Theme-aware color hook ───────────────────────────────────────────────────
function useDarkMode(): boolean {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // Read initial state from the <html> class (set by next-themes)
    const isDark = document.documentElement.classList.contains('dark');
    setDark(isDark);

    // Watch for changes
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return dark;
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, dark }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 shadow-2xl text-sm">
      <p className="text-gray-500 dark:text-slate-400 font-medium mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600 dark:text-slate-300">{entry.name}:</span>
          <span className="font-bold text-gray-900 dark:text-white">{entry.value.toLocaleString()}</span>
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
    <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[11px] text-gray-500 dark:text-slate-500 font-semibold uppercase tracking-widest">{label}</p>
        <p className="text-xl font-extrabold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AnalyticsChart({ result }: { result: AnalyticsResult }) {
  const dark = useDarkMode();

  if (!result.success) return null;

  const { data, totals } = result;
  const peakDay = data.reduce((a, b) => (b.pageviews > a.pageviews ? b : a), data[0]);

  // Theme-aware colors for Recharts SVG props (Tailwind classes don't apply to SVG)
  const axisTickColor   = dark ? '#64748b' : '#94a3b8';
  const gridColor       = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';
  const axisLineColor   = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const cursorColor     = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-gray-200 dark:border-white/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-base">Website Analytics</h2>
            <p className="text-xs text-gray-500 dark:text-slate-500">Last 7 days — powered by Google Analytics</p>
          </div>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 dark:text-slate-400">
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
          color="bg-blue-500/10 text-blue-500"
        />
        <StatPill
          icon={Activity}
          label="Total Active Users"
          value={totals.activeUsers.toLocaleString()}
          color="bg-emerald-500/10 text-emerald-500"
        />
        <StatPill
          icon={TrendingUp}
          label="Peak Day"
          value={peakDay ? `${peakDay.date} (${peakDay.pageviews.toLocaleString()})` : '—'}
          color="bg-purple-500/10 text-purple-500"
        />
      </div>

      {/* Chart */}
      <div className="p-5 pt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={dark ? 0.25 : 0.15} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorActiveUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={dark ? 0.25 : 0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />

            <XAxis
              dataKey="date"
              tick={{ fill: axisTickColor, fontSize: 11 }}
              axisLine={{ stroke: axisLineColor }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: axisTickColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)}
            />

            <Tooltip
              content={<CustomTooltip dark={dark} />}
              cursor={{ stroke: cursorColor, strokeWidth: 1 }}
            />

            <Area
              type="monotone"
              dataKey="pageviews"
              name="Pageviews"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorPageviews)"
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6', stroke: dark ? '#1e3a5f' : '#dbeafe', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="activeUsers"
              name="Active Users"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorActiveUsers)"
              dot={false}
              activeDot={{ r: 4, fill: '#10b981', stroke: dark ? '#064e3b' : '#d1fae5', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
