'use client';

/**
 * Admin CRM & Pipeline Dashboard
 * File: src/app/admin/crm/page.tsx
 *
 * Unified CRM and Cold Outreach command center for CoderNest:
 * - Interactive Kanban board pipeline (New → Contacted → Proposal → Converted → Closed)
 * - "Quick Lead & Direct Outreach Dispatcher" for immediate LinkedIn / job board outreach via QStash & SMTP
 * - Instant state synchronization without page reloads
 * - Search, source filtering, and view toggling (Kanban vs Table)
 */

import { useState, useEffect, useTransition, useCallback } from 'react';
import type { Lead, LeadStatus } from '@/types';
import {
  Users,
  Send,
  Plus,
  RefreshCw,
  Search,
  LayoutGrid,
  List,
  Sparkles,
  Mail,
  CheckCircle2,
  Clock,
  Briefcase,
  AlertCircle,
  X,
  Loader2,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getLeads, updateLeadStatus, createLead, acknowledgeLeadReply } from '@/lib/actions/crm.actions';
import KanbanBoard from '@/components/admin/KanbanBoard';
import QuickOutreachModal from '@/components/admin/crm/QuickOutreachModal';

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string }> = {
  new: { label: 'New', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  contacted: { label: 'Contacted', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  proposal: { label: 'Proposal', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  converted: { label: 'Converted', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  closed: { label: 'Closed', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
};

export default function AdminCrmPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [isPending, startTransition] = useTransition();

  // Modal states
  const [isOutreachOpen, setIsOutreachOpen] = useState(false);
  const [isManualCreateOpen, setIsManualCreateOpen] = useState(false);
  const [manualForm, setManualForm] = useState({ name: '', email: '', company: '', message: '', budget: '' });
  const [isManualSaving, setIsManualSaving] = useState(false);

  // Fetch leads from database
  const loadLeads = useCallback(async () => {
    try {
      const res = await getLeads();
      if (res.success && res.data) {
        setLeads(res.data as unknown as Lead[]);
      } else {
        toast.error('Could not load CRM leads.');
      }
    } catch (err) {
      console.error('[loadLeads error]:', err);
      toast.error('Network error loading leads.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  // Handle instant addition from QuickOutreachModal
  const handleOutreachSuccess = (newLead: Lead) => {
    startTransition(() => {
      setLeads((prev) => {
        const filtered = prev.filter((l) => l.id !== newLead.id && l.email !== newLead.email);
        return [newLead, ...filtered];
      });
    });
    // Background re-fetch to ensure complete synchronization
    setTimeout(() => {
      loadLeads();
    }, 500);
  };

  // Status update
  const handleStatusChange = async (leadId: string, status: LeadStatus) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
    const res = await updateLeadStatus(leadId, status);
    if (res.success) {
      toast.success(`Stage moved to ${STATUS_CONFIG[status]?.label || status}`);
    } else {
      toast.error('Failed to update stage.');
      loadLeads();
    }
  };

  // Manual standard lead creation
  const handleManualCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsManualSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', manualForm.name);
      formData.append('email', manualForm.email);
      formData.append('company', manualForm.company);
      formData.append('message', manualForm.message);
      formData.append('budget', manualForm.budget);

      const res = await createLead(formData);
      if (!res.success) throw new Error(res.error || 'Failed to create lead');

      toast.success('Lead recorded in CRM pipeline!');
      setIsManualCreateOpen(false);
      setManualForm({ name: '', email: '', company: '', message: '', budget: '' });
      await loadLeads();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating lead';
      toast.error(msg);
    } finally {
      setIsManualSaving(false);
    }
  };

  // Filter leads
  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      (l.company ?? '').toLowerCase().includes(search.toLowerCase());

    const matchesSource = sourceFilter === 'all' || l.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  // Calculate high-level pipeline metrics
  const totalLeads = leads.length;
  const contactedCount = leads.filter((l) => l.status === 'contacted').length;
  const proposalCount = leads.filter((l) => l.status === 'proposal').length;
  const convertedCount = leads.filter((l) => l.status === 'converted').length;
  const newRepliesCount = leads.filter((l) => l.hasNewReply).length;

  const uniqueSources = Array.from(new Set(leads.map((l) => l.source).filter(Boolean))) as string[];

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Top Pipeline Header ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">CRM & Pipeline</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              QStash & Upstash Active
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track client journeys, execute direct cold outreach, and automate 48-hour follow-up workflows.
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Quick Lead & Direct Outreach Modal Trigger */}
          <button
            id="quick-outreach-open-btn"
            onClick={() => setIsOutreachOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:scale-[1.01] transition-all duration-200"
          >
            <Send className="w-4 h-4 text-blue-200" />
            <span>+ New Lead & Send Outreach</span>
          </button>

          {/* Standard Lead Creation Button */}
          <button
            onClick={() => setIsManualCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 font-semibold text-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => {
              setLoading(true);
              loadLeads();
            }}
            disabled={loading}
            aria-label="Refresh leads"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── Metric Stat Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Leads</span>
            <Users className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{totalLeads}</p>
          <p className="text-[11px] text-slate-500 mt-1">In active CRM database</p>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Contacted / Outreach</span>
            <Send className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{contactedCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">SMTP & QStash dispatched</p>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Proposal Sent</span>
            <Briefcase className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{proposalCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Negotiating scope & SOW</p>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Converted Clients</span>
            <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{convertedCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Active client projects</p>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm col-span-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">New Inbound Replies</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-300 mt-2">{newRepliesCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting admin action</p>
        </div>
      </div>

      {/* ─── Search, Filter & View Mode Controls ───────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 p-3 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            id="crm-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prospects by name, email, or company..."
            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Source Filter */}
        <div className="flex items-center gap-2">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 transition cursor-pointer"
          >
            <option value="all">All Sources ({leads.length})</option>
            <option value="Manual / Direct Outreach">Manual / Direct Outreach</option>
            <option value="Main B2B Agency">Main B2B Agency</option>
            <option value="ClippingBD">ClippingBD</option>
            <option value="Personal Portfolio">Personal Portfolio</option>
            <option value="CSV Import">CSV Import</option>
            {uniqueSources
              .filter(
                (s) =>
                  ![
                    'Manual / Direct Outreach',
                    'Main B2B Agency',
                    'ClippingBD',
                    'Personal Portfolio',
                    'CSV Import',
                  ].includes(s)
              )
              .map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
          </select>

          {/* View Switcher: Kanban vs List */}
          <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'kanban'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Content Area: Kanban or Table ────────────────────────── */}
      {viewMode === 'kanban' ? (
        <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Pipeline Stages
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Drag cards to advance status
              </span>
            </div>
            {filteredLeads.length !== leads.length && (
              <span className="text-xs text-blue-400 font-semibold">
                Showing {filteredLeads.length} of {leads.length} leads
              </span>
            )}
          </div>
          <KanbanBoard
            leads={filteredLeads}
            onLeadsChange={(updated) => {
              setLeads(updated);
            }}
          />
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold text-slate-400">
                  <th className="py-3.5 px-5">Lead / Contact</th>
                  <th className="py-3.5 px-5">Company / Context</th>
                  <th className="py-3.5 px-5">Source</th>
                  <th className="py-3.5 px-5">Stage / Status</th>
                  <th className="py-3.5 px-5">Date Added</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 text-sm">
                      <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No leads match your current search or filter.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const statusCfg = STATUS_CONFIG[lead.status as LeadStatus] || STATUS_CONFIG.new;
                    return (
                      <tr key={lead.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs">
                              {lead.name ? lead.name[0].toUpperCase() : 'L'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">{lead.name}</span>
                                {lead.hasNewReply && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
                                    Reply
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 font-mono">{lead.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <p className="text-white font-medium text-xs">{lead.company || '—'}</p>
                          {lead.serviceRequested && (
                            <p className="text-[11px] text-slate-500 truncate max-w-xs">
                              {lead.serviceRequested}
                            </p>
                          )}
                        </td>

                        <td className="py-4 px-5">
                          <span className="text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                            {lead.source || 'Direct'}
                          </span>
                        </td>

                        <td className="py-4 px-5">
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              handleStatusChange(lead.id, e.target.value as LeadStatus)
                            }
                            className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${statusCfg.bg} ${statusCfg.color}`}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="proposal">Proposal</option>
                            <option value="converted">Converted</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>

                        <td className="py-4 px-5 text-xs text-slate-500 font-mono">
                          {new Date(lead.createdAt || new Date().toISOString()).toLocaleDateString()}
                        </td>

                        <td className="py-4 px-5 text-right">
                          {lead.hasNewReply && (
                            <button
                              onClick={async () => {
                                setLeads((prev) =>
                                  prev.map((l) =>
                                    l.id === lead.id
                                      ? { ...l, hasNewReply: false, lastReplySnippet: null }
                                      : l
                                  )
                                );
                                await acknowledgeLeadReply(lead.id);
                                toast.success('Reply marked as reviewed');
                              }}
                              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition"
                            >
                              Review Reply
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Quick Outreach Dispatcher Modal ────────────────────────────── */}
      <QuickOutreachModal
        isOpen={isOutreachOpen}
        onClose={() => setIsOutreachOpen(false)}
        onSuccess={handleOutreachSuccess}
      />

      {/* ─── Standard Add Lead Modal ────────────────────────────────────── */}
      {isManualCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Add New Pipeline Lead</h2>
              <button
                onClick={() => setIsManualCreateOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Full Name *</label>
                <input
                  required
                  type="text"
                  value={manualForm.name}
                  onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                  placeholder="e.g., Alex Vance"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Work Email *</label>
                <input
                  required
                  type="email"
                  value={manualForm.email}
                  onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                  placeholder="alex@company.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={manualForm.company}
                  onChange={(e) => setManualForm({ ...manualForm, company: e.target.value })}
                  placeholder="e.g., Northgate Labs"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Estimated Budget</label>
                <input
                  type="text"
                  value={manualForm.budget}
                  onChange={(e) => setManualForm({ ...manualForm, budget: e.target.value })}
                  placeholder="$5,000 - $15,000"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Project Details / Message</label>
                <textarea
                  rows={3}
                  value={manualForm.message}
                  onChange={(e) => setManualForm({ ...manualForm, message: e.target.value })}
                  placeholder="Enter project requirements, tech stack notes, or lead context..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualCreateOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isManualSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition disabled:opacity-50"
                >
                  {isManualSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Save Lead
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
