import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import type { Project } from '@/types';
import AdminProjectsClient from '@/components/admin/AdminProjectsClient';
import { redirect } from 'next/navigation';

export default async function AdminProjectsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    redirect('/');
  }

  const data = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' }
  });
  
  const projects = data as unknown as Project[];

  return <AdminProjectsClient initialProjects={projects} />;
}
