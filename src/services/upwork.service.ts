import { getApiKeys, saveApiKeys, JobListing } from '@/actions/job-hunter.actions';

const UPWORK_API_BASE = 'https://www.upwork.com/api';

/**
 * Refreshes the Upwork OAuth Token if expired.
 */
async function refreshUpworkToken(keys: any): Promise<string> {
  const clientId = process.env.UPWORK_API_KEY;
  const clientSecret = process.env.UPWORK_API_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('UPWORK_API_KEY or UPWORK_API_SECRET missing in .env');
  }

  if (!keys.upworkRefreshToken) {
    throw new Error('No refresh token available. User must re-authenticate.');
  }

  const tokenResponse = await fetch(`${UPWORK_API_BASE}/v3/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: keys.upworkRefreshToken,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('[UPWORK REFRESH ERROR]:', errorText);
    throw new Error('Failed to refresh Upwork token. Please reconnect Upwork.');
  }

  const tokenData = await tokenResponse.json();

  // Save new tokens
  keys.upworkAccessToken = tokenData.access_token;
  keys.upworkRefreshToken = tokenData.refresh_token;
  keys.upworkTokenExpiry = Date.now() + (tokenData.expires_in * 1000);

  await saveApiKeys(keys);

  return tokenData.access_token;
}

/**
 * Ensures a valid access token is available.
 */
async function getValidAccessToken(): Promise<string> {
  const keys = await getApiKeys();

  if (!keys.upworkAccessToken) {
    throw new Error('Upwork is not connected. Please connect via API Settings.');
  }

  // Check expiry (buffer of 5 minutes)
  const isExpired = keys.upworkTokenExpiry ? Date.now() > keys.upworkTokenExpiry - (5 * 60 * 1000) : true;

  if (isExpired) {
    return await refreshUpworkToken(keys);
  }

  return keys.upworkAccessToken;
}

/**
 * Fetches matching jobs from Upwork.
 */
export async function fetchUpworkJobs(keywords: string[] = ['react', 'nextjs', 'node']): Promise<{ success: boolean; jobs?: JobListing[]; error?: string; status?: number }> {
  try {
    let accessToken = await getValidAccessToken();
    const query = keywords.join(' OR ');

    // Call Upwork REST Search API
    const searchResponse = await fetch(`${UPWORK_API_BASE}/profiles/v2/search/jobs.json?q=${encodeURIComponent(query)}&sort=create_time%20desc`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (searchResponse.status === 401) {
      // Token might have been revoked or expired despite our check. Force refresh once.
      const keys = await getApiKeys();
      accessToken = await refreshUpworkToken(keys);
      
      // Retry once
      const retryResponse = await fetch(`${UPWORK_API_BASE}/profiles/v2/search/jobs.json?q=${encodeURIComponent(query)}&sort=create_time%20desc`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!retryResponse.ok) {
        if (retryResponse.status === 403) {
          return { success: false, error: 'Upwork API Key is currently pending review or disabled. (403 Forbidden)', status: 403 };
        }
        return { success: false, error: 'Failed to fetch Upwork jobs after token refresh.' };
      }
      
      return processUpworkResponse(await retryResponse.json());
    }

    if (searchResponse.status === 403) {
      return { success: false, error: 'Upwork API Key is currently pending review or disabled. Please check your Upwork API portal. (403 Forbidden)', status: 403 };
    }

    if (!searchResponse.ok) {
      return { success: false, error: `Upwork API returned ${searchResponse.status}: ${searchResponse.statusText}` };
    }

    const data = await searchResponse.json();
    return processUpworkResponse(data);

  } catch (error: any) {
    console.error('[UPWORK FETCH ERROR]:', error);
    return { success: false, error: error.message || 'Failed to communicate with Upwork API.' };
  }
}

/**
 * Maps Upwork response to internal JobListing schema
 */
function processUpworkResponse(data: any): { success: boolean; jobs: JobListing[] } {
  const upworkJobs = data.jobs || [];
  
  const mappedJobs: JobListing[] = upworkJobs.map((job: any) => {
    // Generate a match score mock or basic heuristic based on keyword density
    const matchScore = Math.floor(Math.random() * (98 - 75 + 1) + 75); // Mock 75-98 score for now

    return {
      id: `upw-${job.id}`,
      title: job.title || 'Untitled Job',
      clientName: job.client?.payment_verification_status === 1 ? 'Verified Client (via Upwork)' : 'Unverified Client (via Upwork)',
      source: 'Upwork',
      budget: job.budget ? `$${job.budget}` : 'Hourly / TBD',
      postedTime: job.date_created ? new Date(job.date_created).toLocaleString() : 'Recently',
      matchScore: matchScore,
      description: job.snippet || 'No description provided.',
      url: job.url || `https://www.upwork.com/jobs/~${job.id}`,
    };
  });

  return { success: true, jobs: mappedJobs };
}
