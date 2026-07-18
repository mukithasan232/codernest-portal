'use client';

/**
 * CmsEditor — Reusable CRUD form for CMS collections.
 * Handles create/edit/delete for BlogPost, CaseStudy, ServicePricing.
 */

import { useState } from 'react';
import { Save, Trash2, X, Plus, Loader2, Upload, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { createCmsEntry, updateCmsEntry, deleteCmsEntry } from '@/lib/actions/cms.actions';
import { uploadBlogImage } from '@/lib/actions/blog.actions';
import { useRef } from 'react';

export type CmsField = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'tags' | 'select' | 'html';
  options?: string[]; // for select
  placeholder?: string;
  required?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface CmsEditorProps<T = any> {
  collectionName: string;
  fields: CmsField[];
  item?: (T & { id: string }) | null;
  onSuccess: () => void;
  onCancel: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CmsEditor<T = any>({
  collectionName,
  fields,
  item,
  onSuccess,
  onCancel,
}: CmsEditorProps<T>) {
  const isEditing = !!item?.id;

  // Initialize form data — cast item to Record for safe dynamic field access
  const itemRecord = item as Record<string, unknown> | null | undefined;
  const initialData = fields.reduce((acc, f) => {
    acc[f.key] = itemRecord?.[f.key] ?? (f.type === 'boolean' ? false : f.type === 'tags' ? [] : f.type === 'number' ? 0 : '');
    return acc;
  }, {} as Record<string, unknown>);

  const [formData, setFormData] = useState<Record<string, unknown>>(initialData);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState<Record<string, string>>({});
  
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [lastUploadedMediaUrl, setLastUploadedMediaUrl] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const update = (key: string, value: unknown) =>
    setFormData(prev => ({ ...prev, [key]: value }));

  // Tag helpers
  const addTag = (key: string) => {
    const val = (tagInput[key] ?? '').trim();
    if (!val) return;
    const current = (formData[key] as string[]) ?? [];
    if (!current.includes(val)) update(key, [...current, val]);
    setTagInput(prev => ({ ...prev, [key]: '' }));
  };
  const removeTag = (key: string, tag: string) => {
    update(key, ((formData[key] as string[]) ?? []).filter(t => t !== tag));
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };

      if (isEditing && item?.id) {
        const res = await updateCmsEntry(collectionName, item.id, payload);
        if (!res.success) throw new Error(res.error);
        toast.success('Updated successfully!');
      } else {
        const res = await createCmsEntry(collectionName, payload);
        if (!res.success) throw new Error(res.error);
        toast.success('Created successfully!');
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!item?.id) return;
    if (!confirm('Delete this item permanently?')) return;
    setLoading(true);
    try {
      const res = await deleteCmsEntry(collectionName, item.id);
      if (!res.success) throw new Error(res.error);
      toast.success('Deleted.');
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to delete.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass rounded-3xl border border-slate-200 dark:border-white/10 p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {isEditing ? 'Edit Entry' : 'Create New Entry'}
        </h3>
        <button onClick={onCancel} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form id="cms-editor-form" onSubmit={handleSubmit} className="space-y-5">
        {fields.map(field => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor={`cms-${field.key}`}>
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </label>

            {/* Text */}
            {field.type === 'text' && (
              <input
                id={`cms-${field.key}`}
                type="text"
                required={field.required}
                value={formData[field.key] as string}
                onChange={e => update(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition"
              />
            )}

            {/* Textarea */}
            {field.type === 'textarea' && (
              <textarea
                id={`cms-${field.key}`}
                required={field.required}
                rows={5}
                value={formData[field.key] as string}
                onChange={e => update(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition resize-none font-mono"
              />
            )}

            {/* HTML Split Screen */}
            {field.type === 'html' && (
              <div className="space-y-4">
                {/* Media Library inline */}
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-black/20 p-3 rounded-xl border border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => mediaInputRef.current?.click()}
                    disabled={isUploadingMedia}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-semibold rounded-lg transition"
                  >
                    {isUploadingMedia ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {isUploadingMedia ? 'Uploading...' : 'Upload Image to Media Library'}
                  </button>
                  <input
                    ref={mediaInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                  {lastUploadedMediaUrl && (
                    <div className="flex-1 flex items-center gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={lastUploadedMediaUrl} 
                        className="flex-1 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 px-3 py-2 rounded-lg outline-none truncate" 
                      />
                      <button 
                        type="button"
                        onClick={copyToClipboard}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                      >
                        {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[400px]">
                  <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                    <div className="bg-slate-200 dark:bg-black/40 px-4 py-2 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Raw HTML & Tailwind</span>
                    </div>
                    <textarea
                      id={`cms-${field.key}`}
                      required={field.required}
                      value={formData[field.key] as string}
                      onChange={e => update(field.key, e.target.value)}
                      placeholder={field.placeholder || "<div>...</div>"}
                      className="flex-1 w-full p-4 bg-transparent text-slate-800 dark:text-slate-300 font-mono text-sm focus:outline-none resize-none"
                    />
                  </div>
                  <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 dark:bg-black/40 px-4 py-2 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Live Preview</span>
                    </div>
                    <div 
                      className="flex-1 p-6 overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: formData[field.key] as string }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Number */}
            {field.type === 'number' && (
              <input
                id={`cms-${field.key}`}
                type="number"
                required={field.required}
                value={formData[field.key] as number}
                onChange={e => update(field.key, parseFloat(e.target.value) || 0)}
                placeholder={field.placeholder}
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition"
              />
            )}

            {/* Boolean */}
            {field.type === 'boolean' && (
              <button
                id={`cms-${field.key}`}
                type="button"
                onClick={() => update(field.key, !formData[field.key])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData[field.key] ? 'bg-blue-600' : 'bg-slate-200 dark:bg-white/10'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData[field.key] ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            )}

            {/* Select */}
            {field.type === 'select' && (
              <select
                id={`cms-${field.key}`}
                required={field.required}
                value={formData[field.key] as string}
                onChange={e => update(field.key, e.target.value)}
                className="w-full bg-white dark:bg-surface-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition"
              >
                <option value="">Select…</option>
                {field.options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}

            {/* Tags */}
            {field.type === 'tags' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    id={`cms-${field.key}`}
                    type="text"
                    value={tagInput[field.key] ?? ''}
                    onChange={e => setTagInput(prev => ({ ...prev, [field.key]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(field.key))}
                    placeholder={field.placeholder ?? 'Type and press Enter'}
                    className="flex-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => addTag(field.key)}
                    className="px-3 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-400 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {((formData[field.key] as string[]) ?? []).map(tag => (
                    <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full font-medium">
                      {tag}
                      <button type="button" onClick={() => removeTag(field.key, tag)} className="hover:text-red-400 transition">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10">
          <div className="flex gap-3">
            <button
              id="cms-save-btn"
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? 'Saving…' : isEditing ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm font-medium rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>

          {isEditing && (
            <button
              id="cms-delete-btn"
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 text-red-400 hover:bg-red-500/10 border border-red-500/20 text-sm font-medium rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
