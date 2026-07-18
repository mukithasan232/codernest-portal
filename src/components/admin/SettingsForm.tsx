'use client';

import { useState } from 'react';
import { updateGlobalSettings } from '@/lib/actions/settings.actions';
import { Save, Image as ImageIcon, PaintBucket, Building, Mail, Link as LinkIcon, Code } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsForm({ initialSettings }: { initialSettings: any }) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('branding');
  const [formData, setFormData] = useState({
    siteName: initialSettings?.siteName || 'CoderNest',
    siteTitle: initialSettings?.siteTitle || 'Elite B2B software agency',
    logoUrl: initialSettings?.logoUrl || '',
    faviconUrl: initialSettings?.faviconUrl || '',
    brandColor: initialSettings?.brandColor || '#3B82F6',
    secondaryColor: initialSettings?.secondaryColor || '#00F2FE',
    
    address: initialSettings?.address || '',
    primaryEmail: initialSettings?.primaryEmail || '',
    supportEmail: initialSettings?.supportEmail || '',
    phone: initialSettings?.phone || '',
    
    smtpHost: initialSettings?.smtpHost || '',
    smtpPort: initialSettings?.smtpPort || '',
    smtpUser: initialSettings?.smtpUser || '',
    smtpPassword: initialSettings?.smtpPassword || '',
    
    googleAnalyticsId: initialSettings?.googleAnalyticsId || '',
    facebookPixelId: initialSettings?.facebookPixelId || '',
    customHeaderScripts: initialSettings?.customHeaderScripts || '',
    customFooterScripts: initialSettings?.customFooterScripts || '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    const payload = {
      ...formData,
      smtpPort: formData.smtpPort ? parseInt(formData.smtpPort as string) : null,
    };
    
    const res = await updateGlobalSettings(payload);
    if (res.success) {
      toast.success('Global settings saved successfully!');
    } else {
      toast.error('Failed to save: ' + res.error);
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'branding', label: 'Branding' },
    { id: 'contact', label: 'Contact Details' },
    { id: 'smtp', label: 'SMTP / Email' },
    { id: 'integrations', label: 'Integrations' },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-white/10 overflow-x-auto hide-scrollbar">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 font-bold border-b-2 transition whitespace-nowrap ${activeTab === tab.id ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-white/[0.02] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none p-6 md:p-8 min-h-[500px]">
        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-2">
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Brand Identity</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Site Name</label>
                <input 
                  type="text" 
                  value={formData.siteName} 
                  onChange={e => handleChange('siteName', e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Site Title (SEO)</label>
                <input 
                  type="text" 
                  value={formData.siteTitle} 
                  onChange={e => handleChange('siteTitle', e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-500" /> Logo URL
                </label>
                <input 
                  type="text" 
                  value={formData.logoUrl} 
                  onChange={e => handleChange('logoUrl', e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Favicon URL</label>
                <input 
                  type="text" 
                  value={formData.faviconUrl} 
                  onChange={e => handleChange('faviconUrl', e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <PaintBucket className="w-4 h-4 text-blue-500" /> Primary Brand Color
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={formData.brandColor} 
                    onChange={e => handleChange('brandColor', e.target.value)} 
                    className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input 
                    type="text" 
                    value={formData.brandColor} 
                    onChange={e => handleChange('brandColor', e.target.value)} 
                    className="w-[150px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <PaintBucket className="w-4 h-4 text-purple-500" /> Secondary Brand Color
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={formData.secondaryColor} 
                    onChange={e => handleChange('secondaryColor', e.target.value)} 
                    className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input 
                    type="text" 
                    value={formData.secondaryColor} 
                    onChange={e => handleChange('secondaryColor', e.target.value)} 
                    className="w-[150px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Live Preview Pane */}
            <div className="bg-slate-100 dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                <span className="w-3 h-3 rounded-full bg-green-400"></span>
              </div>
              <h3 className="absolute top-4 font-semibold text-slate-400 text-sm">Live Preview</h3>
              
              <div className="w-full max-w-sm bg-white dark:bg-[#030712] rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 mt-8" style={{ '--preview-color': formData.brandColor, '--preview-secondary': formData.secondaryColor } as any}>
                {/* Dummy Navbar */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    {formData.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={formData.logoUrl} alt="Logo" className="h-6 w-auto object-contain" />
                    ) : (
                      <div className="w-6 h-6 rounded-md" style={{ background: 'linear-gradient(to right, var(--preview-secondary), var(--preview-color))' }} />
                    )}
                    <span>{formData.siteName}</span>
                  </div>
                  <div className="w-6 h-1 rounded-full bg-slate-200 dark:bg-white/10"></div>
                </div>
                {/* Dummy Hero */}
                <div className="p-8 text-center space-y-4">
                  <div className="h-2 w-32 bg-slate-200 dark:bg-white/10 rounded-full mx-auto mb-4"></div>
                  <h4 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                    {formData.siteTitle || 'The Future of Web'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    See your brand color dynamically applied in real-time.
                  </p>
                  <button 
                    className="mt-4 px-6 py-2.5 text-white font-bold rounded-full transition-opacity hover:opacity-90 shadow-lg shadow-black/10"
                    style={{ background: 'linear-gradient(to right, var(--preview-secondary), var(--preview-color))' }}
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="max-w-xl space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-500" /> Physical Address
              </label>
              <input 
                type="text" 
                value={formData.address} 
                onChange={e => handleChange('address', e.target.value)} 
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
              <input 
                type="text" 
                value={formData.phone} 
                onChange={e => handleChange('phone', e.target.value)} 
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Primary Email</label>
              <input 
                type="email" 
                value={formData.primaryEmail} 
                onChange={e => handleChange('primaryEmail', e.target.value)} 
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Support Email</label>
              <input 
                type="email" 
                value={formData.supportEmail} 
                onChange={e => handleChange('supportEmail', e.target.value)} 
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* SMTP Tab */}
        {activeTab === 'smtp' && (
          <div className="max-w-xl space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-xl">
              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-400">Configure the outgoing mail server used for notifications and client communication.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">SMTP Host</label>
              <input 
                type="text" 
                value={formData.smtpHost} 
                onChange={e => handleChange('smtpHost', e.target.value)} 
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="smtp.resend.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">SMTP Port</label>
              <input 
                type="number" 
                value={formData.smtpPort} 
                onChange={e => handleChange('smtpPort', e.target.value)} 
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="465"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">SMTP User</label>
              <input 
                type="text" 
                value={formData.smtpUser} 
                onChange={e => handleChange('smtpUser', e.target.value)} 
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">SMTP Password</label>
              <input 
                type="password" 
                value={formData.smtpPassword} 
                onChange={e => handleChange('smtpPassword', e.target.value)} 
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Google Analytics ID (GA4)</label>
              <input 
                type="text" 
                value={formData.googleAnalyticsId} 
                onChange={e => handleChange('googleAnalyticsId', e.target.value)} 
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="G-XXXXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Meta Pixel ID</label>
              <input 
                type="text" 
                value={formData.facebookPixelId} 
                onChange={e => handleChange('facebookPixelId', e.target.value)} 
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-500" /> Custom Header Scripts (&lt;head&gt;)
              </label>
              <textarea 
                rows={6}
                value={formData.customHeaderScripts} 
                onChange={e => handleChange('customHeaderScripts', e.target.value)} 
                className="w-full bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="<script>...</script>"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-500" /> Custom Footer Scripts (&lt;body&gt; end)
              </label>
              <textarea 
                rows={6}
                value={formData.customFooterScripts} 
                onChange={e => handleChange('customFooterScripts', e.target.value)} 
                className="w-full bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="<script>...</script>"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSave} 
          disabled={loading}
          className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)] disabled:opacity-50"
        >
          <Save className="w-5 h-5" /> {loading ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}
