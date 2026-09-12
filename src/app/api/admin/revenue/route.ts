import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getDashboardMetrics, logRevenueRecord, type LogRevenueInput } from '@/lib/actions/dashboard-metrics.actions';

export const dynamic = 'force-dynamic';

function isAdmin(role: string) {
  return role === 'SUPER_ADMIN' || role === 'EDITOR';
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const metrics = await getDashboardMetrics();
    return NextResponse.json(metrics);
  } catch (err) {
    console.error('[/api/admin/revenue GET]', err);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as LogRevenueInput;
    if (!body.title || !body.amount || body.amount <= 0) {
      return NextResponse.json({ error: 'title and a positive amount are required' }, { status: 400 });
    }
    const result = await logRevenueRecord(body);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[/api/admin/revenue POST]', err);
    return NextResponse.json({ error: 'Failed to log revenue' }, { status: 500 });
  }
}
