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
    <>
      <Script
        id="google-fc-present"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function() {function signalGooglefcPresent() {if (!window.frames['googlefcPresent']) {if (document.body) {const iframe = document.createElement('iframe'); iframe.style = 'width: 0; height: 0; border: none; z-index: -1000; left: -1000px; top: -1000px;'; iframe.style.display = 'none'; iframe.name = 'googlefcPresent'; document.body.appendChild(iframe);} else {setTimeout(signalGooglefcPresent, 0);}}}signalGooglefcPresent();})();`
        }}
      />
      <Script
        async
        src="https://fundingchoicesmessages.google.com/i/pub-4590020337376910?ers=1"
        strategy="afterInteractive"
      />
      <Script 
        async 
        crossOrigin="anonymous" 
        id="google-adsense" 
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`} 
        strategy="afterInteractive"
      />
    </>
  );
}
