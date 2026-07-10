'use client';

import { useState } from 'react';
import { Users, Mail, Building, DollarSign, Clock, CheckCircle2, ChevronDown, Trash2, XCircle, Search, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateLeadStatus, deleteLead } from '@/lib/actions/crm.actions';
import { Lead, LeadStatus } from '@/types';

export default function CrmClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    converted: leads.filter(l => l.status === 'converted').length,
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleStatusChange = async (id: string, newStatus: LeadStatus) => {
    setUpdatingId(id);
    // Optimistic update
    setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
    
    const res = await updateLeadStatus(id, newStatus);
    if (res.success) {
      toast.success('Lead status updated');
    } else {
      toast.error('Failed to update status');
      // Revert on failure
      setLeads(initialLeads);
    }
    setUpdatingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    setUpdatingId(id);
    const res = await deleteLead(id);
    if (res.success) {
      toast.success('Lead deleted');
      setLeads(leads.filter(l => l.id !== id));
    } else {
      toast.error('Failed to delete lead');
    }
    setUpdatingId(null);
  };

  const statusColors: Record<LeadStatus, string> = {
    new: 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    contacted: 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20',
    proposal: 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
    converted: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    closed: 'bg-slate-200 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-500/20',
  };

  const cardClasses = "bg-white border-slate-200 dark:bg-white/5 dark:border-white/10 backdrop-blur-md rounded-2xl border shadow-sm dark:shadow-none";

  return (
    <div className="w-full h-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-blue-600 dark:text-cyan-400 mb-2">
            <Users className="w-5 h-5" />
            <span className="font-semibold uppercase tracking-wider text-sm">CRM Dashboard</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Lead{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-cyan-400 dark:to-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.2)] dark:drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              Management
            </span>
          </h1>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`${cardClasses} p-6 flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Leads</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
          </div>
        </div>
        <div className={`${cardClasses} p-6 flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">New Inquiries</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.new}</p>
          </div>
        </div>
        <div className={`${cardClasses} p-6 flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Converted</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.converted}</p>
          </div>
        </div>
      </div>

      {/* Data Table Area */}
      <div className={`${cardClasses} flex flex-col h-[calc(100vh-320px)] min-h-[500px]`}>
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 flex flex-col sm:flex-row justify-between gap-4 rounded-t-2xl">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input 
              type="text"
              placeholder="Search leads by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-[#00F2FE] transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 dark:bg-[#0a0f1c] z-10 shadow-sm border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Budget / Source</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pipeline Stage</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5 relative">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 align-top">
                      <div className="font-semibold text-slate-900 dark:text-white mb-1">{lead.name}</div>
                      {lead.company && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <Building className="w-3 h-3" /> {lead.company}
                        </div>
                      )}
                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mb-1">
                        <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <a href={`mailto:${lead.email}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{lead.email}</a>
                      </div>
                      {lead.message && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 max-w-xs" title={lead.message}>
                          "{lead.message}"
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                        <DollarSign className="w-4 h-4" />
                        Custom
                      </div>
                      <div className="text-xs text-slate-500 capitalize px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded w-fit mt-2">
                        Organic
                      </div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="relative inline-block w-full max-w-[160px]">
                        <select
                          disabled={updatingId === lead.id}
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                          className={`appearance-none w-full border text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00F2FE]/50 transition-all ${statusColors[lead.status] || ''} disabled:opacity-50`}
                        >
                          <option value="new" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">New</option>
                          <option value="contacted" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Contacted</option>
                          <option value="proposal" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Proposal</option>
                          <option value="converted" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Converted</option>
                          <option value="closed" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Closed</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-50" />
                      </div>
                    </td>

                    <td className="px-6 py-4 align-top text-right">
                      <button 
                        onClick={() => handleDelete(lead.id)}
                        disabled={updatingId === lead.id}
                        className="p-2 inline-flex bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-lg border border-red-200 dark:border-red-500/20 transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
                        title="Delete Lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
