import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        status: {
          in: ['paid', 'PAID', 'Paid']
        }
      },
      select: { amount: true }
    });

    // Sum all paid invoice amounts
    const amount = invoices.reduce((sum, inv) => sum + inv.amount, 0);

    return NextResponse.json({ amount });
  } catch (error) {
    console.error('Error fetching revenue:', error);
    return NextResponse.json({ error: 'Failed to fetch revenue' }, { status: 500 });
  }
}
