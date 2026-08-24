import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { Activity, Clock, Globe, MapPin, MonitorSmartphone, MousePointerClick } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Live Traffic | CoderNest Admin',
};

// Force dynamic so we always get the freshest data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function LiveTrafficPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR')) {
    redirect('/auth/login');
  }

  // Fetch the latest 50 visitors with their page views
  const visitors = await prisma.visitor.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 50,
    include: {
      pageViews: {
        orderBy: { createdAt: 'desc' }, // newest views first
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
          <p className="text-sm text-slate-400">Monitoring real-time visitor sessions and page views.</p>
        </div>
      </div>

      <div className="glass rounded-3xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-300">Visitor</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Location</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Total Time</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Last Active</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Journey (Newest First)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {visitors.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <MonitorSmartphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    No traffic data recorded yet.
                  </td>
                </tr>
              )}
              {visitors.map((visitor) => {
                const totalTime = visitor.pageViews.reduce((acc, pv) => acc + pv.timeSpent, 0);
                const shortSessionId = visitor.sessionId.substring(0, 8);
                const isOnline = (new Date().getTime() - visitor.updatedAt.getTime()) < 60000; // active in last 60s
                
                return (
                  <tr key={visitor.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                        <span className="font-mono text-slate-300" title={visitor.sessionId}>
                          {shortSessionId}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 ml-4">
                        IP: {visitor.ipAddress === '::1' || visitor.ipAddress === '127.0.0.1' ? 'Localhost' : (visitor.ipAddress || 'Unknown')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        {visitor.location || 'Unknown Region'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        {formatDuration(totalTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-400 text-xs">
                        {timeAgo(visitor.updatedAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 max-w-sm">
                        {visitor.pageViews.map((pv, idx) => (
                          <div key={pv.id} className="flex items-center gap-2 text-xs">
                            <span className="text-slate-500 w-4">{visitor.pageViews.length - idx}.</span>
                            <Globe className="w-3 h-3 text-slate-600" />
                            <span className="text-slate-300 truncate max-w-[200px]" title={pv.url}>
                              {pv.url}
                            </span>
                            <span className="text-slate-500 bg-white/5 px-1.5 py-0.5 rounded ml-auto flex-shrink-0">
                              {formatDuration(pv.timeSpent)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
