import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { Activity } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import LiveTrafficClient from './LiveTrafficClient';

export const metadata: Metadata = {
  title: 'Live Traffic | CoderNest Admin',
};

// Force dynamic so we always get the freshest data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LiveTrafficPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR')) {
    redirect('/auth/login');
  }

  // Fetch the latest 100 visitors.
  // Bots are now silently dropped at the tracking API before any DB write,
  // so no server-side isBot filter is needed. Any legacy isBot records are
  // handled client-side by LiveTrafficClient.
  const visitors = await prisma.visitor.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 100,
    include: {
      pageViews: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Live Traffic</h1>
          <p className="text-sm text-slate-400">Monitoring real-time visitor sessions, intelligent scoring, and reverse IP identity.</p>
        </div>
      </div>

      <LiveTrafficClient initialVisitors={visitors} />
    </div>
  );
}
