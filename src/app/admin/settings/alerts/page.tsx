import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getAlertChannels } from '@/lib/actions/alert-channels.actions';
import AlertChannelsClient from '@/components/admin/alerts/AlertChannelsClient';
import Link from 'next/link';
import { Bell, ArrowLeft, Shield } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Multi-Channel Alert Gateway | CoderNest Admin',
  description: 'Manage SMS, WhatsApp, and Telegram alert channels verified via secure 6-digit SMS OTP.',
};

export default async function AlertSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  const appUser = await prisma.user.findUnique({ where: { id: session.user.id } });

  if (appUser?.role !== 'SUPER_ADMIN') {
    redirect('/admin');
  }

  const { data: channels } = await getAlertChannels();

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header with Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Global Settings
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/10">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Multi-Channel Alert Gateway
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                Register, verify via SMS OTP, and broadcast real-time critical alerts across SMS, WhatsApp, and Telegram.
              </p>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Super Admin Protected</span>
        </div>
      </div>

      {/* Main Client Component */}
      <AlertChannelsClient initialChannels={channels || []} />
    </div>
  );
}
