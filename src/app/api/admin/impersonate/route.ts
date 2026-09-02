import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only SUPER_ADMIN can impersonate
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { targetUserId } = await req.json();

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target User ID is required' }, { status: 400 });
    }

    // Set an impersonation cookie
    const response = NextResponse.json({ success: true });
    
    response.cookies.set({
      name: 'codernest_impersonate_id',
      value: targetUserId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60, // 1 hour
    });

    return response;
  } catch (error: any) {
    console.error('Impersonation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to start impersonation' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const response = NextResponse.json({ success: true });
    
    // Remove the cookie
    response.cookies.set({
      name: 'codernest_impersonate_id',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to stop impersonation' }, { status: 500 });
  }
}
