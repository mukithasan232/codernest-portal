'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Key, Save, Server, ShieldCheck, ExternalLink, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiKeys, saveApiKeys, ApiKeys } from '@/actions/job-hunter.actions';

function ApiSettingsContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ApiKeys>({
    upworkApiKey: '',
    upworkAccessToken: '',
    upworkRefreshToken: '',
    legiitApiKey: '',
    fiverrWebhookUrl: ''
  });
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle OAuth Callback Notifications
    const upworkConnected = searchParams.get('upwork_connected');
    const upworkError = searchParams.get('upwork_error');

    if (upworkConnected === 'true') {
      toast.success('Upwork account connected successfully!');
    } else if (upworkError) {
      toast.error(`Upwork connection failed: ${upworkError.replace(/_/g, ' ')}`);
    }

    async function loadKeys() {
      try {
        const keys = await getApiKeys();
        setFormData(keys);
      } catch (error) {
        toast.error('Failed to load API configurations.');
      } finally {
        setLoading(false);
      }
    }
    loadKeys();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await saveApiKeys(formData);
      if (res.success) {
        toast.success('API configurations saved successfully!');
      } else {
        toast.error(res.error || 'Failed to save configurations.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-500">Loading configurations...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Key className="w-8 h-8 text-purple-500" />
          API Integrations
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Manage API keys and webhook URLs to connect CoderNest with external freelancing platforms.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-white/5">
          <ShieldCheck className="w-6 h-6 text-green-500 shrink-0" />
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Keys are stored securely. Do not share your API credentials with unauthorized personnel.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">Upwork API Key (Client ID)</span>
              {formData.upworkAccessToken && (
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-md">
                  <CheckCircle className="w-3.5 h-3.5" /> OAuth Connected
                </span>
              )}
            </label>
            <input
              type="password"
              name="upworkApiKey"
              value={formData.upworkApiKey}
              onChange={handleChange}
              placeholder="e.g. upw_1234567890abcdef"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-slate-500">Required to initiate OAuth 2.0 flow.</p>
              {!formData.upworkAccessToken && formData.upworkApiKey && (
                <a 
                  href="/api/auth/upwork" 
                  className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                >
                  Connect Upwork Account <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              Legiit API Key
            </label>
            <input
              type="password"
              name="legiitApiKey"
              value={formData.legiitApiKey}
              onChange={handleChange}
              placeholder="e.g. leg_1234567890abcdef"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
            />
            <p className="text-xs text-slate-500 mt-2">Required for accessing the Legiit Leads API.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              Fiverr Webhook URL
            </label>
            <input
              type="url"
              name="fiverrWebhookUrl"
              value={formData.fiverrWebhookUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
            />
            <p className="text-xs text-slate-500 mt-2">The endpoint URL for receiving real-time buyer requests from Fiverr.</p>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Configurations
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ApiSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500">Loading configurations...</div>}>
      <ApiSettingsContent />
    </Suspense>
  );
}
