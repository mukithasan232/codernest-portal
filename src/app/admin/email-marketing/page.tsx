'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Mail, Send, Users, FileText, Loader2, CheckCircle2, LayoutTemplate, Code2, Type, BarChart3, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendEmailCampaignAction, getLeadsForCampaign, saveEmailTemplateAction, getEmailTemplatesAction, deleteEmailTemplateAction, updateEmailTemplateAction } from '@/lib/actions/email-campaign.actions';
import { isDummyEmail } from '@/utils/email';
import Editor from '@monaco-editor/react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const PREDEFINED_TEMPLATES = [
  {
    id: 'cold-outreach',
    name: 'Cold Outreach - Web Dev',
    subject: 'Transform your web performance this quarter',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Hi {{name}},</h2>
  <p>I noticed that [Company] is growing quickly, but your website's performance might be holding back conversions.</p>
  <p>At CoderNest, we specialize in high-performance Next.js applications that load instantly and scale infinitely.</p>
  <a href="https://codernest.cloud" style="display: inline-block; padding: 10px 20px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px;">Let's Talk</a>
</div>`
  },
  {
    id: 'free-trial',
    name: 'Free Trial Offer',
    subject: 'Exclusive: 14-Day Free Trial for CoderNest',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
  <h2>Unlock Your 14-Day Free Trial</h2>
  <p>Ready to see what CoderNest can do for your business?</p>
  <p>Start your trial today and get full access to our premium enterprise tools.</p>
  <a href="https://codernest.cloud/pricing" style="display: inline-block; padding: 12px 24px; background-color: #8B5CF6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Start Free Trial</a>
</div>`
  },
  {
    id: 'follow-up',
    name: 'Follow-up',
    subject: 'Checking in on our last conversation',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <p>Hi {{name}},</p>
  <p>Just floating this to the top of your inbox. Are you still looking to upgrade your digital infrastructure this quarter?</p>
  <p>Best regards,<br/>The CoderNest Team</p>
</div>`
  }
];

export default function EmailMarketingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSuccess, setLastSuccess] = useState<string | null>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [dbTemplates, setDbTemplates] = useState<any[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Editor State
  const [activeTab, setActiveTab] = useState<'template' | 'html' | 'visual'>('html');
  const [subject, setSubject] = useState('');
  const [audience, setAudience] = useState('');
  const [htmlContent, setHtmlContent] = useState(PREDEFINED_TEMPLATES[0].html);

  const hasDummyEmails = useMemo(() => {
    if (!audience) return false;
    if (audience === 'all_leads') {
      return leads.some(lead => isDummyEmail(lead.email));
    } else if (audience.startsWith('lead_')) {
      const leadId = audience.replace('lead_', '');
      const lead = leads.find(l => l.id === leadId);
      return lead ? isDummyEmail(lead.email) : false;
    }
    
    if (['usa_leads', 'uk_leads', 'past_clients'].includes(audience)) {
      return true; // Backend uses @example.com for these mock options
    }
    return false;
  }, [audience, leads]);

  // Tiptap Editor for Visual Tab
  const tipTapEditor = useEditor({
    extensions: [StarterKit],
    content: htmlContent,
    onUpdate: ({ editor }) => {
      if (activeTab === 'visual') {
        setHtmlContent(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-blue max-w-none min-h-[400px] focus:outline-none p-4',
      },
    },
  });

  // Sync Tiptap when switching to Visual tab
  useEffect(() => {
    if (activeTab === 'visual' && tipTapEditor) {
      if (tipTapEditor.getHTML() !== htmlContent) {
        tipTapEditor.commands.setContent(htmlContent);
      }
    }
  }, [activeTab, htmlContent, tipTapEditor]);

  useEffect(() => {
    async function fetchData() {
      const leadsRes = await getLeadsForCampaign();
      if (leadsRes.success && leadsRes.data) {
        setLeads(leadsRes.data);
      }
      const tplRes = await getEmailTemplatesAction();
      if (tplRes.success && tplRes.data) {
        setDbTemplates(tplRes.data);
      }
      setIsLoadingLeads(false);
    }
    fetchData();
  }, []);

  const handleApplyTemplate = (template: { subject: string, html_body?: string, html?: string }) => {
    setSubject(template.subject);
    setHtmlContent(template.html_body || template.html || '');
    toast.success('Template applied!');
  };

  async function handleSaveTemplate() {
    if (!htmlContent || !subject) {
      toast.error('Subject and body are required to save a template.');
      return;
    }
    const name = prompt('Enter a name for this template:');
    if (!name) return;
    
    setIsSaving(true);
    try {
      const res = await saveEmailTemplateAction({ name, subject, html_body: htmlContent });
      if (res.error) {
        toast.error(res.error);
      } else if (res.success) {
        toast.success(res.message || 'Template saved!');
        setDbTemplates([res.data, ...dbTemplates]);
      }
    } catch (e) {
      toast.error('An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteTemplate(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const toastId = toast.loading('Deleting template...');
    const res = await deleteEmailTemplateAction(id);
    if (res.success) {
      toast.success('Template deleted.', { id: toastId });
      setDbTemplates(prev => prev.filter(t => t.id !== id));
    } else {
      toast.error(res.error || 'Failed to delete.', { id: toastId });
    }
  }

  function openEditModal(template: any) {
    setEditingTemplate(template);
    setEditName(template.name);
    setEditSubject(template.subject);
    setIsEditModalOpen(true);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTemplate) return;
    setIsSavingEdit(true);
    const res = await updateEmailTemplateAction(editingTemplate.id, {
      name: editName,
      subject: editSubject,
    });
    if (res.success) {
      toast.success('Template updated!');
      setDbTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, name: editName, subject: editSubject } : t));
      setIsEditModalOpen(false);
    } else {
      toast.error(res.error || 'Failed to update.');
    }
    setIsSavingEdit(false);
  }

  async function handleSendCampaign(formData: FormData) {
    if (!subject) {
      toast.error('Please enter an Email Subject before broadcasting.');
      return;
    }
    if (!htmlContent) {
      toast.error('Please add content to the Email Body before broadcasting.');
      return;
    }
    const audience = formData.get('audience');
    if (!audience) {
      toast.error('Please select a Target Audience before broadcasting.');
      return;
    }

    setIsSubmitting(true);
    setLastSuccess(null);
    
    try {
      formData.set('body', htmlContent); // Inject current editor content
      formData.set('subject', subject);

      const result = await sendEmailCampaignAction(formData);
      
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success(result.message || 'Campaign queued successfully!');
        setLastSuccess(result.message || 'Campaign Sent');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await handleSendCampaign(formData);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Email Campaigns Builder</h1>
            <p className="text-slate-400 mt-1">Design and broadcast high-converting emails to your CRM leads.</p>
          </div>
        </div>
        <Link 
          href="/admin/email-marketing/analytics"
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl border border-white/10 transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
          View Analytics
        </Link>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Settings Bar */}
        <div className="glass rounded-2xl border border-white/10 p-6 shadow-lg flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-2">
            <label htmlFor="audience" className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Users className="w-4 h-4 text-purple-400" />
              Target Audience
            </label>
            <select 
              name="audience" 
              id="audience" 
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              disabled={isLoadingLeads}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all disabled:opacity-50"
            >
              <option value="" disabled>
                {isLoadingLeads ? 'Loading audience data...' : 'Select an audience segment...'}
              </option>
              
              <optgroup label="Segments">
                <option value="all_leads">All CRM Leads ({leads.length} total)</option>
                <option value="usa_leads">USA Leads Only</option>
                <option value="uk_leads">UK Leads Only</option>
                <option value="past_clients">Past Clients</option>
              </optgroup>
              
              {leads.length > 0 && (
                <optgroup label="Individual Leads">
                  {leads.map(lead => (
                    <option key={lead.id} value={`lead_${lead.id}`}>
                      {lead.name} ({lead.email})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div className="flex-1 space-y-2">
            <label htmlFor="subject" className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <FileText className="w-4 h-4 text-purple-400" />
              Email Subject
            </label>
            <input 
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Transform your web performance this quarter..."
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>
        </div>

        {hasDummyEmails && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-5 py-4 rounded-xl flex items-center gap-3 shadow-lg">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p className="text-sm font-medium">
              <strong>Warning:</strong> The selected audience segment contains dummy or placeholder email addresses (e.g., example.com). These will be automatically skipped during broadcast to prevent bounce errors. Please clean your lead list.
            </p>
          </div>
        )}

        {/* Builder Area */}
        <div className="glass rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col h-[700px]">
          {/* Tabs */}
          <div className="flex border-b border-white/10 bg-black/20">
            <button
              type="button"
              onClick={() => setActiveTab('template')}
              className={`flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-all ${activeTab === 'template' ? 'text-purple-400 border-b-2 border-purple-500 bg-white/5' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <LayoutTemplate className="w-4 h-4" /> Templates
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('html')}
              className={`flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-all ${activeTab === 'html' ? 'text-blue-400 border-b-2 border-blue-500 bg-white/5' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <Code2 className="w-4 h-4" /> Custom HTML & Preview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('visual')}
              className={`flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-all ${activeTab === 'visual' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-white/5' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <Type className="w-4 h-4" /> Visual Editor
            </button>
          </div>

          <div className="bg-purple-900/20 border-b border-purple-500/20 px-6 py-2 flex items-center gap-3 text-xs text-purple-200">
            <span className="font-semibold text-purple-400">Dynamic Variables:</span>
            <span>You can use <code className="bg-black/30 px-1.5 py-0.5 rounded text-purple-300 border border-purple-500/30">[Client Name]</code> and <code className="bg-black/30 px-1.5 py-0.5 rounded text-purple-300 border border-purple-500/30">[Company Name]</code> in your emails. They will be replaced automatically for each lead.</span>
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-hidden">
            
            {activeTab === 'template' && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 h-full overflow-y-auto">

                {/* ── Saved DB Templates ─────────────────────────────────── */}
                {dbTemplates.map(template => (
                  <div
                    key={template.id}
                    className="bg-purple-900/10 border border-purple-500/20 rounded-2xl p-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-400/40 transition-all group flex flex-col gap-4"
                  >
                    {/* Card header: badge + action icons */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-purple-500 text-white rounded-full shrink-0">
                        Saved
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          title="Edit template"
                          onClick={() => openEditModal(template)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Delete template"
                          onClick={() => handleDeleteTemplate(template.id, template.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-sm leading-snug mb-1">{template.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">Subject: {template.subject}</p>
                    </div>

                    {/* Always-visible Use Template button */}
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate(template)}
                      className="mt-auto w-full py-2.5 bg-purple-500/10 group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-indigo-600 group-hover:text-white text-purple-400 text-sm font-semibold rounded-xl transition-all"
                    >
                      Use Template
                    </button>
                  </div>
                ))}

                {/* ── Predefined Templates ────────────────────────────────── */}
                {PREDEFINED_TEMPLATES.map(template => (
                  <div
                    key={template.id}
                    className="bg-slate-900/50 border border-white/10 rounded-2xl p-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-500/30 transition-all group flex flex-col gap-4"
                  >
                    {/* Badge row */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-slate-700 text-slate-300 rounded-full">
                        Built-in
                      </span>
                    </div>

                    {/* Card body */}
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-sm leading-snug mb-1">{template.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">Subject: {template.subject}</p>
                    </div>

                    {/* Always-visible Use Template button */}
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate(template)}
                      className="mt-auto w-full py-2.5 bg-white/5 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-red-500 group-hover:text-white text-slate-300 text-sm font-semibold rounded-xl transition-all"
                    >
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'html' && (
              <div className="flex h-full">
                <div className="w-1/2 border-r border-white/10 h-full relative">
                  <Editor
                    height="100%"
                    defaultLanguage="html"
                    theme="vs-dark"
                    value={htmlContent}
                    onChange={(val) => setHtmlContent(val || '')}
                    options={{
                      minimap: { enabled: false },
                      wordWrap: 'on',
                      padding: { top: 16 }
                    }}
                  />
                </div>
                <div className="w-1/2 h-full bg-slate-200 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 bg-slate-300 text-slate-600 text-xs py-1 px-3 font-semibold tracking-wider flex justify-between z-10">
                    <span>LIVE PREVIEW</span>
                    <span>Desktop</span>
                  </div>
                  <iframe 
                    className="w-full h-full pt-6 bg-white"
                    srcDoc={htmlContent}
                    title="Live Email Preview"
                  />
                </div>
              </div>
            )}

            {activeTab === 'visual' && (
              <div className="h-full flex flex-col bg-slate-900">
                <div className="bg-slate-800 border-b border-white/10 p-2 flex gap-2 overflow-x-auto">
                  <button type="button" onClick={() => tipTapEditor?.chain().focus().toggleBold().run()} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tipTapEditor?.isActive('bold') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>Bold</button>
                  <button type="button" onClick={() => tipTapEditor?.chain().focus().toggleItalic().run()} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tipTapEditor?.isActive('italic') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>Italic</button>
                  <div className="w-px bg-white/10 mx-1" />
                  <button type="button" onClick={() => tipTapEditor?.chain().focus().toggleHeading({ level: 1 }).run()} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tipTapEditor?.isActive('heading', { level: 1 }) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>H1</button>
                  <button type="button" onClick={() => tipTapEditor?.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tipTapEditor?.isActive('heading', { level: 2 }) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>H2</button>
                  <div className="w-px bg-white/10 mx-1" />
                  <button type="button" onClick={() => tipTapEditor?.chain().focus().toggleBulletList().run()} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tipTapEditor?.isActive('bulletList') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>Bullet List</button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <EditorContent editor={tipTapEditor} />
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between p-6 glass rounded-2xl border border-white/10">
          {lastSuccess ? (
            <div className="flex items-center gap-2 text-emerald-400 font-medium bg-emerald-500/10 px-4 py-2 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
              {lastSuccess}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">Emails will be dispatched using your configured SMTP settings.</p>
          )}
          
          <div className="flex gap-4 items-center">
            <button 
              type="button" 
              onClick={handleSaveTemplate}
              disabled={isSaving || !htmlContent || !subject}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-all border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              ) : (
                <LayoutTemplate className="w-5 h-5 text-slate-400" />
              )}
              Save as Template
            </button>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Broadcast Campaign
              </>
            )}
            </button>
          </div>
        </div>
      </form>

      {/* ── Edit Template Modal ──────────────────────────────────────────────── */}
      {isEditModalOpen && editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="font-bold text-white">Edit Template</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Template Name</label>
                <input
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Subject Line</label>
                <input
                  required
                  value={editSubject}
                  onChange={e => setEditSubject(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  {isSavingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
