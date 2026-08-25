import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AnalyticsDashboardClient from './AnalyticsDashboardClient';

export default async function EmailAnalyticsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR')) {
    redirect('/auth/signin');
  }

  // Fetch all campaigns and their logs
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      logs: {
        include: {
          lead: true
        }
      }
    }
  });

  // Calculate Aggregates
  const totalSent = campaigns.reduce((acc, curr) => acc + curr.totalSent, 0);
  const totalOpened = campaigns.reduce((acc, curr) => acc + curr.totalOpened, 0);
  const totalClicked = campaigns.reduce((acc, curr) => acc + curr.totalClicked, 0);
  
  const averageOpenRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
  const averageClickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">Campaign Analytics</h1>
          <p className="text-slate-400 mt-1">Track the performance of your email marketing efforts in real-time.</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border border-white/10">
          <p className="text-sm text-slate-400 font-medium mb-1">Total Emails Sent</p>
          <p className="text-4xl font-bold text-white">{totalSent.toLocaleString()}</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/10">
          <p className="text-sm text-slate-400 font-medium mb-1">Avg. Open Rate</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-emerald-400">{averageOpenRate}%</p>
            <p className="text-sm text-slate-500 mb-1">({totalOpened.toLocaleString()} opens)</p>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/10">
          <p className="text-sm text-slate-400 font-medium mb-1">Avg. Click Rate</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-purple-400">{averageClickRate}%</p>
            <p className="text-sm text-slate-500 mb-1">({totalClicked.toLocaleString()} clicks)</p>
          </div>
        </div>
      </div>

      {/* Client Dashboard Component for interactions */}
      <AnalyticsDashboardClient campaigns={campaigns} />
    </div>
  );
}
