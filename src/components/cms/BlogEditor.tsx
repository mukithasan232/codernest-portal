'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, Save, Image as ImageIcon, CheckCircle2, CircleDashed, Copy, Check } from 'lucide-react';
import { createBlog, updateBlog, uploadBlogImage } from '@/lib/actions/blog.actions';
import toast from 'react-hot-toast';

export default function BlogEditor({ 
  initialData, 
  onSuccess 
}: { 
  initialData?: any, 
  onSuccess?: () => void 
}) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [status, setStatus] = useState<'draft' | 'published'>(initialData?.status || 'draft');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.cover_image || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rawHtml, setRawHtml] = useState(initialData?.content || '');
  
  // SEO
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || '');
  const [metaDesc, setMetaDesc] = useState(initialData?.metaDesc || '');
  const [keywords, setKeywords] = useState(initialData?.keywords || '');

  // Media Library Integration
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [lastUploadedMediaUrl, setLastUploadedMediaUrl] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate slug from title
  useEffect(() => {
    if (!initialData && title) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  }, [title, initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setCoverImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('slug', slug);
    formData.append('content', rawHtml);
    formData.append('status', status);
    formData.append('metaTitle', metaTitle);
    formData.append('metaDesc', metaDesc);
    formData.append('keywords', keywords);
    
    if (coverImage) {
      formData.append('cover_image', coverImage);
    }

    try {
      let res;
      if (initialData?.id) {
        res = await updateBlog(initialData.id, formData);
      } else {
        res = await createBlog(formData);
      }

      if (res.success) {
        toast.success(status === 'published' ? 'Post Published!' : 'Draft Saved!');
        if (!initialData) {
          setTitle('');
          setRawHtml('');
          setCoverImage(null);
          setPreviewUrl(null);
          setMetaTitle('');
          setMetaDesc('');
          setKeywords('');
        }
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || 'Failed to save post');
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-none">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{initialData ? 'Edit Post' : 'Compose Post'}</h2>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 dark:bg-white/5 rounded-xl p-1 border border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setStatus('draft')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                status === 'draft' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CircleDashed className="w-4 h-4" />
              Draft
            </button>
            <button
              type="button"
              onClick={() => setStatus('published')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                status === 'published' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Publish
            </button>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !title || !rawHtml}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Main Info & SEO) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">Title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Next.js 15 Rendering Patterns"
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-lg placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">Slug</label>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-600 dark:text-slate-300 font-mono text-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-black/10 p-5 rounded-2xl border border-slate-200 dark:border-white/5 space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              SEO Metadata
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">Meta Title</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Defaults to post title if empty"
                  className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">Keywords (comma separated)</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g. nextjs, react, frontend"
                  className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">Meta Description</label>
                <textarea
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  placeholder="Brief description for search engines..."
                  rows={2}
                  className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition-all resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar Settings) */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">Cover Image</label>
            <div 
              className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl transition-all ${
                previewUrl 
                  ? 'border-transparent overflow-hidden' 
                  : 'border-slate-300 dark:border-white/20 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/5 bg-slate-50 dark:bg-black/20'
              }`}
            >
              {previewUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button
                      type="button"
                      onClick={removeImage}
                      className="bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-sm"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <ImageIcon className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Click to add cover</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-black/10 p-4 rounded-xl border border-slate-200 dark:border-white/5">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Media Library</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Upload an image to get a URL you can paste into your HTML.</p>
            <button
              type="button"
              onClick={() => mediaInputRef.current?.click()}
              disabled={isUploadingMedia}
              className="w-full py-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white text-sm rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isUploadingMedia ? 'Uploading...' : 'Upload Inline Image'}
            </button>
            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*"
              onChange={handleMediaUpload}
              className="hidden"
            />
            {lastUploadedMediaUrl && (
              <div className="mt-4 p-3 bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Image URL:</p>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={lastUploadedMediaUrl} 
                    className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none truncate" 
                  />
                  <button 
                    type="button"
                    onClick={copyToClipboard}
                    className="p-1.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Split-Screen Code & Preview */}
      <div className="mt-8 border-t border-slate-200 dark:border-white/10 pt-8">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Content (Split-Screen Editor)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[600px]">
          {/* Left: Raw Code */}
          <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
            <div className="bg-slate-200 dark:bg-black/40 px-4 py-2 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Raw HTML & Tailwind</span>
            </div>
            <textarea
              value={rawHtml}
              onChange={(e) => setRawHtml(e.target.value)}
              className="flex-1 w-full p-4 bg-transparent text-slate-800 dark:text-slate-300 font-mono text-sm focus:outline-none resize-none"
              placeholder={'<div className="space-y-4">\\n  <h1 className="text-3xl font-bold">Hello World</h1>\\n  <p className="text-slate-600">Write your content here...</p>\\n</div>'}
            />
          </div>

          {/* Right: Live Preview */}
          <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
            <div className="bg-slate-100 dark:bg-black/40 px-4 py-2 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Live Preview</span>
            </div>
            <div 
              className="flex-1 p-6 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: rawHtml }}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
