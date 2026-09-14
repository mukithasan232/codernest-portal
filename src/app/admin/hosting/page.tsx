import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import AdminHostingClient from '@/components/admin/AdminHostingClient';

export const metadata: Metadata = {
  title: 'Server Infrastructure | Admin',
  description: 'Manage Hostinger instances, websites, and VPS.',
};

export default async function AdminHostingPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    redirect('/auth/login?callbackUrl=/admin/hosting');
  }

  // Authorize User
  const appUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!appUser || (appUser.role !== 'SUPER_ADMIN' && appUser.role !== 'EMPLOYEE')) {
    redirect('/dashboard');
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminHostingClient />
    </div>
  );
}
