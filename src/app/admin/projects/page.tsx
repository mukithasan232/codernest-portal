'use client';

/**
 * Admin — All Projects management with milestone editing
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Project, ProjectStatus, Milestone } from '@/types';
import { Briefcase, Plus, ChevronDown, ChevronUp, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<ProjectStatus, string> = {
  pending:     'bg-yellow-400/10 text-yellow-400',
  'in-progress': 'bg-blue-400/10 text-blue-400',
  completed:   'bg-green-400/10 text-green-400',
  cancelled:   'bg-red-400/10 text-red-400',
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase.from('projects').select('*').order('createdAt', { ascending: false });
      if (data) setProjects(data as Project[]);
    };

    fetchProjects();

    const channel = supabase
      .channel('admin_projects_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setProjects(prev => [payload.new as Project, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setProjects(prev => prev.map(p => p.id === payload.new.id ? (payload.new as Project) : p));
        } else if (payload.eventType === 'DELETE') {
          setProjects(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function updateStatus(id: string, status: ProjectStatus) {
    const { error } = await supabase.from('projects').update({ status }).eq('id', id);
    if (!error) {
      toast.success('Status updated!');
    } else {
      toast.error('Failed to update status.');
    }
  }

  async function updateMilestone(projectId: string, milestones: Milestone[]) {
    setSaving(projectId);
    try {
      const { error } = await supabase.from('projects').update({ milestones }).eq('id', projectId);
      if (error) throw error;
      toast.success('Milestones saved!');
    } catch {
      toast.error('Failed to save milestones.');
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Projects</h1>
        <p className="text-slate-400 mt-1">Manage all client projects and milestone progress.</p>
      </div>

      <div className="space-y-4">
        {projects.length === 0 && (
          <div className="glass rounded-3xl border border-white/10 p-12 text-center text-slate-500">
            <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
            No projects yet.
          </div>
        )}

        {projects.map(project => {
          const isExpanded = expanded === project.id;
          const overallPct = project.milestones?.length > 0
            ? Math.round(project.milestones.reduce((s, m) => s + m.percentComplete, 0) / project.milestones.length)
            : 0;

          return (
            <div key={project.id} className="glass rounded-2xl border border-white/10 overflow-hidden">
              {/* Header row */}
              <div className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white truncate">{project.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 capitalize">{project.type} · {new Date(project.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Status dropdown */}
                  <select
                    value={project.status}
                    onChange={e => updateStatus(project.id, e.target.value as ProjectStatus)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border-0 outline-none cursor-pointer ${STATUS_COLORS[project.status]}`}
                    style={{ background: 'transparent' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  {/* Progress */}
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${overallPct}%` }} />
                    </div>
                    <span className="text-xs font-bold text-white">{overallPct}%</span>
                  </div>

                  <button
                    id={`project-expand-${project.id}`}
                    onClick={() => setExpanded(isExpanded ? null : project.id)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 transition"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Milestone editor */}
              {isExpanded && (
                <MilestoneEditor
                  project={project}
                  saving={saving === project.id}
                  onSave={milestones => updateMilestone(project.id, milestones)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MilestoneEditor({ project, saving, onSave }: {
  project: Project;
  saving: boolean;
  onSave: (m: Milestone[]) => void;
}) {
  const [milestones, setMilestones] = useState<Milestone[]>(project.milestones ?? []);

  const update = (i: number, field: keyof Milestone, value: unknown) => {
    setMilestones(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  };

  const addMilestone = () => {
    setMilestones(prev => [...prev, { title: 'New Milestone', percentComplete: 0, done: false }]);
  };

  const remove = (i: number) => {
    setMilestones(prev => prev.filter((_, idx) => idx !== i));
  };

  return (
    <div className="border-t border-white/10 p-5 space-y-4">
      <h4 className="text-sm font-bold text-white">Milestones</h4>
      {milestones.map((m, i) => (
        <div key={i} className="grid grid-cols-12 gap-3 items-center">
          <input
            value={m.title}
            onChange={e => update(i, 'title', e.target.value)}
            placeholder="Milestone title"
            className="col-span-5 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
          />
          <div className="col-span-3 flex items-center gap-2">
            <input
              type="range" min="0" max="100"
              value={m.percentComplete}
              onChange={e => update(i, 'percentComplete', parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs font-bold text-white w-8 text-right">{m.percentComplete}%</span>
          </div>
          <label className="col-span-2 flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={m.done} onChange={e => update(i, 'done', e.target.checked)}
              className="w-4 h-4 rounded" />
            <span className="text-xs text-slate-400">Done</span>
          </label>
          <button onClick={() => remove(i)} className="col-span-2 text-red-400 text-xs hover:text-red-300 transition text-right">Remove</button>
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <button onClick={addMilestone} className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition">
          <Plus className="w-3.5 h-3.5" /> Add Milestone
        </button>
        <button id={`save-milestones-${project.id}`} onClick={() => onSave(milestones)} disabled={saving}
          className="flex items-center gap-1.5 text-xs px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all disabled:opacity-50">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save Milestones
        </button>
      </div>
    </div>
  );
}
