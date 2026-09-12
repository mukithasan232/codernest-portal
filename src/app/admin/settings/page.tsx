import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { getGlobalSettings } from '@/lib/actions/settings.actions';
import { getAllSocialLinksAdmin } from '@/lib/actions/social-links.actions';
import SettingsForm from '@/components/admin/SettingsForm';
import SocialLinksManager from '@/components/admin/settings/SocialLinksManager';
import { prisma } from '@/lib/prisma';

import Link from 'next/link';
import { Bell } from 'lucide-react';

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
  const { data: socialLinks } = await getAllSocialLinksAdmin();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Global Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Configure branding, contact details, SMTP, and third-party integrations.
        </p>
      </div>

      {/* Multi-Channel Alert Gateway Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/30 to-slate-900 border border-blue-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Multi-Channel Alert Gateway (SMS, WhatsApp, Telegram)</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Connect your mobile or Telegram handle with 6-digit SMS OTP verification for real-time lead and system alerts.
            </p>
          </div>
        </div>
        <Link
          href="/admin/settings/alerts"
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 transition-all shadow-lg shadow-blue-500/25 inline-flex items-center gap-2"
        >
          Manage Alert Channels ➔
        </Link>
      </div>

      <SettingsForm initialSettings={initialSettings || {}} />

      {/* Social & Platform Links Manager */}
      <SocialLinksManager initialLinks={socialLinks || []} />
    </div>
  );
}
