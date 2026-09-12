'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  DollarSign, TrendingUp, TrendingDown, Zap, Plus, X,
  CheckCircle2, Circle, Loader2, ArrowUpRight, ArrowDownRight,
  Target, BarChart3, AlertTriangle,
} from 'lucide-react';
import { TransactionType, ExpenseCategory } from '@prisma/client';
import type { DashboardMetrics, MonetizationMilestone } from '@/lib/actions/dashboard-metrics.actions';

// ─── Fetcher ──────────────────────────────────────────────────────────────────

const fetcher = (url: string) => fetch(url).then(r => r.json());

// ─── Helpers ──────────────────────────────────────────────────────────────────

function usd(n: number, compact = false) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: compact && Math.abs(n) >= 1000 ? 0 : 2,
    notation: compact && Math.abs(n) >= 10000 ? 'compact' : 'standard',
  }).format(n);
}

function pct(n: number) {
  return `${n > 0 ? '+' : ''}${n}%`;
}

// ─── Circular Progress Ring ───────────────────────────────────────────────────

function RingProgress({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#3b82f6';

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="currentColor"
          className="text-slate-100 dark:text-white/5" strokeWidth="12" />
        <circle cx="64" cy="64" r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{score}%</span>
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Ready</span>
      </div>
    </div>
  );
}

// ─── Custom Recharts Tooltip ──────────────────────────────────────────────────

function FinancialTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const rev = payload.find((p: any) => p.dataKey === 'revenue')?.value ?? 0;
  const spend = payload.find((p: any) => p.dataKey === 'spend')?.value ?? 0;
  const net = rev - spend;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 shadow-2xl text-sm min-w-[160px]">
      <p className="text-slate-500 dark:text-slate-400 font-semibold mb-2">{label}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Revenue
          </span>
          <span className="font-bold text-slate-900 dark:text-white">{usd(rev)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Ad Spend
          </span>
          <span className="font-bold text-slate-900 dark:text-white">{usd(spend)}</span>
        </div>
        <div className="border-t border-slate-100 dark:border-white/10 pt-1 mt-1 flex justify-between gap-4">
          <span className={`font-semibold ${net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>Net</span>
          <span className={`font-extrabold ${net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{usd(net)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  badge?: React.ReactNode;
}

function KpiCard({ label, value, sub, subColor, icon: Icon, iconBg, iconColor, badge }: KpiCardProps) {
  return (
    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm flex flex-col gap-4 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {badge}
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</p>
        {sub && <p className={`text-xs font-semibold mt-1 ${subColor ?? 'text-slate-400'}`}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Milestone Row ────────────────────────────────────────────────────────────

function MilestoneRow({ m }: { m: MonetizationMilestone }) {
  const progress = Math.min((m.current / m.target) * 100, 100);
  return (
    <div className="flex items-start gap-3">
      {m.achieved
        ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        : <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />
      }
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className={`text-sm font-semibold ${m.achieved ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
            {m.label}
          </p>
          <span className="text-xs text-slate-400 shrink-0 ml-2">{m.current.toLocaleString()} / {m.target.toLocaleString()} {m.unit}</span>
        </div>
        <div className="h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${m.achieved ? 'bg-emerald-500' : 'bg-blue-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Log Revenue Modal ────────────────────────────────────────────────────────

function LogRevenueModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', clientName: '', amount: '', type: 'SOFTWARE_CONTRACT' as TransactionType, notes: '',
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/revenue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      });
      if (!res.ok) throw new Error(await res.text());
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell title="Log Incoming Revenue" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Payment Title *" required>
          <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Node.js Contract – Milestone 1" className={INPUT_CLS} required />
        </FormField>
        <FormField label="Client Name">
          <input value={form.clientName} onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))}
            placeholder="e.g. Acme Corp" className={INPUT_CLS} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Amount (USD) *" required>
            <input type="number" step="0.01" min="0.01" value={form.amount}
              onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              placeholder="500.00" className={INPUT_CLS} required />
          </FormField>
          <FormField label="Category">
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as TransactionType }))} className={INPUT_CLS}>
              {Object.values(TransactionType).map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Notes">
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            rows={2} placeholder="Optional notes..." className={INPUT_CLS} />
        </FormField>
        <SubmitBtn loading={loading} label="Save Revenue" />
      </form>
    </ModalShell>
  );
}

// ─── Log Expense Modal ────────────────────────────────────────────────────────

function LogExpenseModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    campaign: '', category: 'GOOGLE_ADS' as ExpenseCategory, amountSpent: '', clicks: '', impressions: '',
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          amountSpent: parseFloat(form.amountSpent),
          clicks: form.clicks ? parseInt(form.clicks) : 0,
          impressions: form.impressions ? parseInt(form.impressions) : 0,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell title="Log Ad / Marketing Cost" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Campaign Name *" required>
          <input value={form.campaign} onChange={e => setForm(p => ({ ...p, campaign: e.target.value }))}
            placeholder="e.g. US B2B Cold Traffic – Search" className={INPUT_CLS} required />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Amount Spent (USD) *" required>
            <input type="number" step="0.01" min="0.01" value={form.amountSpent}
              onChange={e => setForm(p => ({ ...p, amountSpent: e.target.value }))}
              placeholder="75.00" className={INPUT_CLS} required />
          </FormField>
          <FormField label="Platform">
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as ExpenseCategory }))} className={INPUT_CLS}>
              {Object.values(ExpenseCategory).map(c => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Clicks">
            <input type="number" min="0" value={form.clicks}
              onChange={e => setForm(p => ({ ...p, clicks: e.target.value }))}
              placeholder="0" className={INPUT_CLS} />
          </FormField>
          <FormField label="Impressions">
            <input type="number" min="0" value={form.impressions}
              onChange={e => setForm(p => ({ ...p, impressions: e.target.value }))}
              placeholder="0" className={INPUT_CLS} />
          </FormField>
        </div>
        <SubmitBtn loading={loading} label="Save Expense" />
      </form>
    </ModalShell>
  );
}

// ─── Reusable Modal Shell ─────────────────────────────────────────────────────

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold rounded-xl transition flex items-center justify-center gap-2">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      {label}
    </button>
  );
}

const INPUT_CLS = 'w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition';

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-slate-100 dark:bg-white/5 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 bg-slate-100 dark:bg-white/5 rounded-2xl" />
        <div className="h-72 bg-slate-100 dark:bg-white/5 rounded-2xl" />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ExecutiveOverview() {
  const [showRevModal, setShowRevModal] = useState(false);
  const [showExpModal, setShowExpModal] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<DashboardMetrics>('/api/admin/revenue', fetcher, {
    refreshInterval: 60_000,
  });

  const onSuccess = useCallback(() => mutate(), [mutate]);

  if (isLoading) return <Skeleton />;
  if (error || !data) {
    return (
      <div className="flex items-center gap-3 p-5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        Failed to load financial metrics. Check console for details.
      </div>
    );
  }

  const {
    allTimeRevenue, thisMonthRevenue, revenueChangePercent,
    totalAdSpend, thisMonthSpend,
    netProfit, netProfitMargin, roas,
    monetizationScore, milestones, monthlyData,
  } = data;

  const revUp = revenueChangePercent >= 0;
  const profitPositive = netProfit >= 0;

  return (
    <>
      <section className="space-y-6">
        {/* ── Section Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" /> Executive Revenue Overview
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live financial performance · Net profit · Monetization readiness
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowRevModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Revenue
            </button>
            <button
              onClick={() => setShowExpModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 text-sm font-bold rounded-xl transition shadow-sm"
            >
              <Plus className="w-4 h-4" /> Log Ad Cost
            </button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Gross Revenue */}
          <KpiCard
            label="Gross Revenue"
            value={usd(allTimeRevenue, true)}
            sub={`${usd(thisMonthRevenue)} this month`}
            icon={DollarSign}
            iconBg="bg-emerald-50 dark:bg-emerald-500/10"
            iconColor="text-emerald-600 dark:text-emerald-400"
            badge={
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${revUp ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-500'}`}>
                {revUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {pct(revenueChangePercent)}
              </span>
            }
          />

          {/* Ad Spend */}
          <KpiCard
            label="Ad & Op Spend"
            value={usd(totalAdSpend, true)}
            sub={`${usd(thisMonthSpend)} this month`}
            icon={TrendingDown}
            iconBg="bg-amber-50 dark:bg-amber-500/10"
            iconColor="text-amber-600 dark:text-amber-400"
            badge={
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                ROAS {roas.toFixed(0)}%
              </span>
            }
          />

          {/* Net Profit */}
          <KpiCard
            label="Net Profit"
            value={usd(netProfit, true)}
            sub={`${netProfitMargin}% margin`}
            subColor={profitPositive ? 'text-emerald-500' : 'text-red-500'}
            icon={profitPositive ? TrendingUp : TrendingDown}
            iconBg={profitPositive ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-red-50 dark:bg-red-500/10'}
            iconColor={profitPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}
          />

          {/* Monetization */}
          <KpiCard
            label="Monetization Ready"
            value={`${monetizationScore}%`}
            sub={monetizationScore >= 70 ? '✓ Eligible for AdSense' : 'Keep building content'}
            subColor={monetizationScore >= 70 ? 'text-emerald-500' : 'text-slate-400'}
            icon={Zap}
            iconBg="bg-blue-50 dark:bg-blue-500/10"
            iconColor="text-blue-600 dark:text-blue-400"
            badge={
              <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${monetizationScore >= 70 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                  style={{ width: `${monetizationScore}%` }}
                />
              </div>
            }
          />
        </div>

        {/* ── Chart + Monetization Card ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue vs Spend Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Revenue vs Ad Spend</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Last 6 months · Net margin on hover</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Revenue</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Spend</span>
              </div>
            </div>
            <div className="p-5 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="execRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="execSpendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                    tickFormatter={v => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`} />
                  <Tooltip content={<FinancialTooltip />} cursor={{ stroke: 'rgba(148,163,184,0.15)', strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2.5}
                    fill="url(#execRevGrad)" dot={false}
                    activeDot={{ r: 5, fill: '#10b981', stroke: '#d1fae5', strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="spend" name="Ad Spend" stroke="#f59e0b" strokeWidth={2}
                    fill="url(#execSpendGrad)" dot={false}
                    activeDot={{ r: 5, fill: '#f59e0b', stroke: '#fef3c7', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monetization Readiness Card */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" /> AdSense Eligibility
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Progress toward premium ad networks</p>
            </div>

            <RingProgress score={monetizationScore} />

            <div className="space-y-3">
              {milestones.map((m, i) => <MilestoneRow key={i} m={m} />)}
            </div>

            {monetizationScore >= 70 && (
              <a
                href="https://adsense.google.com/start"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold rounded-xl text-center transition flex items-center justify-center gap-2"
              >
                Apply for AdSense <ArrowUpRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── Modals ── */}
      {showRevModal && <LogRevenueModal onClose={() => setShowRevModal(false)} onSuccess={onSuccess} />}
      {showExpModal && <LogExpenseModal onClose={() => setShowExpModal(false)} onSuccess={onSuccess} />}
    </>
  );
}
