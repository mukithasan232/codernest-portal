// src/app/admin/live-traffic/LiveTrafficClient.tsx
'use client';

import React, { useState } from 'react';
import { Activity, Building2, Flame, Zap } from 'lucide-react';
import LiveTrafficTable, { VisitorItem } from '@/components/admin/LiveTrafficTable';
import { isGenericOrInvalidCompany, formatVisitorFallback } from '@/utils/ip-resolver';

interface LiveTrafficClientProps {
  initialVisitors: VisitorItem[];
}

// High-intent pages — visitors on these with Score ≥ 20 are "Verified Prospects"
const HIGH_INTENT_PAGES = ['/pricing', '/services', '/contact'];

export default function LiveTrafficClient({ initialVisitors }: LiveTrafficClientProps) {
  const [activeTab, setActiveTab] = useState<'human' | 'hot' | 'identified'>('human');

  // ─── Enrich visitors with lead score & duration ─────────────────────────────
  const visitors: VisitorItem[] = initialVisitors.map(visitor => {
    let score = 0;
    const pageViews = visitor.pageViews || [];
    if (pageViews.length > 3) score += 10;
    pageViews.forEach((pv) => {
      if (pv.url.includes('/contact') || pv.url.includes('/pricing')) score += 10;
      if (pv.timeSpent > 60) score += 5;
    });
    const totalTime = pageViews.reduce((acc, pv) => acc + pv.timeSpent, 0);
    return { ...visitor, score, totalTime };
  });

  // ─── Hot-prospect alert: show banner if any verified high-intent prospects ────
  const hotProspects = visitors.filter(v => {
    const isOnCriticalPage = v.pageViews?.some((pv) =>
      HIGH_INTENT_PAGES.some(p => pv.url.includes(p))
    );
    return (v.score ?? 0) >= 20 && Boolean(isOnCriticalPage);
  });

  // ─── Strictly count only genuine B2B identified companies ───────────────────
  const identifiedCompaniesCount = visitors.filter(
    v => v.isIdentified && v.companyName && !isGenericOrInvalidCompany(v.companyName)
  ).length;

  // ─── Tab filtering (bots already excluded) ───────────────────────────────────
  const filteredVisitors = visitors.filter(v => {
    if (activeTab === 'human') return true;
    if (activeTab === 'hot') return (v.score ?? 0) >= 15;
    if (activeTab === 'identified') return v.isIdentified && v.companyName && !isGenericOrInvalidCompany(v.companyName);
    return true;
  });

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
                  {hotProspects.length === 1 && hotProspects[0].companyName && !isGenericOrInvalidCompany(hotProspects[0].companyName) 
                    ? `Verified ${hotProspects[0].companyName} Prospect Detected`
                    : `${hotProspects.length} Verified High-Intent Prospect${hotProspects.length > 1 ? 's' : ''} Detected`
                  }
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white uppercase tracking-wider">
                  LIVE
                </span>
              </div>
              <div className="flex flex-row overflow-x-auto whitespace-nowrap hide-scrollbar gap-2 mt-2 pb-1">
                {hotProspects.map(v => {
                  const hasCompany = v.companyName && !isGenericOrInvalidCompany(v.companyName);
                  const displayName = hasCompany ? v.companyName : formatVisitorFallback(v.location, v.ipAddress);
                  return (
                    <div
                      key={v.id}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 bg-orange-500/20 border border-orange-500/40 rounded-lg text-orange-200"
                    >
                      <Zap className="w-3 h-3 text-orange-400" />
                      <span>{displayName}</span>
                      <span className="opacity-70">— {v.score} PTS</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 p-1 bg-white/5 border border-white/10 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('human')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'human'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Activity className="w-4 h-4" />
          All Visitors
          <span className="ml-1 text-xs bg-white/10 rounded-full px-2 py-0.5">{visitors.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hot')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'hot'
              ? 'bg-orange-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-orange-400 hover:bg-orange-500/10'
          }`}
        >
          <Flame className="w-4 h-4" />
          Hot Prospects
          {hotProspects.length > 0 && (
            <span className="ml-1 text-xs bg-orange-400/30 text-orange-200 rounded-full px-2 py-0.5 font-bold animate-pulse">
              {visitors.filter(v => (v.score ?? 0) >= 15).length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('identified')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'identified'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-purple-400 hover:bg-purple-500/10'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Identified Companies
          <span className="ml-1 text-xs bg-white/10 rounded-full px-2 py-0.5">
            {identifiedCompaniesCount}
          </span>
        </button>
      </div>

      {/* ── Modular Live Traffic Table ────────────────────────────────────────── */}
      <LiveTrafficTable visitors={filteredVisitors} />
    </div>
  );
}
