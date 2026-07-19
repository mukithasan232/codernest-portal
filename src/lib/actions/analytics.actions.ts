'use server';

import { BetaAnalyticsDataClient } from '@google-analytics/data';

export type AnalyticsDayData = {
  date: string;       // e.g. "Jul 12"
  pageviews: number;
  activeUsers: number;
};

export type AnalyticsResult =
  | { success: true; data: AnalyticsDayData[]; totals: { pageviews: number; activeUsers: number } }
  | { success: false; reason: 'not_configured' | 'error'; error?: string };

/**
 * Fetches the last 7 days of GA4 pageviews and active users using the
 * Google Analytics Data API (v1beta).
 *
 * Required env vars:
 *   GA4_PROPERTY_ID              — e.g. "properties/123456789"
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL — service account client_email from JSON key
 *   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY — service account private_key from JSON key
 */
export async function getAnalyticsData(): Promise<AnalyticsResult> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  // Gracefully signal "not configured" so the UI can show a placeholder
  if (!propertyId || !clientEmail || !privateKey) {
    return { success: false, reason: 'not_configured' };
  }

  try {
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        // Vercel stores multi-line env vars with literal \n — replace them
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
    });

    const [response] = await analyticsDataClient.runReport({
      property: propertyId,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],   // YYYYMMDD
      metrics: [
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
      ],
      orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
    });

    const rows = response.rows ?? [];

    const data: AnalyticsDayData[] = rows.map(row => {
      const raw = row.dimensionValues?.[0]?.value ?? '';
      // Format YYYYMMDD → "Jul 12"
      const d = new Date(
        `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
      );
      const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const pageviews = parseInt(row.metricValues?.[0]?.value ?? '0', 10);
      const activeUsers = parseInt(row.metricValues?.[1]?.value ?? '0', 10);
      return { date, pageviews, activeUsers };
    });

    const totals = data.reduce(
      (acc, d) => ({
        pageviews: acc.pageviews + d.pageviews,
        activeUsers: acc.activeUsers + d.activeUsers,
      }),
      { pageviews: 0, activeUsers: 0 }
    );

    return { success: true, data, totals };
  } catch (err: any) {
    console.error('[Analytics] GA Data API error:', err?.message ?? err);
    return { success: false, reason: 'error', error: err?.message };
  }
}
