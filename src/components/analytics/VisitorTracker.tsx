'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function VisitorTracker() {
  const pathname = usePathname();
  const pageViewIdRef = useRef<string | null>(null);
  const timeSpentRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    // 1. Get or create Session ID
    let sessionId = localStorage.getItem('codernest_session');
    if (!sessionId) {
      sessionId = generateUUID();
      localStorage.setItem('codernest_session', sessionId);
    }
    sessionIdRef.current = sessionId;

    // 2. Reset tracking variables for this new page view
    timeSpentRef.current = 0;
    pageViewIdRef.current = null;

    // 3. Initialize the page view on the server
    const initPageView = async () => {
      try {
        const res = await fetch('/api/track/pageview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'init',
            sessionId: sessionIdRef.current,
            url: pathname,
          }),
        });
        const data = await res.json();
        if (data.pageViewId) {
          pageViewIdRef.current = data.pageViewId;
        }
      } catch (err) {
        console.error('Failed to init page view tracking:', err);
      }
    };

    initPageView();

    // 4. Start local timer & heartbeat
    intervalRef.current = setInterval(() => {
      timeSpentRef.current += 1; // Increment by 1 second

      // Heartbeat: sync with server every 10 seconds
      if (timeSpentRef.current % 10 === 0 && pageViewIdRef.current) {
        fetch('/api/track/pageview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            pageViewId: pageViewIdRef.current,
            timeSpent: timeSpentRef.current,
          }),
          // Optional: use keepalive so if user navigates during heartbeat it doesn't abort
          keepalive: true,
        }).then(res => res.json()).then(data => {
          if (data.triggerChatbot) {
            // Check session storage so we only trigger this once per session
            if (!sessionStorage.getItem('chatbot_triggered')) {
              sessionStorage.setItem('chatbot_triggered', 'true');
              window.dispatchEvent(new CustomEvent('forceOpenChatbot'));
            }
          }
        }).catch(() => {});
      }
    }, 1000);

    // Cleanup on unmount (or path change)
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Attempt final update if we have a valid pageViewId
      if (pageViewIdRef.current) {
        const payload = JSON.stringify({
          action: 'update',
          pageViewId: pageViewIdRef.current,
          timeSpent: timeSpentRef.current,
        });

        // Use sendBeacon for more reliable delivery during page unload
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/track/pageview', new Blob([payload], { type: 'application/json' }));
        } else {
          fetch('/api/track/pageview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      }
    };
  }, [pathname]);

  // Use visibilitychange to catch tab closing/switching more reliably
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && pageViewIdRef.current) {
        const payload = JSON.stringify({
          action: 'update',
          pageViewId: pageViewIdRef.current,
          timeSpent: timeSpentRef.current,
        });
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/track/pageview', new Blob([payload], { type: 'application/json' }));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null; // Invisible component
}
