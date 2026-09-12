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
  const startTimeRef = useRef<number>(Date.now());
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
    startTimeRef.current = Date.now();
    pageViewIdRef.current = null;

    // 3. Initialize the page view on the server (deferred to idle time to protect LCP / mobile CPU)
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
      } catch {
        // Non-blocking telemetry
      }
    };

    let idleId: any = null;
    let timerId: any = null;

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = (window as any).requestIdleCallback(initPageView, { timeout: 2000 });
    } else {
      timerId = setTimeout(initPageView, 1000);
    }

    // 4. Low-overhead 30s heartbeat (avoids 1s CPU wakeup loops on mobile)
    intervalRef.current = setInterval(() => {
      if (!pageViewIdRef.current) return;
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);

      fetch('/api/track/pageview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          pageViewId: pageViewIdRef.current,
          timeSpent,
          url: pathname,
        }),
        keepalive: true,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.triggerChatbot) {
            if (!sessionStorage.getItem('chatbot_triggered')) {
              sessionStorage.setItem('chatbot_triggered', 'true');
              window.dispatchEvent(new CustomEvent('forceOpenChatbot'));
            }
          }
        })
        .catch(() => {});
    }, 30000);

    // Cleanup on unmount (or path change)
    return () => {
      if (idleId && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(idleId);
      }
      if (timerId) clearTimeout(timerId);
      if (intervalRef.current) clearInterval(intervalRef.current);

      if (pageViewIdRef.current) {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        const payload = JSON.stringify({
          action: 'update',
          pageViewId: pageViewIdRef.current,
          timeSpent,
          url: pathname,
        });

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

  // Use visibilitychange to catch tab closing/switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && pageViewIdRef.current) {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        const payload = JSON.stringify({
          action: 'update',
          pageViewId: pageViewIdRef.current,
          timeSpent,
          url: pathname,
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
  }, [pathname]);

  return null;
}
