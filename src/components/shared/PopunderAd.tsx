'use client';

import { useEffect } from 'react';

export default function PopunderAd({ url }: { url: string }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Simple pop-under implementation
    // This will open the ad network link once per session when the user clicks anywhere on the document
    const handleClick = (e: MouseEvent) => {
      // Don't trigger on internal links so we don't break navigation
      const target = e.target as HTMLElement;
      if (target.closest('a')) return;

      const hasPopped = sessionStorage.getItem('ad_popped');
      if (!hasPopped) {
        sessionStorage.setItem('ad_popped', 'true');
        // Open in new tab/window in the background if possible
        const adWindow = window.open(url, '_blank', 'noopener,noreferrer');
        if (adWindow) {
          adWindow.blur();
          window.focus();
        }
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [url]);

  return null; // Invisible component
}
