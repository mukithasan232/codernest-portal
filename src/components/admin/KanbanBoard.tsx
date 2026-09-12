'use client';

/**
 * KanbanBoard — Leads Pipeline
 * Drag-and-drop columns: New → Contacted → Proposal → Converted → Closed
 */

import { useState, useEffect, useRef } from 'react';
import type { Lead, LeadStatus } from '@/types';
import { Mail, Calendar, GripVertical, MoreVertical } from 'lucide-react';
import { getLeads, updateLeadStatus, acknowledgeLeadReply } from '@/lib/actions/crm.actions';

const COLUMNS: { id: LeadStatus; label: string; color: string; dot: string }[] = [
  { id: 'new',       label: 'New',       color: 'border-blue-500/40',   dot: 'bg-blue-400' },
  { id: 'contacted', label: 'Contacted', color: 'border-yellow-500/40', dot: 'bg-yellow-400' },
  { id: 'proposal',  label: 'Proposal',  color: 'border-purple-500/40', dot: 'bg-purple-400' },
  { id: 'converted', label: 'Converted', color: 'border-green-500/40',  dot: 'bg-green-400' },
  { id: 'closed',    label: 'Closed',    color: 'border-slate-500/40',  dot: 'bg-slate-400' },
];

export interface KanbanBoardProps {
  leads?: Lead[];
  onLeadsChange?: (leads: Lead[]) => void;
  onRefresh?: () => void;
}

export default function KanbanBoard({
  leads: externalLeads,
  onLeadsChange,
  onRefresh,
}: KanbanBoardProps = {}) {
  const [internalLeads, setInternalLeads] = useState<Lead[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<LeadStatus | null>(null);
  const dragLeadId = useRef<string | null>(null);

  const isControlled = externalLeads !== undefined;
  const leads = isControlled ? externalLeads : internalLeads;

  const updateLeads = (updater: (prev: Lead[]) => Lead[]) => {
    if (isControlled && onLeadsChange) {
      onLeadsChange(updater(externalLeads));
    } else {
      setInternalLeads(updater);
    }
  };

  const fetchLeads = async () => {
    const res = await getLeads();
    if (res.success && res.data) {
      const data = res.data as unknown as Lead[];
      if (isControlled && onLeadsChange) {
        onLeadsChange(data);
      } else {
        setInternalLeads(data);
      }
    }
  };

  useEffect(() => {
    if (!isControlled) {
      fetchLeads();
    }
  }, [isControlled]);

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
      updateLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
      // Persist to DB
      await updateLeadStatus(leadId, status);
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
              className={`w-64 shrink-0 flex flex-col gap-3 p-3 rounded-2xl border transition-all ${col.color} ${
                isOver ? 'bg-slate-100/90 dark:bg-slate-900/80 scale-[1.01]' : 'bg-slate-50/70 dark:bg-slate-900/50'
              }`}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-1 mb-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {col.label}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-500 bg-slate-200 dark:bg-white/5 rounded-full px-2 py-0.5">
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
                    onAcknowledge={async () => {
                      updateLeads(prev => prev.map(l => l.id === lead.id ? { ...l, hasNewReply: false, lastReplySnippet: null } : l));
                      await acknowledgeLeadReply(lead.id);
                    }}
                  />
                ))}
                {colLeads.length === 0 && (
                  <div className="flex items-center justify-center h-16 rounded-xl border border-dashed border-slate-300 dark:border-white/10 text-xs text-slate-500 dark:text-slate-600">
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
  lead, isDragging, onDragStart, onDragEnd, onAcknowledge
}: {
  lead: Lead;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onAcknowledge?: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2 cursor-grab active:cursor-grabbing shadow-sm transition-all ${
        isDragging ? 'opacity-40 scale-95' : 'hover:border-blue-500/50 dark:hover:border-blue-500/50'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs flex-shrink-0">
            {lead.name[0]?.toUpperCase()}
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{lead.name}</p>
        </div>
        <div className="flex items-center gap-1">
          <GripVertical className="w-3.5 h-3.5 text-slate-600" />
          <button className="text-slate-600 hover:text-slate-400 transition">
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {lead.company && (
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{lead.company}</p>
      )}

      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Mail className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">{lead.email}</span>
      </div>

      {lead.budget && (
        <span className="inline-block text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
          {lead.budget}
        </span>
      )}

      {lead.hasNewReply && (
        <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex flex-col gap-2">
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg p-2 relative group">
            <span className="absolute top-0 left-0 w-full h-full rounded-lg bg-emerald-400/10 animate-pulse pointer-events-none" />
            <div className="flex items-start gap-1.5 mb-1 relative z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0 mt-1" />
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">New Reply</span>
            </div>
            <p className="text-xs text-emerald-800 dark:text-emerald-200/90 italic truncate relative z-10 font-medium">
              "{lead.lastReplySnippet || 'View message...'}"
            </p>
          </div>
          {onAcknowledge && (
            <button 
              onClick={(e) => { e.stopPropagation(); onAcknowledge(); }}
              className="w-full text-center py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-[10px] font-bold text-slate-500 dark:text-slate-400 rounded-md transition"
            >
              Mark Read
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-1 text-[10px] text-slate-600 pt-1 border-t border-white/5">
        <Calendar className="w-3 h-3" />
        {new Date(lead.createdAt || new Date().toISOString()).toLocaleDateString()}
      </div>
    </div>
  );
}
