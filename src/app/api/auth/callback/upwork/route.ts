import { NextRequest, NextResponse } from 'next/server';
import { getApiKeys, saveApiKeys } from '@/actions/job-hunter.actions';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    // 1. Validate State to prevent CSRF
    const savedState = req.cookies.get('upwork_oauth_state')?.value;
    if (!state || state !== savedState) {
      return NextResponse.json({ error: 'Invalid state parameter. Possible CSRF attack.' }, { status: 403 });
    }

    if (!code) {
      return NextResponse.json({ error: 'Authorization code not provided.' }, { status: 400 });
    }

    const clientId = process.env.UPWORK_API_KEY;
    const clientSecret = process.env.UPWORK_API_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Upwork API credentials not configured in .env' }, { status: 500 });
    }

    const redirectUri = 'https://codernest.cloud/api/auth/callback/upwork';

    // 2. Exchange Code for Access Token
    const tokenResponse = await fetch('https://www.upwork.com/api/v3/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('[UPWORK OAUTH ERROR]:', errorText);
      return NextResponse.redirect(new URL('/admin/api-settings?upwork_error=token_exchange_failed', req.url));
    }

    const tokenData = await tokenResponse.json();

    // 3. Save tokens securely
    const keys = await getApiKeys();
    keys.upworkAccessToken = tokenData.access_token;
    keys.upworkRefreshToken = tokenData.refresh_token;
    // Calculate expiry (expires_in is usually in seconds)
    keys.upworkTokenExpiry = Date.now() + (tokenData.expires_in * 1000);

    const saveRes = await saveApiKeys(keys);
    if (!saveRes.success) {
      console.error('[UPWORK OAUTH ERROR]: Failed to save keys to file', saveRes.error);
      return NextResponse.redirect(new URL('/admin/api-settings?upwork_error=storage_failed', req.url));
    }

    // 4. Redirect back to API settings with success flag
    const response = NextResponse.redirect(new URL('/admin/api-settings?upwork_connected=true', req.url));
    // Clear the state cookie
    response.cookies.delete('upwork_oauth_state');
    
    return response;

  } catch (error: any) {
    console.error('[UPWORK OAUTH CATCH ERROR]:', error);
    return NextResponse.redirect(new URL('/admin/api-settings?upwork_error=internal_error', req.url));
  }
}
