import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import type { Invoice } from '@/types';
import AdminInvoicesClient from '@/components/admin/AdminInvoicesClient';
import { redirect } from 'next/navigation';

export default async function AdminInvoicesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    redirect('/');
  }

  const data = await prisma.invoice.findMany({
    orderBy: { createdAt: 'desc' }
  });
  
  const invoices = data as unknown as Invoice[];

  return <AdminInvoicesClient initialInvoices={invoices} />;
}
