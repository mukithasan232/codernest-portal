'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

const GA_MEASUREMENT_ID = 'G-KP23NXQTBX';

// Extend the Window interface to satisfy TypeScript strict mode
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

/**
 * Inner tracker — must be wrapped in <Suspense> because useSearchParams()
 * opts the component out of static rendering.
 */
function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Exclude privileged / non-marketing routes from tracking
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/system-setting') ||
      pathname.startsWith('/auth')
    ) {
      return;
    }

    // Exclude Vercel deployment preview URLs to keep GA data clean
    if (
      typeof window !== 'undefined' &&
      window.location.hostname.includes('vercel.app')
    ) {
      return;
    }

    // Fire page_view on every SPA route transition or query-param change
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      const url =
        pathname +
        (searchParams?.toString() ? `?${searchParams.toString()}` : '');

      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: url,
        page_title: document.title,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

/**
 * Drop this component into the root layout once.
 * - Loads the gtag.js script with `afterInteractive` strategy (non-blocking).
 * - Initialises GA4 with `send_page_view: false` to prevent a duplicate hit
 *   on the initial hydration (the AnalyticsTracker effect fires immediately
 *   after mount and sends the first real hit).
 * - Tracks every subsequent client-side navigation via the Suspense-wrapped
 *   AnalyticsTracker.
 */
export default function GoogleAnalytics() {
  return (
    <>
      {/* Load GA4 script asynchronously after page is interactive */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />

      {/* Initialise dataLayer — disable automatic page_view to avoid double-counting */}
      <Script id="google-gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            send_page_view: false
          });
        `}
      </Script>

      {/*
        Suspense boundary is required because useSearchParams() suspends
        during static rendering. fallback={null} keeps the shell clean.
      */}
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
    </>
  );
}
