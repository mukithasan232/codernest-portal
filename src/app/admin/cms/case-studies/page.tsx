'use client';

/**
 * Admin CMS — Case Studies Manager
 * Full CRUD for portfolio case studies.
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { CaseStudy } from '@/types';
import CmsEditor, { CmsField } from '@/components/admin/CmsEditor';
import { Plus, Layers, Star, Pencil } from 'lucide-react';

const CASE_STUDY_FIELDS: CmsField[] = [
  { key: 'title',       label: 'Project Title',    type: 'text',     required: true },
  { key: 'slug',        label: 'URL Slug',          type: 'text',     required: true, placeholder: 'project-slug' },
  { key: 'sector',      label: 'Sector',            type: 'select',   required: true, options: ['web', 'image-studio'] },
  { key: 'clientName',  label: 'Client Name',       type: 'text',     placeholder: 'Acme Corp' },
  { key: 'challenge',   label: 'The Challenge',     type: 'textarea', required: true, placeholder: 'What problem did the client face?' },
  { key: 'solution',    label: 'The Solution',      type: 'textarea', required: true, placeholder: 'How did CoderNest solve it?' },
  { key: 'results',     label: 'Results & Impact',  type: 'textarea', placeholder: 'Measurable outcomes…' },
  { key: 'techStack',   label: 'Tech Stack',        type: 'tags',     placeholder: 'e.g. Next.js' },
  { key: 'imageUrl',    label: 'Cover Image URL',   type: 'text',     placeholder: 'https://…' },
  { key: 'githubUrl',   label: 'GitHub URL',        type: 'text',     placeholder: 'https://github.com/…' },
  { key: 'liveDemoUrl', label: 'Live Demo URL',     type: 'text',     placeholder: 'https://…' },
  { key: 'featured',    label: 'Featured',          type: 'boolean' },
];

export default function CaseStudiesCmsPage() {
  const [studies, setStudies] = useState<CaseStudy[]>([]);
  const [editing, setEditing] = useState<(CaseStudy & { id: string }) | null>(null);
  const [creating, setCreating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchStudies = async () => {
      const { data } = await supabase.from('caseStudies').select('*').order('createdAt', { ascending: false });
      if (data) setStudies(data as CaseStudy[]);
    };

    fetchStudies();

    const channel = supabase
      .channel('admin_case_studies_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'caseStudies' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setStudies(prev => [payload.new as CaseStudy, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setStudies(prev => prev.map(s => s.id === payload.new.id ? (payload.new as CaseStudy) : s));
        } else if (payload.eventType === 'DELETE') {
          setStudies(prev => prev.filter(s => s.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const showEditor = editing || creating;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Case Studies</h1>
          <p className="text-slate-400 mt-1">{studies.length} case stud{studies.length !== 1 ? 'ies' : 'y'}</p>
        </div>
        {!showEditor && (
          <button
            id="case-study-new-btn"
            onClick={() => { setEditing(null); setCreating(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" /> New Case Study
          </button>
        )}
      </div>

      {showEditor && (
        <CmsEditor
          collectionName="caseStudies"
          fields={CASE_STUDY_FIELDS}
          item={editing}
          onSuccess={() => { setEditing(null); setCreating(false); }}
          onCancel={() => { setEditing(null); setCreating(false); }}
        />
      )}

      {!showEditor && (
        <div className="glass rounded-3xl border border-white/10 overflow-hidden">
          <div className="divide-y divide-white/5">
            {studies.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No case studies yet. Add your first portfolio project!
              </div>
            )}
            {studies.map(study => (
              <div key={study.id} className="p-5 flex items-center justify-between hover:bg-white/5 transition">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <Layers className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white">{study.title}</h3>
                      {study.featured && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {study.sector === 'web' ? '💻 Web Dev' : '🎨 Image Studio'} · {study.clientName ?? 'No client'}
                    </p>
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {study.techStack?.slice(0, 4).map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  id={`case-study-edit-${study.id}`}
                  onClick={() => { setEditing(study as CaseStudy & { id: string }); setCreating(false); }}
                  className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition flex-shrink-0"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
