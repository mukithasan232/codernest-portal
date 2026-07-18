'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDynamicPage, updateDynamicPage } from '@/lib/actions/pages.actions';
import { uploadBlogImage } from '@/lib/actions/blog.actions'; // Reuse media upload action
import { Save, ArrowLeft, Loader2, Code2, Play, Upload, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Editor from '@monaco-editor/react';

export default function PageBuilder() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js' | 'seo' | 'media'>('html');

  const [htmlContent, setHtmlContent] = useState('');
  const [cssContent, setCssContent] = useState('');
  const [jsContent, setJsContent] = useState('');
  
  // SEO
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [keywords, setKeywords] = useState('');

  // Media Library
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [lastUploadedMediaUrl, setLastUploadedMediaUrl] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    async function loadPage() {
      const res = await getDynamicPage(id);
      if (res.success && res.data) {
        setPage(res.data);
        setHtmlContent(res.data.htmlContent || '');
        setCssContent(res.data.cssContent || '');
        setJsContent(res.data.jsContent || '');
        setMetaTitle(res.data.metaTitle || '');
        setMetaDesc(res.data.metaDesc || '');
        setKeywords(res.data.keywords || '');
      } else {
        toast.error('Page not found');
        router.push('/admin/pages');
      }
      setLoading(false);
    }
    loadPage();
  }, [id, router]);

  const updatePreview = () => {
    if (!iframeRef.current) return;
    const document = iframeRef.current.contentDocument;
    if (!document) return;

    document.open();
    document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>${cssContent}</style>
        </head>
        <body>
          ${htmlContent}
          <script>${jsContent}</script>
        </body>
      </html>
    `);
    document.close();
  };

  // Auto-update preview (debounce would be better in prod, but immediate is fine for now)
  useEffect(() => {
    const timeoutId = setTimeout(updatePreview, 500);
    return () => clearTimeout(timeoutId);
  }, [htmlContent, cssContent, jsContent]);

  const handleSave = async () => {
    setSaving(true);
    const res = await updateDynamicPage(id, {
      htmlContent,
      cssContent,
      jsContent,
      metaTitle,
      metaDesc,
      keywords,
    });
    if (res.success) {
      toast.success('Page saved successfully!');
    } else {
      toast.error('Failed to save');
    }
    setSaving(false);
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploadingMedia(true);
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await uploadBlogImage(formData);
      if (res.success && res.url) {
        setLastUploadedMediaUrl(res.url);
        toast.success('Image uploaded! Copy the URL below.');
      } else {
        toast.error(res.error || 'Failed to upload image');
      }
      setIsUploadingMedia(false);
      if (mediaInputRef.current) mediaInputRef.current.value = '';
    }
  };

  const copyToClipboard = () => {
    if (lastUploadedMediaUrl) {
      navigator.clipboard.writeText(lastUploadedMediaUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
      toast.success('URL copied to clipboard!');
    }
  };

  if (loading) return <div className="p-10 text-slate-400 flex items-center gap-3"><Loader2 className="animate-spin w-5 h-5"/> Loading Builder...</div>;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/admin/pages" className="p-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-6 h-6 text-blue-500" />
              Editing: {page?.title}
            </h1>
            <p className="text-xs text-slate-500 font-mono">/{page?.slug}</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save Code'}
        </button>
      </div>

      {/* Builder Workspace */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left: Code Editor & SEO */}
        <div className="w-1/2 flex flex-col bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex bg-slate-100 dark:bg-black/50 border-b border-slate-200 dark:border-white/10 shrink-0">
            {['html', 'css', 'js', 'seo', 'media'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition ${
                  activeTab === tab 
                    ? 'bg-white dark:bg-[#0f172a] text-blue-500 border-t-2 border-blue-500' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 border-t-2 border-transparent'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex-1 p-4 relative overflow-y-auto">
            {activeTab === 'seo' ? (
              <div className="space-y-6 max-w-lg mx-auto py-4">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">SEO Settings</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">Meta Title</label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">Meta Description</label>
                  <textarea
                    value={metaDesc}
                    onChange={(e) => setMetaDesc(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">Keywords (comma separated)</label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            ) : activeTab === 'media' ? (
              <div className="space-y-6 max-w-lg mx-auto py-4">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Media Library</h3>
                <p className="text-sm text-slate-500 mb-4">Upload an image to get a direct URL you can paste into your HTML code.</p>
                <button
                  onClick={() => mediaInputRef.current?.click()}
                  disabled={isUploadingMedia}
                  className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border-2 border-dashed border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition"
                >
                  {isUploadingMedia ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  {isUploadingMedia ? 'Uploading...' : 'Upload Image'}
                </button>
                <input
                  ref={mediaInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleMediaUpload}
                  className="hidden"
                />
                
                {lastUploadedMediaUrl && (
                  <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-2">Upload Successful!</p>
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={lastUploadedMediaUrl} 
                        className="flex-1 bg-white dark:bg-black/40 border border-emerald-200 dark:border-emerald-500/30 text-xs text-slate-800 dark:text-slate-200 px-3 py-2 rounded-lg outline-none" 
                      />
                      <button 
                        onClick={copyToClipboard}
                        className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
                      >
                        {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="absolute inset-0 pt-4 rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 bg-[#1e1e1e]">
                <Editor
                  height="100%"
                  theme="vs-dark"
                  language={activeTab === 'html' ? 'html' : activeTab === 'css' ? 'css' : 'javascript'}
                  value={activeTab === 'html' ? htmlContent : activeTab === 'css' ? cssContent : jsContent}
                  onChange={(value) => {
                    const val = value || '';
                    if (activeTab === 'html') setHtmlContent(val);
                    if (activeTab === 'css') setCssContent(val);
                    if (activeTab === 'js') setJsContent(val);
                  }}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    padding: { top: 16, bottom: 16 },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="w-1/2 flex flex-col bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-black/50 border-b border-slate-200 dark:border-white/10 shrink-0">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <Play className="w-4 h-4 text-green-500" /> Live Preview
            </div>
            <button onClick={updatePreview} className="text-xs text-blue-500 hover:underline">Force Refresh</button>
          </div>
          <div className="flex-1 bg-white relative">
            <iframe 
              ref={iframeRef}
              className="absolute inset-0 w-full h-full border-0"
              title="Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
