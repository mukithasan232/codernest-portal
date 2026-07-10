import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { cookies } from 'next/headers';

export const metadata = {
  title: 'CoderNest | Admin Dashboard',
  description: 'Enterprise B2B SaaS Dashboard',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Admin Check via public.users table
  const { data: dbUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!dbUser || (dbUser.role !== 'admin' && dbUser.role !== 'super_admin')) {
    // If not an admin, boot them back to the marketing site
    redirect('/');
  }

  return <DashboardShell>{children}</DashboardShell>;
}
