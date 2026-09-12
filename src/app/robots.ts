import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.codernest.cloud';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/portal/',
          '/auth/',
        ],
      },
      {
        userAgent: [
          'Googlebot',
          'Bingbot',
          'OAI-SearchBot',
          'GPTBot',
          'ChatGPT-User',
          'ClaudeBot',
          'PerplexityBot',
          'Applebot',
        ],
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/portal/',
          '/auth/',
        ],
      },
    ],
    sitemap: `${baseUrl.replace(/\/$/, '')}/sitemap.xml`,
  };
}
