import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { getGlobalSettings } from '@/lib/actions/settings.actions';
import SettingsForm from '@/components/admin/SettingsForm';
import { prisma } from '@/lib/prisma';

export default async function GlobalSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  const appUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  
  if (appUser?.role !== 'SUPER_ADMIN') {
    redirect('/admin');
  }

  const { data: initialSettings } = await getGlobalSettings();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Global Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Configure branding, contact details, SMTP, and third-party integrations.
        </p>
      </div>

      <SettingsForm initialSettings={initialSettings || {}} />
    </div>
  );
}
