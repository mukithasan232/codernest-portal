import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const clientId = process.env.UPWORK_API_KEY;
  if (!clientId) {
    return NextResponse.json({ error: 'UPWORK_API_KEY is not configured in .env' }, { status: 500 });
  }

  // Generate a random state string to prevent CSRF
  const state = crypto.randomBytes(16).toString('hex');
  
  // Hardcoded callback URL as requested
  const redirectUri = 'https://codernest.cloud/api/auth/callback/upwork';
  
  // Upwork authorization URL
  const authUrl = new URL('https://www.upwork.com/ab/account-security/oauth2/authorize');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('state', state);

  const response = NextResponse.redirect(authUrl.toString());

  // Store the state in a cookie for validation in the callback route
  response.cookies.set('upwork_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10, // 10 minutes
  });

  return response;
}
