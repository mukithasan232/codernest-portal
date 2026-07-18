'use client';

import { useState, useTransition } from 'react';
import type { ImageOrder, ImageOrderStatus } from '@/types';
import { uploadProcessedImage } from '@/lib/actions/admin.actions';
import {
  Image as ImageIcon, Clock, CheckCircle, AlertCircle,
  Upload, Zap, UserCheck, ExternalLink, Loader2, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending:    { label: 'Pending',    color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: Clock },
  processing: { label: 'Processing', color: 'text-blue-400',   bg: 'bg-blue-400/10',   icon: Loader2 },
  completed:  { label: 'Completed',  color: 'text-green-400',  bg: 'bg-green-400/10',  icon: CheckCircle },
  failed:     { label: 'Failed',     color: 'text-red-400',    bg: 'bg-red-400/10',    icon: AlertCircle },
};

export default function AdminImageOrdersClient({ initialOrders }: { initialOrders: ImageOrder[] }) {
  const [orders, setOrders] = useState<ImageOrder[]>(initialOrders);
  const [filter, setFilter] = useState<string>('all');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  async function handleUploadResult(orderId: string, clientId: string, file: File) {
    setUploadingId(orderId);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await uploadProcessedImage(orderId, clientId, formData);

      if (!res.success) throw new Error(res.error);

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed', processedUrl: res.processedUrl, completedAt: new Date() } : o));
      toast.success(`Order ${orderId.slice(0, 8)}… marked as completed!`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Upload failed. Try again.');
    } finally {
      setUploadingId(null);
    }
  }

  const counts = {
    all:       orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Image Orders</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage AI-processed and human expert orders.</p>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 flex-wrap">
        {(['all', 'pending', 'completed']).map(f => (
          <button
            key={f}
            id={`order-filter-${f}`}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              filter === f
                ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/10'}`}>
              {counts[f as keyof typeof counts] ?? orders.length}
            </span>
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-200 dark:divide-white/5">
          {filtered.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
              No orders found.
            </div>
          )}
          {filtered.map(order => {
            const sc = STATUS_CONFIG[order.status as string] || STATUS_CONFIG.pending;
            const StatusIcon = sc.icon;
            const isUploading = uploadingId === order.id;

            return (
              <div key={order.id} className="p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition">
                <div className="flex items-start gap-4">
                  {/* Tier badge */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${order.tier === 'A-automated' ? 'bg-blue-50 dark:bg-blue-500/20' : 'bg-purple-50 dark:bg-purple-500/20'}`}>
                    {order.tier === 'A-automated'
                      ? <Zap className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                      : <UserCheck className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-mono text-slate-500 dark:text-slate-400">#{order.id.slice(0, 10)}…</span>
                      <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${sc.bg} ${sc.color}`}>
                        <StatusIcon className="w-3 h-3" /> {sc.label}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${order.tier === 'A-automated' ? 'bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-400/10 dark:text-purple-400'}`}>
                        {order.tier === 'A-automated' ? 'Tier A' : 'Tier B'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      Client: {order.clientEmail ?? order.clientId.slice(0, 12)} · {new Date(order.createdAt).toLocaleDateString()}
                    </p>

                    {order.instructions && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-white/5 rounded-lg p-2 border border-slate-100 dark:border-transparent">
                        &quot;{order.instructions}&quot;
                      </p>
                    )}

                    {/* Links */}
                    <div className="flex gap-3 mt-3">
                      {order.originalUrl && (
                        <a href={order.originalUrl} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                          <ExternalLink className="w-3 h-3" /> Original
                        </a>
                      )}
                      {order.processedUrl && (
                        <a href={order.processedUrl} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 hover:underline">
                          <ExternalLink className="w-3 h-3" /> Processed
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Tier B upload button */}
                  {order.tier === 'B-human' && order.status === 'pending' && (
                    <div className="flex-shrink-0">
                      {isUploading ? (
                        <div className="text-center">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400 mx-auto" />
                        </div>
                      ) : (
                        <label
                          htmlFor={`upload-result-${order.id}`}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-sm"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Upload Result
                          <input
                            id={`upload-result-${order.id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadResult(order.id, order.clientId, file);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
