import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import type { ImageOrder } from '@/types';
import ImageOrderCard from '@/components/dashboard/ImageOrderCard';
import Link from 'next/link';
import { Image as ImageIcon, Plus } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function DashboardImageOrdersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  const appUser = await prisma.user.findUnique({ where: { id: session.user.id }});
  
  if (!appUser) {
    redirect('/auth/login');
  }

  const orderData = await prisma.imageOrder.findMany({
    where: { clientId: appUser.id },
    orderBy: { createdAt: 'desc' }
  });
  
  const orders = orderData as unknown as ImageOrder[];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Image Orders</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track and download your processed images.</p>
        </div>
        <Link
          href="/image-studio/upload"
          id="new-image-order-btn"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" /> New Order
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-16 text-center space-y-4 shadow-sm">
          <ImageIcon className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">No orders yet</h2>
          <p className="text-slate-500 dark:text-slate-400">Upload your first image and get studio-grade results.</p>
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
