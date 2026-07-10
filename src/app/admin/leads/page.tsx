'use client';

/**
 * Admin — Full Leads Management
 * View all leads with status updates and notes.
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Lead, LeadStatus } from '@/types';
import { Mail, Plus, X, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS: { value: LeadStatus; label: string; color: string }[] = [
  { value: 'new',       label: 'New',       color: 'text-blue-400' },
  { value: 'contacted', label: 'Contacted', color: 'text-yellow-400' },
  { value: 'proposal',  label: 'Proposal',  color: 'text-purple-400' },
  { value: 'converted', label: 'Converted', color: 'text-green-400' },
  { value: 'closed',    label: 'Closed',    color: 'text-slate-400' },
];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '', budget: '' });
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchLeads = async () => {
      const { data } = await supabase.from('leads').select('*').order('createdAt', { ascending: false });
      if (data) setLeads(data as Lead[]);
    };

    fetchLeads();

    const channel = supabase
      .channel('admin_leads_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setLeads(prev => [payload.new as Lead, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setLeads(prev => prev.map(l => l.id === payload.new.id ? (payload.new as Lead) : l));
        } else if (payload.eventType === 'DELETE') {
          setLeads(prev => prev.filter(l => l.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const filtered = leads.filter(l => {
    const matchesFilter = filter === 'all' || l.status === filter;
    const matchesSearch = !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      (l.company ?? '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  async function updateStatus(id: string, status: LeadStatus) {
    const { error } = await supabase.from('leads').update({ status }).eq('id', id);
    if (!error) {
      toast.success('Lead status updated!');
    } else {
      toast.error('Failed to update status.');
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('leads').insert({
        ...form,
        status: 'new',
        source: 'admin',
        createdAt: new Date().toISOString(),
      });
      if (error) throw error;
      
      toast.success('Lead added!');
      setShowCreate(false);
      setForm({ name: '', email: '', company: '', message: '', budget: '' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to create lead.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Leads</h1>
          <p className="text-slate-400 mt-1">{leads.length} total leads in pipeline.</p>
        </div>
        <button
          id="lead-create-btn"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            id="lead-search"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, company…"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
          >
            All ({leads.length})
          </button>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${filter === s.value ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
            >
              {s.label} ({leads.filter(l => l.status === s.value).length})
            </button>
          ))}
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="glass rounded-3xl border border-white/10 p-8 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Add New Lead</h2>
            <button onClick={() => setShowCreate(false)} className="text-slate-500 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form id="lead-form" onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'name', label: 'Full Name *', required: true, placeholder: 'John Doe' },
              { key: 'email', label: 'Email *', required: true, placeholder: 'john@example.com' },
              { key: 'company', label: 'Company', required: false, placeholder: 'Acme Corp' },
              { key: 'budget', label: 'Budget', required: false, placeholder: '$5,000 – $10,000' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
                <input
                  id={`lead-${f.key}`}
                  required={f.required}
                  type={f.key === 'email' ? 'email' : 'text'}
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Message</label>
              <textarea
                id="lead-message"
                rows={3}
                value={form.message}
                onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="What does the client need?"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? 'Saving…' : 'Create Lead'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leads table */}
      <div className="glass rounded-3xl border border-white/10 overflow-hidden">
        <div className="divide-y divide-white/5">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
              No leads found.
            </div>
          ) : filtered.map(lead => (
            <div key={lead.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/5 transition">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold flex-shrink-0">
                  {lead.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-white">{lead.name}</h3>
                    {lead.company && <span className="text-xs text-slate-500">· {lead.company}</span>}
                    {lead.budget && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-400/10 text-green-400">
                        {lead.budget}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{lead.email} · {new Date(lead.createdAt || lead.created_at || new Date().toISOString()).toLocaleDateString()}</p>
                  {lead.message && (
                    <p className="text-xs text-slate-400 mt-1 truncate">{lead.message}</p>
                  )}
                </div>
              </div>

              {/* Status selector */}
              <select
                id={`lead-status-${lead.id}`}
                value={lead.status}
                onChange={e => updateStatus(lead.id, e.target.value as LeadStatus)}
                className="text-xs font-bold px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 transition cursor-pointer"
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
