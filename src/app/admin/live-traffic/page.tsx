import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { Activity } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import LiveTrafficClient from './LiveTrafficClient';
import DateRangeFilter from '@/components/admin/DateRangeFilter';

export const metadata: Metadata = {
  title: 'Live Traffic | CoderNest Admin',
};

// Force dynamic so we always get the freshest data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LiveTrafficPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EMPLOYEE')) {
    redirect('/auth/login');
  }

  // Parse Date Range filter
  const range = (searchParams?.range as string) || 'today';
  let dateFilter: any = undefined;
  
  const now = new Date();
  if (range === 'today') {
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    dateFilter = { gte: startOfDay };
  } else if (range === 'yesterday') {
    const startOfYesterday = new Date(now);
    startOfYesterday.setDate(now.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);
    const endOfYesterday = new Date(now);
    endOfYesterday.setDate(now.getDate() - 1);
    endOfYesterday.setHours(23, 59, 59, 999);
    dateFilter = { gte: startOfYesterday, lte: endOfYesterday };
  } else if (range === 'this_month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    dateFilter = { gte: startOfMonth };
  } else if (range === 'custom') {
    const start = searchParams?.start as string;
    const end = searchParams?.end as string;
    if (start && end) {
      dateFilter = { 
        gte: new Date(`${start}T00:00:00.000Z`), 
        lte: new Date(`${end}T23:59:59.999Z`) 
      };
    }
  }

  // Fetch the visitors
  const visitors = await prisma.visitor.findMany({
    where: dateFilter ? { updatedAt: dateFilter } : undefined,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Live Traffic</h1>
            <p className="text-sm text-muted-foreground">Monitoring real-time visitor sessions, intelligent scoring, and reverse IP identity.</p>
          </div>
        </div>
        
        {/* Date Range Filter */}
        <DateRangeFilter />
      </div>

      <LiveTrafficClient initialVisitors={visitors} />
    </div>
  );
}
