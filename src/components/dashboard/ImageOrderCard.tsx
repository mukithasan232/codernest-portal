'use client';

/**
 * ImageOrderCard — displays an image order status + download for client dashboard
 */

import type { ImageOrder } from '@/types';
import { Image as ImageIcon, CheckCircle, Clock, ExternalLink, Loader2, AlertCircle, Zap, UserCheck, Download } from 'lucide-react';

interface ImageOrderCardProps {
  order: ImageOrder;
}

const STATUS_CONFIG = {
  pending:    { icon: Clock,      color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Awaiting Processing' },
  processing: { icon: Loader2,    color: 'text-blue-400',   bg: 'bg-blue-400/10',   label: 'Processing' },
  completed:  { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10',  label: 'Completed' },
  failed:     { icon: AlertCircle, color: 'text-red-400',   bg: 'bg-red-400/10',    label: 'Failed' },
};

export default function ImageOrderCard({ order }: ImageOrderCardProps) {
  const sc = STATUS_CONFIG[order.status];
  const StatusIcon = sc.icon;

  return (
    <div className="glass rounded-2xl border border-white/10 p-5 hover:border-white/20 transition-all space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${order.tier === 'A-automated' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
            {order.tier === 'A-automated'
              ? <Zap className="w-5 h-5 text-blue-400" />
              : <UserCheck className="w-5 h-5 text-purple-400" />
            }
          </div>
          <div>
            <p className="text-sm font-bold text-white">
              {order.tier === 'A-automated' ? 'AI Automated' : 'Human Pro Edit'}
            </p>
            <p className="text-[10px] font-mono text-slate-500">#{order.id.slice(0, 12)}…</p>
          </div>
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${sc.bg} ${sc.color}`}>
          <StatusIcon className={`w-3 h-3 ${order.status === 'processing' ? 'animate-spin' : ''}`} />
          {sc.label}
        </span>
      </div>

      {/* Instructions */}
      {order.instructions && (
        <p className="text-xs text-slate-400 bg-white/5 rounded-lg p-2.5 italic">
          &quot;{order.instructions}&quot;
        </p>
      )}

      {/* Timestamps */}
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>Submitted: {new Date(order.createdAt).toLocaleDateString()}</span>
        {order.completedAt && <span className="text-green-600">Done: {new Date(order.completedAt).toLocaleDateString()}</span>}
      </div>

      {/* Download */}
      {order.status === 'completed' && order.processedUrl && (
        <a
          id={`download-order-${order.id}`}
          href={order.processedUrl}
          download
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-bold transition-all"
        >
          <Download className="w-4 h-4" />
          Download Result
        </a>
      )}

      {/* Pending message for Tier B */}
      {order.tier === 'B-human' && order.status === 'pending' && (
        <p className="text-xs text-center text-purple-400 bg-purple-400/10 rounded-xl py-2 px-3">
          Our expert editors are working on your image. Expected within 24 hours.
        </p>
      )}
    </div>
  );
}
