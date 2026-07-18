'use client';

import { useState, useEffect } from 'react';
import type { CaseStudy } from '@/types';
import { getCmsEntries, createCmsEntry, updateCmsEntry, deleteCmsEntry } from '@/lib/actions/cms.actions';
import { Layers, Plus, Pencil, Trash2, X, Star, ExternalLink, Github } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';

const caseStudySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  sector: z.string().min(1, 'Sector is required'),
  clientName: z.string().optional(),
  challenge: z.string().min(1, 'Challenge is required'),
  solution: z.string().min(1, 'Solution is required'),
  techStack: z.string(), // We'll handle this as a comma-separated string for simplicity
});

type CaseStudyFormValues = z.infer<typeof caseStudySchema>;

export default function CaseStudiesCmsPage() {
  const [studies, setStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CaseStudyFormValues>({
    resolver: zodResolver(caseStudySchema),
    defaultValues: {
      title: '', slug: '', sector: 'web', clientName: '', challenge: '', solution: '', techStack: ''
    }
  });

  const fetchStudies = async () => {
    setLoading(true);
    const res = await getCmsEntries('case_studies');
    if (res.success && res.data) {
      setStudies(res.data as unknown as CaseStudy[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudies();
  }, []);

  const openNewModal = () => {
    setEditingId(null);
    reset({ title: '', slug: '', sector: 'web', clientName: '', challenge: '', solution: '', techStack: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (study: CaseStudy & { id: string }) => {
    setEditingId(study.id);
    reset({
      title: study.title,
      slug: study.slug,
      sector: study.sector,
      clientName: study.clientName || '',
      challenge: study.challenge,
      solution: study.solution,
      techStack: study.techStack?.join(', ') || ''
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: CaseStudyFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        techStack: data.techStack.split(',').map(s => s.trim()).filter(Boolean)
      };

      let res;
      if (editingId) {
        res = await updateCmsEntry('case_studies', editingId, payload);
      } else {
        res = await createCmsEntry('case_studies', payload);
      }

      if (res.success) {
        toast.success(editingId ? 'Case study updated!' : 'Case study created!');
        setIsModalOpen(false);
        fetchStudies();
      } else {
        toast.error(res.error || 'Failed to save case study.');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this case study?')) return;
    const res = await deleteCmsEntry('case_studies', id);
    if (res.success) {
      toast.success('Case study deleted');
      fetchStudies();
    } else {
      toast.error(res.error || 'Delete failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Case Studies</h1>
          <p className="text-slate-500 mt-1">{studies.length} total projects in portfolio</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Case Study
        </button>
      </div>

      {/* Premium Data Table */}
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading case studies...</div>
        ) : studies.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
            No case studies found. Create your first one!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Project</th>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Sector</th>
                  <th className="px-6 py-4 font-medium">Tech Stack</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {studies.map((study: any) => (
                  <tr key={study.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                          <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900 dark:text-white">{study.title}</p>
                            {study.featured && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
                          </div>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">/{study.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                      {study.clientName || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 uppercase tracking-wider">
                        {study.sector}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5 flex-wrap max-w-[200px]">
                        {study.techStack?.slice(0, 3).map((t: string) => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            {t}
                          </span>
                        ))}
                        {(study.techStack?.length || 0) > 3 && (
                          <span className="text-[10px] px-2 py-0.5 text-slate-500">+{study.techStack.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(study)} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(study.id)} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creation/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 rounded-t-2xl z-10">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white">
                {editingId ? 'Edit Case Study' : 'New Case Study'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                  <input
                    {...register('title')}
                    className={`w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border ${errors.title ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white`}
                    placeholder="e.g. Acme E-commerce Revamp"
                  />
                  {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Slug *</label>
                  <input
                    {...register('slug')}
                    className={`w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border ${errors.slug ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white font-mono text-sm`}
                    placeholder="acme-ecommerce"
                  />
                  {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sector *</label>
                  <select
                    {...register('sector')}
                    className={`w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border ${errors.sector ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white`}
                  >
                    <option value="web">Web Development</option>
                    <option value="app">Mobile App</option>
                    <option value="image-studio">Image Studio</option>
                    <option value="marketing">Digital Marketing</option>
                  </select>
                  {errors.sector && <p className="text-xs text-red-500 mt-1">{errors.sector.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client Name</label>
                  <input
                    {...register('clientName')}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white"
                    placeholder="Acme Corp"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tech Stack (Comma Separated)</label>
                <input
                  {...register('techStack')}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white"
                  placeholder="Next.js, Tailwind CSS, Prisma"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">The Challenge *</label>
                <textarea
                  {...register('challenge')}
                  rows={3}
                  className={`w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border ${errors.challenge ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white resize-none`}
                  placeholder="What problem did the client face?"
                />
                {errors.challenge && <p className="text-xs text-red-500 mt-1">{errors.challenge.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">The Solution *</label>
                <textarea
                  {...register('solution')}
                  rows={3}
                  className={`w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border ${errors.solution ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white resize-none`}
                  placeholder="How did we solve it?"
                />
                {errors.solution && <p className="text-xs text-red-500 mt-1">{errors.solution.message}</p>}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-6 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-sm"
                >
                  {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {editingId ? 'Update Case Study' : 'Create Case Study'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
