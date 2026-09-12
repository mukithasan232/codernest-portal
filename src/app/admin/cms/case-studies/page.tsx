'use client';

/**
 * Case Studies CMS Management Page
 * File: src/app/admin/cms/case-studies/page.tsx
 *
 * Fully responsive on all devices (mobile, tablet, desktop).
 * Allows admins to feature projects on the Landing Page with a one-click star (⭐),
 * manage project metadata, tech stack, and media assets.
 */

import { useState, useEffect, useMemo } from 'react';
import type { CaseStudy } from '@/types';
import { getCmsEntries, createCmsEntry, updateCmsEntry, deleteCmsEntry } from '@/lib/actions/cms.actions';
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  X,
  Star,
  Search,
  ExternalLink,
  Github,
  CheckCircle2,
  Sparkles,
  Loader2,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import MediaDropzone from '@/components/admin/MediaDropzone';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';

const caseStudySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  sector: z.string().min(1, 'Sector is required'),
  clientName: z.string().optional(),
  liveDemoUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  challenge: z.string().min(1, 'Challenge is required'),
  solution: z.string().min(1, 'Solution is required'),
  techStack: z.string(), // Comma-separated
  imageUrl: z.string().optional(),
  featured: z.boolean(),
});

type CaseStudyFormValues = z.infer<typeof caseStudySchema>;

export default function CaseStudiesCmsPage() {
  const [studies, setStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterFeatured, setFilterFeatured] = useState<boolean | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fetchUrl, setFetchUrl] = useState('');
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CaseStudyFormValues>({
    resolver: zodResolver(caseStudySchema),
    defaultValues: {
      title: '',
      slug: '',
      sector: 'web',
      clientName: '',
      liveDemoUrl: '',
      githubUrl: '',
      challenge: '',
      solution: '',
      techStack: '',
      imageUrl: '',
      featured: false,
    },
  });

  const isFormFeatured = watch('featured');

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
    setFetchUrl('');
    setMediaUrl('');
    reset({
      title: '',
      slug: '',
      sector: 'web',
      clientName: '',
      liveDemoUrl: '',
      githubUrl: '',
      challenge: '',
      solution: '',
      techStack: '',
      imageUrl: '',
      featured: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (study: CaseStudy) => {
    setEditingId(study.id);
    const currentImageUrl = study.imageUrl || '';
    setMediaUrl(currentImageUrl);
    reset({
      title: study.title,
      slug: study.slug,
      sector: study.sector,
      clientName: study.clientName || '',
      liveDemoUrl: study.liveDemoUrl || '',
      githubUrl: study.githubUrl || '',
      challenge: study.challenge,
      solution: study.solution,
      techStack: study.techStack?.join(', ') || '',
      imageUrl: currentImageUrl,
      featured: Boolean(study.featured),
    });
    setIsModalOpen(true);
  };

  // One-click star toggle directly on the table / card
  const handleToggleFeatured = async (study: CaseStudy) => {
    const newFeatured = !study.featured;

    // Optimistic UI update
    setStudies((prev) =>
      prev.map((s) => (s.id === study.id ? { ...s, featured: newFeatured } : s))
    );

    const res = await updateCmsEntry('case_studies', study.id, { featured: newFeatured });
    if (res.success) {
      if (newFeatured) {
        toast.success(`⭐ "${study.title}" is now featured on the Landing Page!`);
      } else {
        toast.success(`"${study.title}" unfeatured from Landing Page.`);
      }
    } else {
      toast.error(res.error || 'Failed to update featured status.');
      fetchStudies();
    }
  };

  const onSubmit = async (data: CaseStudyFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        featured: Boolean(data.featured),
        techStack: data.techStack
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
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
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error saving case study';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFetchUrl = async () => {
    if (!fetchUrl) return;
    setIsFetchingData(true);
    try {
      const res = await fetch('/api/fetch-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fetchUrl }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const { metaTitle, techStack, challengeText, solutionText } = data.data;
        if (metaTitle) setValue('title', metaTitle);

        const slugBase = fetchUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
        setValue('slug', slugBase.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase());
        setValue('liveDemoUrl', fetchUrl);

        if (techStack && techStack.length > 0) {
          setValue('techStack', techStack.join(', '));
        }

        if (challengeText) setValue('challenge', challengeText);
        if (solutionText) setValue('solution', solutionText);

        toast.success('Extracted meta data & tech stack!');
      } else {
        toast.error(data.error || 'Failed to extract data');
      }
    } catch (error) {
      toast.error('Network error during fetch');
    } finally {
      setIsFetchingData(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    const res = await deleteCmsEntry('case_studies', id);
    if (res.success) {
      toast.success('Case study deleted');
      fetchStudies();
    } else {
      toast.error(res.error || 'Delete failed');
    }
  };

  // Filtered studies
  const filteredStudies = useMemo(() => {
    return studies.filter((study) => {
      const matchesSearch =
        !search ||
        study.title.toLowerCase().includes(search.toLowerCase()) ||
        study.slug.toLowerCase().includes(search.toLowerCase()) ||
        (study.clientName || '').toLowerCase().includes(search.toLowerCase()) ||
        (study.techStack || []).some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchesFeatured =
        filterFeatured === null ? true : study.featured === filterFeatured;

      return matchesSearch && matchesFeatured;
    });
  }, [studies, search, filterFeatured]);

  const featuredCount = useMemo(() => {
    return studies.filter((s) => s.featured).length;
  }, [studies]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Case Studies
            </h1>
            <button
              onClick={() => setFilterFeatured(filterFeatured === true ? null : true)}
              className={`text-xs font-bold px-3 py-1 rounded-full transition-all flex items-center gap-1.5 border ${
                filterFeatured === true
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/25 hover:bg-amber-500/20'
              }`}
              title="Click to filter by featured projects"
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{featuredCount} Featured on Landing</span>
            </button>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            {studies.length} total projects in portfolio &bull; Click any star{' '}
            <span className="text-amber-400 font-bold">⭐</span> to feature or unfeature on the
            Landing Page.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Case Study</span>
        </button>
      </div>

      {/* ── Search & Filter Toolbar ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-3 rounded-2xl shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by title, client, or tech stack..."
            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterFeatured(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filterFeatured === null
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-white'
            }`}
          >
            All ({studies.length})
          </button>
          <button
            onClick={() => setFilterFeatured(true)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filterFeatured === true
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-white'
            }`}
          >
            <Star className="w-3 h-3 fill-current" />
            Featured ({featuredCount})
          </button>
        </div>
      </div>

      {/* ── Content: Responsive Table (Tablet/Desktop) & Cards (Mobile) ─────── */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <p className="text-sm">Loading case studies...</p>
          </div>
        ) : filteredStudies.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No case studies match your search criteria.</p>
          </div>
        ) : (
          <>
            {/* ── Desktop & Tablet View: Table ─────────────────────────────── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Project & Landing Feature</th>
                    <th className="px-6 py-4 font-semibold">Client</th>
                    <th className="px-6 py-4 font-semibold">Sector</th>
                    <th className="px-6 py-4 font-semibold">Tech Stack</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {filteredStudies.map((study) => (
                    <tr
                      key={study.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors group"
                    >
                      {/* Project Column with Interactive Star */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                            <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-900 dark:text-white">{study.title}</p>
                              {/* Clickable Star Toggle */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleFeatured(study);
                                }}
                                className={`p-1 rounded-md transition-all ${
                                  study.featured
                                    ? 'text-amber-400 hover:scale-110'
                                    : 'text-slate-300 dark:text-slate-600 hover:text-amber-400 hover:scale-110'
                                }`}
                                title={
                                  study.featured
                                    ? 'Featured on Landing Page (Click to unfeature)'
                                    : 'Click to feature on Landing Page'
                                }
                              >
                                <Star
                                  className={`w-4 h-4 transition-all ${
                                    study.featured
                                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                                      : 'fill-transparent'
                                  }`}
                                />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-slate-400 font-mono">/{study.slug}</p>
                              {study.featured && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30">
                                  Landing Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Client */}
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        {study.clientName || '—'}
                      </td>

                      {/* Sector */}
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 uppercase tracking-wider">
                          {study.sector}
                        </span>
                      </td>

                      {/* Tech Stack */}
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5 flex-wrap max-w-[220px]">
                          {study.techStack?.slice(0, 3).map((t: string) => (
                            <span
                              key={t}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
                            >
                              {t}
                            </span>
                          ))}
                          {(study.techStack?.length || 0) > 3 && (
                            <span className="text-[10px] px-2 py-0.5 text-slate-500 font-mono">
                              +{study.techStack.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(study)}
                            className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Edit case study"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(study.id, study.title)}
                            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete case study"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile View: Responsive Cards (< 768px) ─────────────────── */}
            <div className="block md:hidden divide-y divide-slate-200 dark:divide-white/10">
              {filteredStudies.map((study) => (
                <div key={study.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <Layers className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                          {study.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          /{study.slug}
                        </p>
                      </div>
                    </div>

                    {/* Star Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(study)}
                      className={`p-2 rounded-xl border transition-all flex items-center gap-1 ${
                        study.featured
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                          : 'bg-white/5 border-white/10 text-slate-500'
                      }`}
                      title="Toggle landing page featured status"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          study.featured ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 uppercase text-[10px] font-bold tracking-wider">
                      {study.sector}
                    </span>
                    {study.clientName && (
                      <span className="text-slate-300">Client: {study.clientName}</span>
                    )}
                    {study.featured && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Landing Featured
                      </span>
                    )}
                  </div>

                  {study.techStack && study.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {study.techStack.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                    <button
                      onClick={() => openEditModal(study)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-lg transition"
                    >
                      <Pencil className="w-3.5 h-3.5 text-blue-400" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(study.id, study.title)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Responsive Creation & Edit Modal ─────────────────────────────────── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-slate-900 border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden relative">
            {/* Glow Header Accent */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-28 bg-purple-500/20 blur-3xl pointer-events-none rounded-full" />

            {/* Modal Header (Sticky) */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/10 bg-slate-900/95 backdrop-blur-md shrink-0">
              <div>
                <h3 className="font-bold text-lg sm:text-xl text-white">
                  {editingId ? 'Edit Case Study' : 'New Case Study'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure project showcase details and landing page visibility.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Form Body */}
            <form
              id="case-study-form"
              onSubmit={handleSubmit(onSubmit)}
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 overscroll-contain"
            >
              {/* Feature on Landing Page Switch (The requested Star feature!) */}
              <div
                className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 ${
                  isFormFeatured
                    ? 'bg-amber-500/15 border-amber-500/40 shadow-lg shadow-amber-500/10'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      isFormFeatured
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    <Star
                      className={`w-5 h-5 ${isFormFeatured ? 'fill-current' : 'text-slate-400'}`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      Feature on Landing Page
                      {isFormFeatured && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Active Star ⭐
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Highlight this flagship project in the "Featured Case Studies" section on the
                      homepage.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    {...register('featured')}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* Quick Add via URL (for New Case Study) */}
              {!editingId && (
                <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4">
                  <label className="block text-xs font-bold text-blue-400 mb-1.5 uppercase tracking-wider">
                    ⚡ Quick Autofill via Live URL
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      value={fetchUrl}
                      onChange={(e) => setFetchUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="flex-1 px-3.5 py-2 bg-slate-950/70 border border-blue-500/30 rounded-xl focus:outline-none focus:border-blue-500 text-sm text-white placeholder-slate-500"
                    />
                    <button
                      type="button"
                      onClick={handleFetchUrl}
                      disabled={isFetchingData || !fetchUrl}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition"
                    >
                      {isFetchingData ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      <span>Extract Metadata</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Automatically extracts Title, Meta Description, and Tech Stack from the target URL.
                  </p>
                </div>
              )}

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Project Title *
                  </label>
                  <input
                    {...register('title')}
                    className={`w-full px-3.5 py-2.5 bg-white/5 border ${
                      errors.title ? 'border-red-500' : 'border-white/10'
                    } rounded-xl focus:border-purple-500 outline-none text-white text-sm placeholder-slate-500 transition`}
                    placeholder="e.g., MedOS — Hospital Management"
                  />
                  {errors.title && (
                    <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>
                  )}
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    URL Slug *
                  </label>
                  <input
                    {...register('slug')}
                    className={`w-full px-3.5 py-2.5 bg-white/5 border ${
                      errors.slug ? 'border-red-500' : 'border-white/10'
                    } rounded-xl focus:border-purple-500 outline-none text-white font-mono text-sm placeholder-slate-500 transition`}
                    placeholder="medos-hospital-management"
                  />
                  {errors.slug && (
                    <p className="text-xs text-red-400 mt-1">{errors.slug.message}</p>
                  )}
                </div>

                {/* Sector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sector / Category *
                  </label>
                  <select
                    {...register('sector')}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl focus:border-purple-500 outline-none text-white text-sm transition"
                  >
                    <option value="web">Web Development</option>
                    <option value="app">Mobile App</option>
                    <option value="image-studio">Image Studio</option>
                    <option value="marketing">Digital Marketing</option>
                  </select>
                </div>

                {/* Client Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Client / Brand Name
                  </label>
                  <input
                    {...register('clientName')}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500 outline-none text-white text-sm placeholder-slate-500 transition"
                    placeholder="e.g., Healthcare Enterprise"
                  />
                </div>
              </div>

              {/* Tech Stack */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tech Stack (Comma-separated)
                </label>
                <input
                  {...register('techStack')}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500 outline-none text-white text-sm placeholder-slate-500 transition"
                  placeholder="Next.js App Router, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL"
                />
              </div>

              {/* URLs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Live Demo URL
                  </label>
                  <input
                    {...register('liveDemoUrl')}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500 outline-none text-white text-sm placeholder-slate-500 transition"
                    placeholder="https://medos.codernest.agency"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    GitHub Repo URL
                  </label>
                  <input
                    {...register('githubUrl')}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500 outline-none text-white text-sm placeholder-slate-500 transition"
                    placeholder="https://github.com/codernest/medos"
                  />
                </div>
              </div>

              {/* Media Dropzone (Image/Video Upload) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cover Showcase Image / Video
                </label>
                <MediaDropzone
                  value={mediaUrl}
                  onChange={(url) => {
                    setMediaUrl(url);
                    setValue('imageUrl', url);
                  }}
                />
              </div>

              {/* The Challenge */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  The Challenge *
                </label>
                <textarea
                  {...register('challenge')}
                  rows={3}
                  className={`w-full px-3.5 py-2.5 bg-white/5 border ${
                    errors.challenge ? 'border-red-500' : 'border-white/10'
                  } rounded-xl focus:border-purple-500 outline-none text-white text-sm placeholder-slate-500 resize-y transition`}
                  placeholder="What key challenges or bottlenecks did the client face?"
                />
                {errors.challenge && (
                  <p className="text-xs text-red-400 mt-1">{errors.challenge.message}</p>
                )}
              </div>

              {/* The Solution */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  The Solution *
                </label>
                <textarea
                  {...register('solution')}
                  rows={3}
                  className={`w-full px-3.5 py-2.5 bg-white/5 border ${
                    errors.solution ? 'border-red-500' : 'border-white/10'
                  } rounded-xl focus:border-purple-500 outline-none text-white text-sm placeholder-slate-500 resize-y transition`}
                  placeholder="How did we engineer the architecture and solve the problem?"
                />
                {errors.solution && (
                  <p className="text-xs text-red-400 mt-1">{errors.solution.message}</p>
                )}
              </div>
            </form>

            {/* Modal Footer (Sticky) */}
            <div className="sticky bottom-0 z-20 flex items-center justify-between px-5 sm:px-6 py-4 border-t border-white/10 bg-slate-900/95 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                {isFormFeatured ? (
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-current" /> Landing Featured
                  </span>
                ) : (
                  <span>Standard Portfolio Item</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-sm font-semibold rounded-xl hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  form="case-study-form"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-500/20 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <span>{editingId ? 'Update Case Study' : 'Create Case Study'}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
