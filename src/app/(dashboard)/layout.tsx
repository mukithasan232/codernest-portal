import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { DashboardShell } from '@/components/layout/DashboardShell';

export const metadata = {
  title: 'CoderNest | Dashboard',
  description: 'Client & Admin Dashboard',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  // Dashboard layout for authenticated users
  return <DashboardShell>{children}</DashboardShell>;
}
