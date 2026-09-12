'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';

const ADSENSE_CLIENT_ID = 'ca-pub-4590020337376910';

export default function GoogleAdSense() {
  const pathname = usePathname();

  // Exclude internal admin dashboard, auth screens, and preview URLs
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/system-setting')
  ) {
    return null;
  }

  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return null; // Avoid serving AdSense on preview deployments
  }

  return (
    <Script 
      async 
      crossOrigin="anonymous" 
      id="google-adsense" 
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`} 
      strategy="afterInteractive"
    />
  );
}
