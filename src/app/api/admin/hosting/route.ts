import { NextResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const appUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!appUser || (appUser.role !== 'SUPER_ADMIN' && appUser.role !== 'EMPLOYEE')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // TODO: Connect to Hostinger API here
    
    return NextResponse.json({
      success: true,
      message: 'Hostinger API placeholder',
      data: {
        websites: [],
        vps: [],
        domains: [],
      }
    });

  } catch (error: any) {
    console.error('Hosting API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
