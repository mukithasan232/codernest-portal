'use client';

/**
 * KanbanBoard — Real-time Firestore Leads Pipeline
 * Drag-and-drop columns: New → Contacted → Proposal → Converted → Closed
 * Uses Firestore real-time listeners for live updates.
 */

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Lead, LeadStatus } from '@/types';
import { Mail, Calendar, GripVertical, MoreVertical } from 'lucide-react';

const COLUMNS: { id: LeadStatus; label: string; color: string; dot: string }[] = [
  { id: 'new',       label: 'New',       color: 'border-blue-500/40',   dot: 'bg-blue-400' },
  { id: 'contacted', label: 'Contacted', color: 'border-yellow-500/40', dot: 'bg-yellow-400' },
  { id: 'proposal',  label: 'Proposal',  color: 'border-purple-500/40', dot: 'bg-purple-400' },
  { id: 'converted', label: 'Converted', color: 'border-green-500/40',  dot: 'bg-green-400' },
  { id: 'closed',    label: 'Closed',    color: 'border-slate-500/40',  dot: 'bg-slate-400' },
];

export default function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<LeadStatus | null>(null);
  const dragLeadId = useRef<string | null>(null);
  const supabase = createClient();

  // Real-time Supabase listener
  useEffect(() => {
    const fetchLeads = async () => {
      const { data } = await supabase.from('leads').select('*').order('createdAt', { ascending: false });
      if (data) setLeads(data as Lead[]);
    };

    fetchLeads();

    const channel = supabase
      .channel('leads_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setLeads(prev => [payload.new as Lead, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setLeads(prev => prev.map(l => l.id === payload.new.id ? (payload.new as Lead) : l));
        } else if (payload.eventType === 'DELETE') {
          setLeads(prev => prev.filter(l => l.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const getColumnLeads = (status: LeadStatus) =>
    leads.filter(l => l.status === status);

  // Drag handlers
  const onDragStart = (leadId: string) => {
    dragLeadId.current = leadId;
    setDragging(leadId);
  };

  const onDragOver = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    setDragOver(status);
  };

  const onDrop = async (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    const leadId = dragLeadId.current;
    if (!leadId) return;

    const lead = leads.find(l => l.id === leadId);
    if (lead && lead.status !== status) {
      // Optimistic update
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
      // Persist to Supabase
      await supabase.from('leads').update({ status }).eq('id', leadId);
    }
    setDragging(null);
    setDragOver(null);
    dragLeadId.current = null;
  };

  const onDragEnd = () => {
    setDragging(null);
    setDragOver(null);
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {COLUMNS.map(col => {
          const colLeads = getColumnLeads(col.id);
          const isOver = dragOver === col.id;

          return (
            <div
              key={col.id}
              onDragOver={e => onDragOver(e, col.id)}
              onDrop={e => onDrop(e, col.id)}
              onDragLeave={() => setDragOver(null)}
              className={`w-64 flex flex-col gap-3 p-3 rounded-2xl border transition-all ${col.color} ${
                isOver ? 'bg-white/5 scale-[1.01]' : 'bg-white/[0.02]'
              }`}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-1 mb-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {col.label}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-white/5 rounded-full px-2 py-0.5">
                  {colLeads.length}
                </span>
              </div>

              {/* Lead cards */}
              <div className="flex flex-col gap-2 min-h-[120px]">
                {colLeads.map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    isDragging={dragging === lead.id}
                    onDragStart={() => onDragStart(lead.id)}
                    onDragEnd={onDragEnd}
                  />
                ))}
                {colLeads.length === 0 && (
                  <div className="flex items-center justify-center h-16 rounded-xl border border-dashed border-white/10 text-xs text-slate-600">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LeadCard({
  lead, isDragging, onDragStart, onDragEnd
}: {
  lead: Lead;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`glass rounded-xl border border-white/10 p-3 space-y-2 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? 'opacity-40 scale-95' : 'hover:border-white/20'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs flex-shrink-0">
            {lead.name[0]?.toUpperCase()}
          </div>
          <p className="text-sm font-bold text-white truncate">{lead.name}</p>
        </div>
        <div className="flex items-center gap-1">
          <GripVertical className="w-3.5 h-3.5 text-slate-600" />
          <button className="text-slate-600 hover:text-slate-400 transition">
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {lead.company && (
        <p className="text-xs text-slate-500 font-medium">{lead.company}</p>
      )}

      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Mail className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">{lead.email}</span>
      </div>

      {lead.budget && (
        <span className="inline-block text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
          {lead.budget}
        </span>
      )}

      <div className="flex items-center gap-1 text-[10px] text-slate-600 pt-1 border-t border-white/5">
        <Calendar className="w-3 h-3" />
        {new Date(lead.createdAt || lead.created_at || new Date().toISOString()).toLocaleDateString()}
      </div>
    </div>
  );
}
