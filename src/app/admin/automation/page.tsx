'use client';

import { useState, useEffect } from 'react';
import { Mail, Settings, Save, Loader2, Workflow, Play, Power, PowerOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCampaignSettings, updateCampaignSettings, getAutomationLeads, updateAutomationLeadStatus } from '@/lib/actions/automation.actions';
import { getAutomationWorkflows, setWorkflowState, runManualTrigger } from '@/lib/actions/n8n.actions';
import { getGlobalSettings, updateGlobalSettings } from '@/lib/actions/settings.actions';
import N8nEmbed from '@/components/admin/n8n/N8nEmbed';

export default function AutomationDashboard() {
  const [activeTab, setActiveTab] = useState<'leads' | 'settings' | 'n8n'>('n8n');
  const [leads, setLeads] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingWebhook, setSavingWebhook] = useState(false);
  
  // n8n Webhook State
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState('');

  // Settings Form State
  const [limit, setLimit] = useState(50);
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [leadsRes, settingsRes, workflowsRes, globalSettingsRes] = await Promise.all([
      getAutomationLeads(),
      getCampaignSettings(),
      getAutomationWorkflows(),
      getGlobalSettings(),
    ]);

    if (leadsRes.success) setLeads(leadsRes.data);
    if (settingsRes.success && settingsRes.data) {
      setSettings(settingsRes.data);
      setLimit(settingsRes.data.daily_email_limit || 50);
      setSmtpHost(settingsRes.data.smtp_host || '');
      setSmtpPort(settingsRes.data.smtp_port || 587);
      setSmtpUser(settingsRes.data.smtp_user || '');
      setSmtpPass(settingsRes.data.smtp_pass || '');
    }
    if (workflowsRes.success && workflowsRes.data) {
      setWorkflows(workflowsRes.data);
    }
    if (globalSettingsRes.success && globalSettingsRes.data) {
      // Force TS recheck
      const data: any = globalSettingsRes.data;
      setN8nWebhookUrl(data.n8nWebhookUrl || '');
    }
    setLoading(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await updateCampaignSettings({
        daily_email_limit: limit,
        smtp_host: smtpHost,
        smtp_port: smtpPort,
        smtp_user: smtpUser,
        smtp_pass: smtpPass,
      });

      if (res.success) {
        toast.success('Settings updated successfully!');
        setSettings(res.data);
      } else {
        toast.error('Failed to update settings.');
      }
    } catch (error) {
      toast.error('An error occurred while saving.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWebhook(true);
    try {
      const res = await updateGlobalSettings({ n8nWebhookUrl });
      if (res.success) {
        toast.success('n8n Webhook URL saved successfully!');
      } else {
        toast.error(res.error || 'Failed to save webhook URL.');
      }
    } catch (error) {
      console.error('Error saving webhook URL:', error);
      toast.error('An error occurred while saving.');
    } finally {
      setSavingWebhook(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setLeads(prev => prev.map(l => l._id === id ? { ...l, status: newStatus } : l));
    const res = await updateAutomationLeadStatus(id, newStatus);
    if (res.success) {
      toast.success('Lead status updated!');
    } else {
      toast.error('Failed to update status.');
    }
  };

  const toggleWorkflow = async (id: string, currentActive: boolean) => {
    // Optimistic UI update
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, active: !currentActive } : w));
    const res = await setWorkflowState(id, !currentActive);
    if (res.success) {
      toast.success(`Workflow ${!currentActive ? 'activated' : 'deactivated'}!`);
    } else {
      // Revert on failure
      setWorkflows(prev => prev.map(w => w.id === id ? { ...w, active: currentActive } : w));
      toast.error(res.error || 'Failed to toggle workflow.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Marketing Automation</h1>
          <p className="text-slate-400 mt-1">Manage intake leads, email settings, and n8n workflows.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('n8n')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === 'n8n' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Workflow className="w-4 h-4" /> Workflow Engine (n8n)
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === 'leads' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Mail className="w-4 h-4" /> Intake Leads
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === 'settings' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" /> Campaign Settings
        </button>
      </div>

      {activeTab === 'n8n' ? (
        <div className="space-y-8">
          {/* Headless REST API Workflow Controls */}
          <div className="glass rounded-3xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Active Workflows</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {workflows.length === 0 ? (
                <p className="text-slate-500 text-sm">No workflows found in n8n. Check your API credentials.</p>
              ) : (
                workflows.map((wf) => (
                  <div key={wf.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between hover:bg-white/10 transition">
                    <div>
                      <h3 className="font-bold text-white text-sm">{wf.name}</h3>
                      <p className={`text-xs mt-1 font-semibold ${wf.active ? 'text-green-400' : 'text-slate-500'}`}>
                        {wf.active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleWorkflow(wf.id, wf.active)}
                      className={`p-2 rounded-xl transition ${
                        wf.active ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                      }`}
                      title={wf.active ? 'Deactivate Workflow' : 'Activate Workflow'}
                    >
                      {wf.active ? <PowerOff className="w-5 h-5" /> : <Power className="w-5 h-5" />}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Webhook Configuration */}
          <div className="glass rounded-3xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Webhook Configuration</h2>
            <form onSubmit={handleSaveWebhook} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-300 mb-2">n8n Lead Intake Webhook URL</label>
                <input
                  type="url"
                  placeholder="https://n8n.yourdomain.com/webhook/..."
                  value={n8nWebhookUrl}
                  onChange={e => setN8nWebhookUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>
              <button
                type="submit"
                disabled={savingWebhook}
                className="flex justify-center items-center gap-2 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl py-3 transition disabled:opacity-50"
              >
                {savingWebhook ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save
              </button>
            </form>
          </div>

          {/* Embedded n8n Canvas */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Visual Canvas</h2>
              <span className="text-xs font-semibold bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">
                Live Connection
              </span>
            </div>
            
            {/* The Embed Component */}
            <N8nEmbed 
              n8nUrl={process.env.NEXT_PUBLIC_N8N_URL || 'http://localhost:5678'} 
            />
          </div>
        </div>
      ) : activeTab === 'leads' ? (
        <div className="glass rounded-3xl border border-white/10 overflow-hidden">
          <div className="divide-y divide-white/5">
            {leads.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No automation leads found.
              </div>
            ) : leads.map(lead => (
              <div key={lead._id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/5 transition">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold flex-shrink-0">
                    {lead.name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white">{lead.name}</h3>
                    <p className="text-xs text-slate-500">{lead.email} {lead.phone && `· ${lead.phone}`}</p>
                    <p className="text-xs text-blue-400 mt-1"><span className="font-bold">Service:</span> {lead.service_type}</p>
                  </div>
                </div>

                <select
                  value={lead.status}
                  onChange={e => handleStatusChange(lead._id, e.target.value)}
                  className="text-xs font-bold px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 transition cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="emailed">Emailed</option>
                  <option value="replied">Replied</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl glass rounded-3xl border border-white/10 p-8">
          <h2 className="text-xl font-bold text-white mb-6">Email Campaign Settings</h2>
          
          {settings && (
            <div className="mb-8 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-blue-400">Emails Sent Today</p>
                <p className="text-2xl font-black text-white">{settings.emails_sent_today} / {settings.daily_email_limit}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Last Reset</p>
                <p className="text-sm text-white font-medium">{new Date(settings.last_reset_date).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Max Emails Per Day</label>
              <input
                type="number"
                required
                min={1}
                value={limit}
                onChange={e => setLimit(parseInt(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">SMTP Host</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={e => setSmtpHost(e.target.value)}
                  placeholder="smtp.gmail.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">SMTP Port</label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={e => setSmtpPort(parseInt(e.target.value))}
                  placeholder="587"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">SMTP User</label>
              <input
                type="email"
                value={smtpUser}
                onChange={e => setSmtpUser(e.target.value)}
                placeholder="youremail@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">SMTP Password</label>
              <input
                type="password"
                value={smtpPass}
                onChange={e => setSmtpPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl py-3 transition disabled:opacity-50"
            >
              {savingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Settings
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
