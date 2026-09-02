'use client';

import { useState } from 'react';
import { Activity, Clock, Globe, MapPin, MonitorSmartphone, Building2, Flame, X, Plus, Loader2, ShieldCheck, AlertTriangle, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// High-intent pages — visitors on these with Score ≥ 20 are "Verified Prospects"
const HIGH_INTENT_PAGES = ['/pricing', '/services', '/contact'];

function isHighIntentVisitor(visitor: any, totalTime: number): boolean {
  const isOnCriticalPage = visitor.pageViews?.some((pv: any) =>
    HIGH_INTENT_PAGES.some(p => pv.url.includes(p))
  );
  return visitor.score >= 20 && isOnCriticalPage;
}

// ─── Score Badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ score, highIntent }: { score: number; highIntent: boolean }) {
  if (highIntent) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500/30 to-red-500/30 border border-orange-500/50 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.3)] animate-pulse">
        <Zap className="w-3 h-3" />
        {score} PTS · HOT
      </div>
    );
  }
  if (score >= 15) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
        <Flame className="w-3 h-3" />
        {score} PTS
      </div>
    );
  }
  return (
    <div className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400">
      {score} PTS
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function LiveTrafficClient({ initialVisitors }: { initialVisitors: any[] }) {
  const [activeTab, setActiveTab] = useState<'human' | 'hot' | 'identified'>('human');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Enrich visitors with lead score ─────────────────────────────────────────
  const visitors = initialVisitors.map(visitor => {
    let score = 0;
    const pageViews = visitor.pageViews || [];
    if (pageViews.length > 3) score += 10;
    pageViews.forEach((pv: any) => {
      if (pv.url.includes('/contact') || pv.url.includes('/pricing')) score += 10;
      if (pv.timeSpent > 60) score += 5;
    });
    const totalTime = pageViews.reduce((acc: number, pv: any) => acc + pv.timeSpent, 0);
    return { ...visitor, score, totalTime };
  });

  // ─── Hot-prospect alert: show banner if any verified high-intent prospects ────
  const hotProspects = visitors.filter(v => isHighIntentVisitor(v, v.totalTime));

  // ─── Tab filtering (bots already excluded server-side) ───────────────────────
  const filteredVisitors = visitors.filter(v => {
    if (activeTab === 'human') return true;
    if (activeTab === 'hot') return v.score >= 15;
    if (activeTab === 'identified') return v.isIdentified && v.companyName;
    return true;
  });

  // ─── Lead qualification gate ─────────────────────────────────────────────────
  // A visitor is CRM-worthy only if they spent ≥ 10 seconds OR visited ≥ 2 pages
  function isLeadWorthy(visitor: any): boolean {
    return visitor.totalTime >= 10 || (visitor.pageViews?.length ?? 0) >= 2;
  }

  const openCrmModal = (visitor: any) => {
    setSelectedVisitor(visitor);
    setLeadName(
      visitor.companyName
        ? `${visitor.companyName} Representative`
        : `Visitor from ${visitor.location || 'Unknown'}`
    );
    setLeadEmail('');
    setIsModalOpen(true);
  };

  const handleAddToCrm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !selectedVisitor) return;

    const finalEmail = leadEmail || `prospect_${selectedVisitor.id}@codernest.lead`;
    const isProxy = !leadEmail; // No email entered → proxy placeholder will be used

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadName,
          email: finalEmail,
          company: selectedVisitor.companyName || '',
          source: 'Live Traffic Identification',
          requirements: `Browsed ${selectedVisitor.pageViews.length} pages, spent ${selectedVisitor.totalTime}s on site. Score: ${selectedVisitor.score}. Location: ${selectedVisitor.location}`,
        }),
      });

      if (!res.ok) throw new Error('Failed to add lead');

      const json = await res.json();

      // Distinct feedback based on whether a real or proxy email was used
      if (json.isProxyEmail || isProxy) {
        toast('Lead saved to CRM — auto-email skipped (anonymous visitor, no real email address).', {
          icon: '📋',
          style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)' },
          duration: 5000,
        });
      } else {
        toast.success('Lead pushed to CRM — automated outreach queued!');
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to add to CRM.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="space-y-6">

      {/* ── Hot Prospect Alert Banner ─────────────────────────────────────────── */}
      {hotProspects.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-orange-500/40 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10 p-4 shadow-lg shadow-orange-500/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.15),transparent_60%)]" />
          <div className="relative flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-orange-300">
                  {hotProspects.length} Verified High-Intent Prospect{hotProspects.length > 1 ? 's' : ''} Detected
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white uppercase tracking-wider">
                  LIVE
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {hotProspects.map(v => (
                  <button
                    key={v.id}
                    onClick={() => openCrmModal(v)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 rounded-lg text-orange-200 transition-all"
                  >
                    <Zap className="w-3 h-3" />
                    {v.companyName || `Visitor (${v.location || 'Unknown'})`} — {v.score} PTS
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 p-1 bg-white/5 border border-white/10 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('human')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'human' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <Activity className="w-4 h-4" />
          All Visitors
          <span className="ml-1 text-xs bg-white/10 rounded-full px-2 py-0.5">{visitors.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('hot')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'hot' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:text-orange-400 hover:bg-orange-500/10'}`}
        >
          <Flame className="w-4 h-4" />
          Hot Prospects
          {hotProspects.length > 0 && (
            <span className="ml-1 text-xs bg-orange-400/30 text-orange-200 rounded-full px-2 py-0.5 font-bold animate-pulse">
              {visitors.filter(v => v.score >= 15).length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('identified')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'identified' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-purple-400 hover:bg-purple-500/10'}`}
        >
          <Building2 className="w-4 h-4" />
          Identified Companies
          <span className="ml-1 text-xs bg-white/10 rounded-full px-2 py-0.5">
            {visitors.filter(v => v.isIdentified && v.companyName).length}
          </span>
        </button>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <div className="glass rounded-3xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-300">Visitor / Company</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Location</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Pages Visited</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Time on Site</th>
                <th className="px-6 py-4 font-semibold text-slate-300 text-center">Lead Score</th>
                <th className="px-6 py-4 font-semibold text-slate-300 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredVisitors.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <MonitorSmartphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    No traffic matching this criteria.
                  </td>
                </tr>
              )}
              {filteredVisitors.map((visitor) => {
                const isOnline = (new Date().getTime() - new Date(visitor.updatedAt).getTime()) < 300000;
                const highIntent = isHighIntentVisitor(visitor, visitor.totalTime);
                const leadWorthy = isLeadWorthy(visitor);

                // Pages visited summary
                const recentPages = visitor.pageViews?.slice(0, 3).map((pv: any) => {
                  try { return new URL(pv.url).pathname; } catch { return pv.url; }
                }) ?? [];

                return (
                  <tr
                    key={visitor.id}
                    className={`hover:bg-white/[0.02] transition-colors ${highIntent ? 'bg-orange-500/[0.04] border-l-2 border-l-orange-500/50' : ''}`}
                  >
                    {/* Visitor Identity */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isOnline ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}
                          suppressHydrationWarning
                        />
                        <div>
                          {visitor.companyName ? (
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-purple-400" />
                              {visitor.companyName}
                            </div>
                          ) : (
                            <div className="font-mono text-slate-300 text-xs">
                              {visitor.sessionId.substring(0, 12)}…
                            </div>
                          )}
                          {highIntent && (
                            <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-orange-300 bg-orange-500/15 border border-orange-500/30 rounded-full px-2 py-0.5">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              Verified High-Intent Prospect
                            </div>
                          )}
                          <div className="text-[10px] text-slate-600 mt-0.5">
                            IP: {visitor.ipAddress === '::1' || visitor.ipAddress === '127.0.0.1' ? 'Localhost' : (visitor.ipAddress || 'Unknown')}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        {visitor.location ? decodeURIComponent(visitor.location) : 'Unknown Region'}
                      </div>
                    </td>

                    {/* Pages */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-300 text-xs mb-1">
                        <Globe className="w-3 h-3 text-slate-500" />
                        <span className="font-semibold">{visitor.pageViews?.length ?? 0}</span> pages
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {recentPages.map((page: string, i: number) => (
                          <span key={i} className="text-[10px] text-slate-500 font-mono truncate max-w-[160px]">{page}</span>
                        ))}
                        {(visitor.pageViews?.length ?? 0) > 3 && (
                          <span className="text-[10px] text-slate-600">+{visitor.pageViews.length - 3} more</span>
                        )}
                      </div>
                    </td>

                    {/* Time on Site */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-300 text-sm font-semibold">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        {formatDuration(visitor.totalTime)}
                      </div>
                      <div className="text-slate-500 text-[10px] mt-1" suppressHydrationWarning>
                        Last active: {timeAgo(visitor.updatedAt)}
                      </div>
                    </td>

                    {/* Score */}
                    <td className="px-6 py-4 text-center">
                      <ScoreBadge score={visitor.score} highIntent={highIntent} />
                    </td>

                    {/* CRM Action — gated by engagement threshold */}
                    <td className="px-6 py-4 text-right">
                      {leadWorthy ? (
                        <button
                          onClick={() => openCrmModal(visitor)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-bold rounded-lg transition-all shadow-sm ${
                            highIntent
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 shadow-orange-500/30'
                              : 'bg-blue-600 hover:bg-blue-500'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {highIntent ? 'Capture Lead' : 'Add to CRM'}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/5">
                          <AlertTriangle className="w-3 h-3" />
                          Low engagement
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CRM Modal ─────────────────────────────────────────────────────────── */}
      {isModalOpen && selectedVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            {/* Modal header varies by intent level */}
            <div className={`flex items-center gap-3 mb-4 p-3 rounded-xl ${isHighIntentVisitor(selectedVisitor, selectedVisitor.totalTime) ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-blue-500/10 border border-blue-500/20'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isHighIntentVisitor(selectedVisitor, selectedVisitor.totalTime) ? 'bg-orange-500/20' : 'bg-blue-500/20'}`}>
                {isHighIntentVisitor(selectedVisitor, selectedVisitor.totalTime)
                  ? <Flame className="w-5 h-5 text-orange-400" />
                  : <Plus className="w-5 h-5 text-blue-400" />
                }
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Convert to CRM Lead</h3>
                <p className="text-xs text-slate-400">
                  {selectedVisitor.companyName || 'Anonymous visitor'} · {selectedVisitor.score} pts · {formatDuration(selectedVisitor.totalTime)} on site
                </p>
              </div>
            </div>

            <form onSubmit={handleAddToCrm} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Contact Name / Company Representative</label>
                <input
                  required
                  value={leadName}
                  onChange={e => setLeadName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="e.g. TechCorp Representative"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address <span className="text-slate-600">(Optional — auto-generated if blank)</span></label>
                <input
                  type="email"
                  value={leadEmail}
                  onChange={e => setLeadEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder={`prospect_${selectedVisitor.id.substring(0, 8)}@codernest.lead`}
                />
              </div>

              {/* Context summary */}
              <div className="text-xs text-slate-500 bg-white/5 rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3 h-3" /> {selectedVisitor.pageViews?.length ?? 0} pages explored
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> {formatDuration(selectedVisitor.totalTime)} total session time
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> {selectedVisitor.location || 'Unknown location'}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center gap-2 py-3 text-white font-bold rounded-xl transition-all disabled:opacity-50 ${
                  isHighIntentVisitor(selectedVisitor, selectedVisitor.totalTime)
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400'
                    : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {isSubmitting ? 'Pushing to CRM...' : 'Push to CRM'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
