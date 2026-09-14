import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

const HOSTINGER_API_URL = 'https://developers.hostinger.com/api';

async function fetchHostinger(endpoint: string, token: string) {
  const res = await fetch(`${HOSTINGER_API_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Hostinger API error: ${res.status}`);
  }
  return res.json();
}

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

    const token = process.env.HOSTINGER_API_KEY;
    if (!token) {
      return NextResponse.json({ success: false, error: 'HOSTINGER_API_KEY is not configured in .env' }, { status: 500 });
    }

    // Fetch data in parallel
    const [websitesResult, vpsResult, domainsResult] = await Promise.allSettled([
      fetchHostinger('/hosting/v1/websites', token),
      fetchHostinger('/vps/v1/vps', token), // Assuming VPS endpoint
      fetchHostinger('/domains/v1/domains', token) // Assuming Domains endpoint
    ]);

    const websites = websitesResult.status === 'fulfilled' ? (websitesResult.value.data || websitesResult.value || []) : [];
    const vps = vpsResult.status === 'fulfilled' ? (vpsResult.value.data || vpsResult.value || []) : [];
    const domains = domainsResult.status === 'fulfilled' ? (domainsResult.value.data || domainsResult.value || []) : [];
    
    // Check if everything failed
    if (websitesResult.status === 'rejected' && vpsResult.status === 'rejected' && domainsResult.status === 'rejected') {
      return NextResponse.json({ 
        success: false, 
        error: `Hostinger Authentication Failed: ${websitesResult.reason?.message || 'Invalid API Token'}`
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: {
        websites,
        vps,
        domains,
      }
    });

  } catch (error: any) {
    console.error('Hosting API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
