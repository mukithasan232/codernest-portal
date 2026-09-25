import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { endOfDay, startOfDay } from 'date-fns';

function isStaff(role?: string) {
  return role === 'SUPER_ADMIN' || role === 'EMPLOYEE';
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isStaff(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const startParam = searchParams.get('startDate');
  const endParam = searchParams.get('endDate');

  const now = new Date();
  const startDate = startParam ? new Date(startParam) : startOfDay(now);
  const endDate = endParam ? new Date(endParam) : endOfDay(now);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return NextResponse.json({ error: 'Invalid date range.' }, { status: 400 });
  }

  const visitors = await prisma.visitor.findMany({
    where: {
      isBot: false,
      updatedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 200,
    include: {
      pageViews: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return NextResponse.json({ visitors });
}
