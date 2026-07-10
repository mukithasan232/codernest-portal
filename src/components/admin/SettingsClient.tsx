'use client';

import { useState, useRef } from 'react';
import { Settings, Palette, Mail, LayoutTemplate, Save, Image as ImageIcon, Check, Loader2, Edit3, Trash2, ChevronLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateAppearance, updateSmtpConfig, deleteEmailTemplate, testSmtpConnection } from '@/lib/actions/admin.actions';
import EmailEditor from './EmailEditor';

export default function SettingsClient({ initialSettings, initialTemplates }: { initialSettings: any, initialTemplates: any[] }) {
  const [activeTab, setActiveTab] = useState<'appearance' | 'smtp' | 'templates'>('appearance');
  
  // Appearance State
  const [siteName, setSiteName] = useState(initialSettings?.site_name || 'CoderNest');
  const [primaryColor, setPrimaryColor] = useState(initialSettings?.primary_color || '#3B82F6');
  const [logoPreview, setLogoPreview] = useState<string | null>(initialSettings?.logo_url || null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(initialSettings?.favicon_url || null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [isSavingAppearance, setIsSavingAppearance] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // SMTP State
  const [smtpConfig, setSmtpConfig] = useState({
    host: initialSettings?.smtp_config?.host || '',
    port: initialSettings?.smtp_config?.port || '',
    user: initialSettings?.smtp_config?.user || '',
    password: initialSettings?.smtp_config?.password || ''
  });
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);

  // Templates State
  const [viewingEditor, setViewingEditor] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  // Handlers
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFaviconFile(file);
      setFaviconPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveAppearance = async () => {
    setIsSavingAppearance(true);
    const formData = new FormData();
    formData.append('site_name', siteName);
    formData.append('primary_color', primaryColor);
    if (logoFile) {
      formData.append('logo_file', logoFile);
    }
    if (faviconFile) {
      formData.append('favicon_file', faviconFile);
    }
    formData.append('current_logo_url', initialSettings?.logo_url || '');
    formData.append('current_favicon_url', initialSettings?.favicon_url || '');

    const res = await updateAppearance(formData);
    if (res.success) {
      toast.success('Appearance updated successfully!');
    } else {
      toast.error(res.error || 'Failed to update appearance.');
    }
    setIsSavingAppearance(false);
  };

  const handleSaveSmtp = async () => {
    setIsSavingSmtp(true);
    const res = await updateSmtpConfig(smtpConfig);
    if (res.success) {
      toast.success('SMTP configuration saved!');
    } else {
      toast.error(res.error || 'Failed to save SMTP.');
    }
    setIsSavingSmtp(false);
  };

  const handleTestEmail = async () => {
    setIsTestingSmtp(true);
    const toastId = toast.loading('Connecting to SMTP server...');
    const res = await testSmtpConnection(smtpConfig);
    if (res.success) {
      toast.success('Connection successful! Test email sent.', { id: toastId });
    } else {
      toast.error(res.error || 'SMTP Connection failed.', { id: toastId });
    }
    setIsTestingSmtp(false);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    const res = await deleteEmailTemplate(id);
    if (res.success) toast.success('Template deleted');
    else toast.error(res.error || 'Error deleting template');
  };

  if (viewingEditor) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => { setViewingEditor(false); setEditingTemplate(null); }}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Templates
        </button>
        <EmailEditor 
          initialTemplate={editingTemplate} 
          onSuccess={() => { setViewingEditor(false); setEditingTemplate(null); }} 
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full animate-in fade-in duration-500">
      <div className="flex items-center gap-3 text-slate-400 mb-8">
        <Settings className="w-6 h-6 text-blue-500" />
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Settings</h1>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-black/20 p-1.5 rounded-2xl w-fit border border-white/5">
        <button 
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'appearance' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Palette className="w-4 h-4" /> Appearance
        </button>
        <button 
          onClick={() => setActiveTab('smtp')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'smtp' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Mail className="w-4 h-4" /> SMTP Settings
        </button>
        <button 
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'templates' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <LayoutTemplate className="w-4 h-4" /> Email Templates
        </button>
      </div>

      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8">
        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Site Name</h2>
              <p className="text-sm text-slate-400 mb-4">The global name of your application, displayed in browser tabs and emails.</p>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="CoderNest"
                className="w-full max-w-md bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div className="w-full max-w-md h-px bg-white/10" />

            <div>
              <h2 className="text-xl font-bold text-white mb-2">Brand Assets</h2>
              <p className="text-sm text-slate-400 mb-6">Upload your primary logo and browser favicon.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                {/* Logo Uploader */}
                <div 
                  className="w-full h-40 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center bg-black/20 hover:bg-white/5 hover:border-blue-500/50 transition-all cursor-pointer overflow-hidden relative group"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {logoPreview ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoPreview} alt="Logo Preview" className="w-auto h-20 object-contain" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-white font-medium text-sm">Change Logo</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <span className="text-sm text-slate-300 font-medium">Upload Logo</span>
                    </div>
                  )}
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                </div>

                {/* Favicon Uploader */}
                <div 
                  className="w-full h-40 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center bg-black/20 hover:bg-white/5 hover:border-blue-500/50 transition-all cursor-pointer overflow-hidden relative group"
                  onClick={() => faviconInputRef.current?.click()}
                >
                  {faviconPreview ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={faviconPreview} alt="Favicon Preview" className="w-auto h-16 object-contain" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-white font-medium text-sm">Change Favicon</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <span className="text-sm text-slate-300 font-medium">Upload Favicon</span>
                    </div>
                  )}
                  <input ref={faviconInputRef} type="file" accept=".ico,.png,.svg" className="hidden" onChange={handleFaviconChange} />
                </div>
              </div>
            </div>

            <div className="w-full max-w-2xl h-px bg-white/10" />

            <div>
              <h2 className="text-xl font-bold text-white mb-2">Primary Color</h2>
              <p className="text-sm text-slate-400 mb-6">Set the primary accent color used for buttons and active states.</p>
              <div className="flex items-center gap-4">
                <input 
                  type="color" 
                  value={primaryColor} 
                  onChange={(e) => setPrimaryColor(e.target.value)} 
                  className="w-14 h-14 rounded-xl cursor-pointer bg-transparent border-0"
                />
                <input 
                  type="text" 
                  value={primaryColor} 
                  onChange={(e) => setPrimaryColor(e.target.value)} 
                  className="bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white font-mono"
                />
              </div>
            </div>

            <button 
              onClick={handleSaveAppearance}
              disabled={isSavingAppearance}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              {isSavingAppearance ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Appearance
            </button>
          </div>
        )}

        {/* SMTP Tab */}
        {activeTab === 'smtp' && (
          <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-left-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">SMTP Configuration</h2>
              <p className="text-sm text-slate-400 mb-6">Configure the global mail server for sending transactional emails.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">SMTP Host</label>
                <input 
                  type="text"
                  value={smtpConfig.host}
                  onChange={(e) => setSmtpConfig({...smtpConfig, host: e.target.value})}
                  placeholder="smtp.resend.com"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">SMTP Port</label>
                <input 
                  type="text"
                  value={smtpConfig.port}
                  onChange={(e) => setSmtpConfig({...smtpConfig, port: e.target.value})}
                  placeholder="465"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-400 mb-2">Username</label>
                <input 
                  type="text"
                  value={smtpConfig.user}
                  onChange={(e) => setSmtpConfig({...smtpConfig, user: e.target.value})}
                  placeholder="resend"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
                <input 
                  type="password"
                  value={smtpConfig.password}
                  onChange={(e) => setSmtpConfig({...smtpConfig, password: e.target.value})}
                  placeholder="••••••••••••••••"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/10">
              <button 
                onClick={handleSaveSmtp}
                disabled={isSavingSmtp}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
              >
                {isSavingSmtp ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save SMTP Settings
              </button>
              <button 
                onClick={handleTestEmail}
                disabled={isTestingSmtp}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                {isTestingSmtp ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Test Connection
              </button>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="animate-in fade-in slide-in-from-left-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Email Templates</h2>
                <p className="text-sm text-slate-400">Manage rich-text automated email templates.</p>
              </div>
              <button 
                onClick={() => { setEditingTemplate(null); setViewingEditor(true); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all"
              >
                <LayoutTemplate className="w-4 h-4" /> Create New
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {initialTemplates.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500 bg-black/20 rounded-2xl border border-white/5 hover:border-white/10 border-dashed">
                  No templates created yet.
                </div>
              ) : (
                initialTemplates.map(t => (
                  <div key={t.id} className="bg-black/20 border border-white/10 rounded-2xl p-5 hover:border-blue-500/50 transition-all group flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{t.name}</h3>
                      <p className="text-sm text-slate-400 mb-4 line-clamp-2">Subj: {t.subject}</p>
                    </div>
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingTemplate(t); setViewingEditor(true); }}
                        className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteTemplate(t.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
