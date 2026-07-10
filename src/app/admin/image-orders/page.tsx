'use client';

/**
 * Admin — Image Orders Management
 * Tier A (completed) and Tier B (pending) orders.
 * Admin can upload processed image for Tier B orders.
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ImageOrder, ImageOrderStatus } from '@/types';
import {
  Image as ImageIcon, Clock, CheckCircle, AlertCircle,
  Upload, Zap, UserCheck, ExternalLink, Loader2, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<ImageOrderStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending:    { label: 'Pending',    color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: Clock },
  processing: { label: 'Processing', color: 'text-blue-400',   bg: 'bg-blue-400/10',   icon: Loader2 },
  completed:  { label: 'Completed',  color: 'text-green-400',  bg: 'bg-green-400/10',  icon: CheckCircle },
  failed:     { label: 'Failed',     color: 'text-red-400',    bg: 'bg-red-400/10',    icon: AlertCircle },
};

export default function AdminImageOrdersPage() {
  const [orders, setOrders] = useState<ImageOrder[]>([]);
  const [filter, setFilter] = useState<ImageOrderStatus | 'all'>('all');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase.from('imageOrders').select('*').order('createdAt', { ascending: false });
      if (data) setOrders(data as ImageOrder[]);
    };

    fetchOrders();

    const channel = supabase
      .channel('admin_image_orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'imageOrders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOrders(prev => [payload.new as ImageOrder, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? (payload.new as ImageOrder) : o));
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  async function handleUploadResult(orderId: string, clientId: string, file: File) {
    setUploadingId(orderId);
    setUploadProgress(10); // Fake progress for now since Supabase JS doesn't have an easy native progress event without XHR
    try {
      const filePath = `processed/${clientId}/${orderId}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('images') // Assumes a bucket named 'images' exists
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;
      setUploadProgress(100);

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      // Update Supabase order
      const { error: updateError } = await supabase.from('imageOrders').update({
        status: 'completed',
        processedUrl: publicUrl,
        completedAt: new Date().toISOString(),
      }).eq('id', orderId);
      
      if (updateError) throw updateError;

      toast.success(`Order ${orderId.slice(0, 8)}… marked as completed!`);
    } catch (err) {
      console.error(err);
      toast.error('Upload failed. Try again.');
    } finally {
      setUploadingId(null);
      setUploadProgress(0);
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
        <h1 className="text-3xl font-extrabold text-white">Image Orders</h1>
        <p className="text-slate-400 mt-1">Manage AI-processed and human expert orders.</p>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 flex-wrap">
        {(['all', 'pending', 'completed'] as const).map(f => (
          <button
            key={f}
            id={`order-filter-${f}`}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              filter === f
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f ? 'bg-white/20' : 'bg-white/10'}`}>
              {counts[f as keyof typeof counts] ?? orders.length}
            </span>
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="glass rounded-3xl border border-white/10 overflow-hidden">
        <div className="divide-y divide-white/5">
          {filtered.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
              No orders found.
            </div>
          )}
          {filtered.map(order => {
            const sc = STATUS_CONFIG[order.status];
            const StatusIcon = sc.icon;
            const isUploading = uploadingId === order.id;

            return (
              <div key={order.id} className="p-6 hover:bg-white/5 transition">
                <div className="flex items-start gap-4">
                  {/* Tier badge */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${order.tier === 'A-automated' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
                    {order.tier === 'A-automated'
                      ? <Zap className="w-5 h-5 text-blue-400" />
                      : <UserCheck className="w-5 h-5 text-purple-400" />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-mono text-slate-400">#{order.id.slice(0, 10)}…</span>
                      <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${sc.bg} ${sc.color}`}>
                        <StatusIcon className="w-3 h-3" /> {sc.label}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${order.tier === 'A-automated' ? 'bg-blue-400/10 text-blue-400' : 'bg-purple-400/10 text-purple-400'}`}>
                        {order.tier === 'A-automated' ? 'Tier A' : 'Tier B'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      Client: {order.clientEmail ?? order.clientId.slice(0, 12)} · {new Date(order.createdAt).toLocaleDateString()}
                    </p>

                    {order.instructions && (
                      <p className="text-xs text-slate-400 mt-2 bg-white/5 rounded-lg p-2">
                        &quot;{order.instructions}&quot;
                      </p>
                    )}

                    {/* Links */}
                    <div className="flex gap-3 mt-3">
                      {order.originalUrl && (
                        <a href={order.originalUrl} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-400 hover:underline">
                          <ExternalLink className="w-3 h-3" /> Original
                        </a>
                      )}
                      {order.processedUrl && (
                        <a href={order.processedUrl} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-green-400 hover:underline">
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
                          <Loader2 className="w-5 h-5 animate-spin text-blue-400 mx-auto" />
                          <p className="text-xs text-slate-400 mt-1">{uploadProgress}%</p>
                        </div>
                      ) : (
                        <label
                          htmlFor={`upload-result-${order.id}`}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all"
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
