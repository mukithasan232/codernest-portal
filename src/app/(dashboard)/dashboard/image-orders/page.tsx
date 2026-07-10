'use client';

/**
 * Client Dashboard — Image Orders history
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { ImageOrder } from '@/types';
import ImageOrderCard from '@/components/dashboard/ImageOrderCard';
import Link from 'next/link';
import { Image as ImageIcon, Plus } from 'lucide-react';

export default function DashboardImageOrdersPage() {
  const { appUser } = useAuth();
  const [orders, setOrders] = useState<ImageOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!appUser) return;

    const fetchOrders = async () => {
      const { data } = await supabase
        .from('imageOrders')
        .select('*')
        .eq('clientId', appUser.id)
        .order('createdAt', { ascending: false });
      
      if (data) setOrders(data as ImageOrder[]);
      setLoading(false);
    };

    fetchOrders();

    const channel = supabase.channel('dashboard_image_orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'imageOrders', filter: `clientId=eq.${appUser.id}` }, (payload) => {
        if (payload.eventType === 'INSERT') setOrders(o => [payload.new as ImageOrder, ...o]);
        if (payload.eventType === 'UPDATE') setOrders(o => o.map(x => x.id === payload.new.id ? payload.new as ImageOrder : x));
        if (payload.eventType === 'DELETE') setOrders(o => o.filter(x => x.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [appUser, supabase]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Image Orders</h1>
          <p className="text-slate-400 mt-1">Track and download your processed images.</p>
        </div>
        <Link
          href="/image-studio/upload"
          id="new-image-order-btn"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" /> New Order
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass rounded-2xl border border-white/10 p-5 animate-pulse h-36" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="glass rounded-3xl border border-white/10 p-16 text-center space-y-4">
          <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-xl font-bold text-white">No orders yet</h2>
          <p className="text-slate-400">Upload your first image and get studio-grade results.</p>
          <Link href="/image-studio/upload" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all">
            Try Image Studio — 5 Free Credits
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {orders.map(order => (
            <ImageOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
