'use client';

/**
 * Admin — Full Leads Management
 * View all leads with status updates, single-lead creation, and bulk CSV import.
 */

import { useState, useEffect, useRef } from 'react';
import type { Lead, LeadStatus } from '@/types';
import { Mail, Plus, X, Loader2, Search, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import { getLeads, updateLeadStatus, createLead, acknowledgeLeadReply } from '@/lib/actions/crm.actions';
import { bulkImportLeads, type CsvLeadRow } from '@/lib/actions/leads.actions';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: LeadStatus; label: string; color: string }[] = [
  { value: 'new',       label: 'New',       color: 'text-blue-400' },
  { value: 'contacted', label: 'Contacted', color: 'text-yellow-400' },
  { value: 'proposal',  label: 'Proposal',  color: 'text-purple-400' },
  { value: 'converted', label: 'Converted', color: 'text-green-400' },
  { value: 'closed',    label: 'Closed',    color: 'text-slate-400' },
];

// Maps Apollo.io / common export header variants → our CsvLeadRow fields
const HEADER_MAP: Record<string, keyof CsvLeadRow> = {
  // Name
  name: 'name',
  'full name': 'name',
  'first name': 'name',
  firstname: 'name',
  // Email
  email: 'email',
  'email address': 'email',
  emailaddress: 'email',
  // Company
  company: 'company',
  'company name': 'company',
  organization: 'company',
  account: 'company',
  // Title / Role
  title: 'title',
  jobtitle: 'title',
  'job title': 'title',
  role: 'title',
  position: 'title',
  // Source
  source: 'source',
  'lead source': 'source',
};

function normalizeKey(raw: string): keyof CsvLeadRow | null {
  return HEADER_MAP[raw.trim().toLowerCase()] ?? null;
}

// ─── Source badge helper ───────────────────────────────────────────────────────

const getSourceBadge = (source?: string) => {
  if (!source) return null;
  let colorClass = 'bg-slate-500/10 text-slate-400';
  if (source.includes('Main B2B Agency'))    colorClass = 'bg-indigo-500/10 text-indigo-400';
  else if (source.includes('ClippingBD'))    colorClass = 'bg-orange-500/10 text-orange-500';
  else if (source.includes('Personal Portfolio')) colorClass = 'bg-sky-500/10 text-sky-400';
  else if (source.includes('CSV Import') || source.includes('Apollo')) colorClass = 'bg-emerald-500/10 text-emerald-400';
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorClass}`}>
      {source}
    </span>
  );
};

// ─── CSV Preview Modal ────────────────────────────────────────────────────────

interface CsvPreviewProps {
  rows: CsvLeadRow[];
  fileName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isImporting: boolean;
}

function CsvPreviewModal({ rows, fileName, onConfirm, onCancel, isImporting }: CsvPreviewProps) {
  const validCount  = rows.filter(r => r.name?.trim() && r.email?.trim()).length;
  const invalidCount = rows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">CSV Preview</h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{fileName}</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-slate-500 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-4 px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-bold">{validCount}</span>
            <span className="text-slate-400">valid rows</span>
          </div>
          {invalidCount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-bold">{invalidCount}</span>
              <span className="text-slate-400">skipped (missing name/email)</span>
            </div>
          )}
          <div className="ml-auto text-xs text-slate-500">
            Duplicates will be silently skipped
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1 p-4">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-slate-500 border-b border-white/5">
                <th className="pb-2 pr-4 font-semibold">#</th>
                <th className="pb-2 pr-4 font-semibold">Name</th>
                <th className="pb-2 pr-4 font-semibold">Email</th>
                <th className="pb-2 pr-4 font-semibold">Company</th>
                <th className="pb-2 pr-4 font-semibold">Title</th>
                <th className="pb-2 font-semibold">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {rows.slice(0, 50).map((row, i) => {
                const isValid = row.name?.trim() && row.email?.trim();
                return (
                  <tr key={i} className={`${isValid ? '' : 'opacity-40'} hover:bg-white/5 transition`}>
                    <td className="py-2 pr-4 text-slate-600">{i + 1}</td>
                    <td className="py-2 pr-4 text-white font-medium">{row.name || <span className="text-red-400">—</span>}</td>
                    <td className="py-2 pr-4 text-slate-300 font-mono">{row.email || <span className="text-red-400">—</span>}</td>
                    <td className="py-2 pr-4 text-slate-400">{row.company || '—'}</td>
                    <td className="py-2 pr-4 text-slate-400">{row.title || '—'}</td>
                    <td className="py-2 text-slate-400">{row.source || 'CSV Import'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length > 50 && (
            <p className="text-center text-xs text-slate-600 mt-4">
              Showing first 50 of {rows.length} rows
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <button
            onClick={onCancel}
            disabled={isImporting}
            className="px-5 py-2.5 border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            id="csv-confirm-import-btn"
            onClick={onConfirm}
            disabled={isImporting || validCount === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
          >
            {isImporting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Importing…</>
            ) : (
              <><Upload className="w-4 h-4" /> Import {validCount} Leads</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminLeadsPage() {
  const [leads, setLeads]             = useState<Lead[]>([]);
  const [search, setSearch]           = useState('');
  const [filter, setFilter]           = useState<LeadStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<string | 'all'>('all');
  const [showCreate, setShowCreate]   = useState(false);
  const [form, setForm]               = useState({ name: '', email: '', company: '', message: '', budget: '' });
  const [saving, setSaving]           = useState(false);

  // CSV import state
  const csvInputRef               = useRef<HTMLInputElement>(null);
  const [csvRows, setCsvRows]     = useState<CsvLeadRow[] | null>(null);
  const [csvFileName, setCsvFileName] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const fetchLeads = async () => {
    const res = await getLeads();
    if (res.success && res.data) {
      setLeads(res.data as unknown as Lead[]);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const uniqueSources = Array.from(new Set(leads.map(l => l.source).filter(Boolean)));

  const filtered = leads.filter(l => {
    const matchesFilter  = filter === 'all'      || l.status === filter;
    const matchesSource  = sourceFilter === 'all' || l.source === sourceFilter;
    const matchesSearch  = !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      (l.company ?? '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch && matchesSource;
  });

  async function updateStatus(id: string, status: LeadStatus) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    const res = await updateLeadStatus(id, status);
    if (res.success) toast.success('Lead status updated!');
    else toast.error('Failed to update status.');
  }

  async function handleAcknowledge(id: string) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, hasNewReply: false, lastReplySnippet: null } : l));
    const res = await acknowledgeLeadReply(id);
    if (res.success) toast.success('Reply acknowledged!');
    else toast.error('Failed to acknowledge reply.');
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name',    form.name);
      formData.append('email',   form.email);
      formData.append('company', form.company);
      formData.append('message', form.message);

      const res = await createLead(formData);
      if (!res.success) throw new Error(res.error);

      toast.success('Lead added!');
      setShowCreate(false);
      setForm({ name: '', email: '', company: '', message: '', budget: '' });
      await fetchLeads();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create lead.');
    } finally {
      setSaving(false);
    }
  }

  // ── CSV handling ────────────────────────────────────────────────────────────

  function handleCsvFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const mapped: CsvLeadRow[] = results.data.map((raw) => {
          const row: Partial<CsvLeadRow> = {};

          for (const [rawKey, val] of Object.entries(raw)) {
            const field = normalizeKey(rawKey);
            if (field && val) {
              // If "first name" maps to name and name isn't set yet, set it
              if (field === 'name' && !row.name) {
                row.name = val.trim();
              } else if (field !== 'name') {
                (row as any)[field] = val.trim();
              }
            }
          }

          // Handle separate First Name / Last Name columns
          const firstNameKey = Object.keys(raw).find(k => k.trim().toLowerCase() === 'first name' || k.trim().toLowerCase() === 'firstname');
          const lastNameKey  = Object.keys(raw).find(k => k.trim().toLowerCase() === 'last name'  || k.trim().toLowerCase() === 'lastname');
          if (firstNameKey || lastNameKey) {
            const first = firstNameKey ? raw[firstNameKey]?.trim() ?? '' : '';
            const last  = lastNameKey  ? raw[lastNameKey]?.trim()  ?? '' : '';
            row.name = `${first} ${last}`.trim() || row.name;
          }

          return row as CsvLeadRow;
        });

        setCsvRows(mapped);
        // Reset file input so the same file can be re-selected if needed
        if (csvInputRef.current) csvInputRef.current.value = '';
      },
      error: (err) => {
        toast.error(`CSV parse error: ${err.message}`);
      },
    });
  }

  async function handleConfirmImport() {
    if (!csvRows) return;
    setIsImporting(true);
    try {
      const res = await bulkImportLeads(csvRows);
      if (!res.success) throw new Error(res.error);

      toast.success(`✅ Successfully imported ${res.count} lead${res.count !== 1 ? 's' : ''}!`);
      setCsvRows(null);
      setCsvFileName('');
      await fetchLeads();
    } catch (err: any) {
      toast.error(err.message || 'Import failed.');
    } finally {
      setIsImporting(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* CSV Preview Modal */}
      {csvRows && (
        <CsvPreviewModal
          rows={csvRows}
          fileName={csvFileName}
          onConfirm={handleConfirmImport}
          onCancel={() => { setCsvRows(null); setCsvFileName(''); }}
          isImporting={isImporting}
        />
      )}

      {/* Hidden file input */}
      <input
        ref={csvInputRef}
        id="csv-file-input"
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleCsvFileChange}
      />

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Leads</h1>
          <p className="text-slate-400 mt-1">{leads.length} total leads in pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Import CSV button */}
          <button
            id="csv-import-btn"
            onClick={() => csvInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white font-bold rounded-xl transition-all"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          {/* Add Lead button */}
          <button
            id="lead-create-btn"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* CSV format hint */}
      <div className="flex items-start gap-2 px-4 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-xs text-emerald-300">
        <FileText className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-400" />
        <span>
          <strong>Apollo.io / Excel CSV columns supported:</strong>{' '}
          <code className="font-mono text-emerald-200">Name</code>,{' '}
          <code className="font-mono text-emerald-200">First Name</code>,{' '}
          <code className="font-mono text-emerald-200">Last Name</code>,{' '}
          <code className="font-mono text-emerald-200">Email</code>,{' '}
          <code className="font-mono text-emerald-200">Company</code>,{' '}
          <code className="font-mono text-emerald-200">Title</code>,{' '}
          <code className="font-mono text-emerald-200">Source</code>.{' '}
          Duplicates are skipped automatically.
        </span>
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

        {/* Source filter */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 overflow-x-auto">
          {['all', 'Main B2B Agency', 'ClippingBD', 'Personal Portfolio', 'CSV Import'].map(s => (
            <button
              key={s}
              onClick={() => setSourceFilter(s)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                sourceFilter === s
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {s === 'all' ? 'All Sources' : s}
            </button>
          ))}
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

      {/* Single lead create form */}
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
              { key: 'name',    label: 'Full Name *',  required: true,  placeholder: 'John Doe' },
              { key: 'email',   label: 'Email *',       required: true,  placeholder: 'john@example.com' },
              { key: 'company', label: 'Company',       required: false, placeholder: 'Acme Corp' },
              { key: 'budget',  label: 'Budget',        required: false, placeholder: '$5,000 – $10,000' },
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
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
              >
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
                    {getSourceBadge(lead.source)}
                    {lead.budget && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-400/10 text-green-400">
                        {lead.budget}
                      </span>
                    )}
                    {lead.hasNewReply && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        New Reply
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {lead.email} · {new Date(lead.createdAt || new Date().toISOString()).toLocaleDateString()}
                  </p>
                  {lead.serviceRequested && (
                    <p className="text-xs text-blue-400 mt-1 truncate">
                      <span className="font-bold">Role/Service:</span> {lead.serviceRequested}
                    </p>
                  )}
                  {lead.message && (
                    <p className="text-xs text-slate-400 mt-1 truncate">{lead.message}</p>
                  )}
                  {lead.hasNewReply && lead.lastReplySnippet && (
                    <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 max-w-2xl">
                      <p className="text-sm text-slate-300 italic mb-2">"{lead.lastReplySnippet}"</p>
                      <button 
                        onClick={() => handleAcknowledge(lead.id)}
                        className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 hover:text-white hover:bg-emerald-500/20 px-2 py-1 rounded transition"
                      >
                        Acknowledge Reply
                      </button>
                    </div>
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
