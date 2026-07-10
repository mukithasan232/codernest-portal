'use client';

/**
 * MilestoneTracker — Visual project progress component
 */

import type { Milestone } from '@/types';
import { CheckCircle2, Circle } from 'lucide-react';

interface MilestoneTrackerProps {
  milestones: Milestone[];
  projectTitle: string;
}

export default function MilestoneTracker({ milestones, projectTitle }: MilestoneTrackerProps) {
  const overallProgress = milestones.length > 0
    ? Math.round(milestones.reduce((sum, m) => sum + m.percentComplete, 0) / milestones.length)
    : 0;

  return (
    <div className="space-y-4">
      {/* Overall progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-slate-400">{projectTitle}</span>
          <span className="text-xs font-bold text-white">{overallProgress}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Individual milestones */}
      <div className="space-y-3 pt-1">
        {milestones.map((m, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {m.done
                ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                : <Circle className="w-4 h-4 text-slate-600" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-sm font-medium ${m.done ? 'text-slate-400 line-through' : 'text-white'}`}>
                  {m.title}
                </span>
                <span className={`text-xs font-bold flex-shrink-0 ${m.done ? 'text-green-400' : 'text-slate-400'}`}>
                  {m.percentComplete}%
                </span>
              </div>
              {!m.done && (
                <div className="mt-1.5 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${m.percentComplete}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
