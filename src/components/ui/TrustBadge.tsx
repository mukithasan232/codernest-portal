'use client';

/**
 * TrustBadge — Upwork / Fiverr / GitHub social proof badges
 */

import { ExternalLink } from 'lucide-react';

interface TrustBadgeProps {
  platform: 'upwork' | 'fiverr' | 'github';
  label?: string;
  url: string;
  metric?: string; // e.g. "Top Rated Plus" or "Level 2"
}

const PLATFORM_CONFIG = {
  upwork: {
    name: 'Upwork',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/20',
    emoji: '🟢',
  },
  fiverr: {
    name: 'Fiverr',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
    emoji: '💚',
  },
  github: {
    name: 'GitHub',
    color: 'text-slate-300',
    bg: 'bg-slate-300/10',
    border: 'border-slate-300/20',
    emoji: '⚫',
  },
};

export default function TrustBadge({ platform, label, url, metric }: TrustBadgeProps) {
  const config = PLATFORM_CONFIG[platform];

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border ${config.bg} ${config.border} hover:scale-[1.03] transition-all group`}
    >
      <span className="text-base">{config.emoji}</span>
      <div>
        <p className={`text-xs font-bold ${config.color} leading-none`}>{config.name}</p>
        {(label ?? metric) && (
          <p className="text-[10px] text-slate-400 mt-0.5">{metric ?? label}</p>
        )}
      </div>
      <ExternalLink className={`w-3 h-3 ${config.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
    </a>
  );
}

// Pre-configured set for hero sections
export function TrustBadgeRow({ upworkUrl = '#', fiverrUrl = '#', githubUrl = '#' }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <TrustBadge platform="upwork"  url={upworkUrl}  metric="Top Rated Plus" />
      <TrustBadge platform="fiverr"  url={fiverrUrl}  metric="Level 2 Seller" />
      <TrustBadge platform="github"  url={githubUrl}  metric="Open Source" />
    </div>
  );
}
