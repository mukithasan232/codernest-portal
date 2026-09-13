import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { logMarketingExpense, type LogExpenseInput } from '@/lib/actions/dashboard-metrics.actions';

export const dynamic = 'force-dynamic';

function isAdmin(role: string) {
  return role === 'SUPER_ADMIN' || role === 'EMPLOYEE';
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const expenses = await prisma.marketingExpense.findMany({
      orderBy: { date: 'desc' },
      take: 30,
    });
    return NextResponse.json(expenses);
  } catch (err) {
    console.error('[/api/admin/expenses GET]', err);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as LogExpenseInput;
    if (!body.campaign || !body.amountSpent || body.amountSpent <= 0) {
      return NextResponse.json({ error: 'campaign and a positive amountSpent are required' }, { status: 400 });
    }
    const result = await logMarketingExpense(body);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[/api/admin/expenses POST]', err);
    return NextResponse.json({ error: 'Failed to log expense' }, { status: 500 });
  }
}
