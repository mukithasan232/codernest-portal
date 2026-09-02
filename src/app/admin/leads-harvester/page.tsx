'use client';

import { useState, useEffect } from 'react';
import { saveScrapedLead, getRecentLeads } from '@/actions/lead-collector.actions';
import { Globe, PlusCircle, Server, Code, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LeadHarvesterPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    source: 'Manual',
    requirements: '',
  });

  const [recentLeads, setRecentLeads] = useState<any[]>([]);

  const loadRecentLeads = async () => {
    const res = await getRecentLeads(5);
    if (res.success && res.leads) {
      setRecentLeads(res.leads);
    }
  };

  useEffect(() => {
    loadRecentLeads();
    // Optional: Set an interval to poll for new webhook leads every 15 seconds
    const interval = setInterval(loadRecentLeads, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await saveScrapedLead(formData);
      
      if (response.success) {
        toast.success(response.message || 'Lead successfully harvested and synced!');
        // Reset form on success
        setFormData({
          name: '',
          email: '',
          source: 'Manual',
          requirements: '',
        });
        loadRecentLeads(); // Refresh the list
      } else {
        toast.error(response.error || 'Failed to sync lead.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Globe className="w-8 h-8 text-blue-500" />
          Lead Harvester
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Extract, validate, and synchronize leads from multiple platforms into the CoderNest CRM.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Manual Ingestion Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <PlusCircle className="w-5 h-5 text-blue-500" />
              Manual Ingestion
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Client Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Jane Doe"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="jane@example.com"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Lead Source
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                >
                  <option value="Legiit">Legiit</option>
                  <option value="Fiverr">Fiverr</option>
                  <option value="Upwork">Upwork</option>
                  <option value="Manual">Manual</option>
                  <option value="Website">Website</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Project Requirements / Notes
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Summarize the client's project brief..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white resize-none"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Server className="w-5 h-5" />
                      Sync Lead to CRM
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: Instructions & Stats */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <Code className="w-5 h-5 text-blue-200" />
              API Integration
            </h3>
            <p className="text-blue-100 text-sm mb-4">
              You can automatically post leads to this system using external scrapers or webhooks.
            </p>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/10 text-xs font-mono mb-4 overflow-x-auto">
              <span className="text-pink-400">POST</span> /api/webhooks/leads<br/>
              <span className="text-blue-300">{'{'}</span><br/>
              &nbsp;&nbsp;<span className="text-slate-300">"name"</span>: <span className="text-green-300">"Client Name"</span>,<br/>
              &nbsp;&nbsp;<span className="text-slate-300">"email"</span>: <span className="text-green-300">"client@email.com"</span>,<br/>
              &nbsp;&nbsp;<span className="text-slate-300">"source"</span>: <span className="text-green-300">"Upwork"</span>,<br/>
              &nbsp;&nbsp;<span className="text-slate-300">"requirements"</span>: <span className="text-green-300">"Need a SaaS..."</span><br/>
              <span className="text-blue-300">{'}'}</span>
            </div>
            <p className="text-xs text-blue-200">
              Payloads are automatically sanitized and validated before insertion.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Validation Rules</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                <span>Names are auto-capitalized and trimmed.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                <span>Invalid emails throw a validation error.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                <span>Duplicate emails are ignored (activity updated).</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* Recent Automated Leads */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Recent Automated Leads
          </h2>
          <span className="text-sm text-slate-500 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live Feed
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-white/10">
                <th className="px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Name & Email</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Source</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {recentLeads.length > 0 ? recentLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-white">{lead.name}</div>
                    <div className="text-sm text-slate-500">{lead.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                      {lead.source}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {new Date(lead.updatedAt).toLocaleString()}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-500 text-sm">
                    No leads harvested yet. Webhook integrations will appear here automatically.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
