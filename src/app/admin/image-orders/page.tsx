import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import type { ImageOrder } from '@/types';
import AdminImageOrdersClient from '@/components/admin/AdminImageOrdersClient';
import { redirect } from 'next/navigation';

export default async function AdminImageOrdersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    redirect('/');
  }

  const data = await prisma.imageOrder.findMany({
    orderBy: { createdAt: 'desc' }
  });
  
  const orders = data as unknown as ImageOrder[];

  return <AdminImageOrdersClient initialOrders={orders} />;
}
