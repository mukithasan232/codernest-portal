'use client';

/**
 * CmsEditor — Reusable CRUD form for CMS collections.
 * Handles create/edit/delete for BlogPost, CaseStudy, ServicePricing.
 */

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Save, Trash2, X, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export type CmsField = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'tags' | 'select';
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
  const supabase = createClient();

  // Initialize form data — cast item to Record for safe dynamic field access
  const itemRecord = item as Record<string, unknown> | null | undefined;
  const initialData = fields.reduce((acc, f) => {
    acc[f.key] = itemRecord?.[f.key] ?? (f.type === 'boolean' ? false : f.type === 'tags' ? [] : f.type === 'number' ? 0 : '');
    return acc;
  }, {} as Record<string, unknown>);

  const [formData, setFormData] = useState<Record<string, unknown>>(initialData);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState<Record<string, string>>({});

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, updatedAt: new Date().toISOString() };

      if (isEditing && item?.id) {
        const { error } = await supabase.from(collectionName).update(payload).eq('id', item.id);
        if (error) throw error;
        toast.success('Updated successfully!');
      } else {
        const { error } = await supabase.from(collectionName).insert({
          ...payload,
          createdAt: new Date().toISOString(),
        });
        if (error) throw error;
        toast.success('Created successfully!');
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!item?.id) return;
    if (!confirm('Delete this item permanently?')) return;
    setLoading(true);
    try {
      const { error } = await supabase.from(collectionName).delete().eq('id', item.id);
      if (error) throw error;
      toast.success('Deleted.');
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass rounded-3xl border border-white/10 p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">
          {isEditing ? 'Edit Entry' : 'Create New Entry'}
        </h3>
        <button onClick={onCancel} className="text-slate-500 hover:text-white transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form id="cms-editor-form" onSubmit={handleSubmit} className="space-y-5">
        {fields.map(field => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor={`cms-${field.key}`}>
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
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition"
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
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition resize-none font-mono"
              />
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
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition"
              />
            )}

            {/* Boolean */}
            {field.type === 'boolean' && (
              <button
                id={`cms-${field.key}`}
                type="button"
                onClick={() => update(field.key, !formData[field.key])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData[field.key] ? 'bg-blue-600' : 'bg-white/10'}`}
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
                className="w-full bg-surface-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition"
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
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition"
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
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
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
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-xl transition-all"
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
