'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * BehavioralTrigger
 *
 * Silently watches the current pathname and the visitor's dwell time.
 * When a visitor spends ≥ TRIGGER_DELAY ms on a high-intent page
 * (/pricing or /services) without having already interacted with the chatbot,
 * it dispatches a `forceOpenChatbot` CustomEvent — which AIChatbot.tsx already
 * listens for — with an optional context message attached.
 *
 * Rules:
 * - Fires once per page visit (won't re-trigger on the same path).
 * - Resets if the user navigates to a different page.
 * - Respects a session-storage flag to avoid repeat triggers across refreshes.
 */

const TRIGGER_DELAY_MS = 30_000; // 30 seconds

// High-intent paths that should trigger the chatbot
const TRIGGER_PATHS = ['/pricing', '/services'];

// Context-aware opening messages keyed by path segment
const PATH_MESSAGES: Record<string, string> = {
  '/pricing': "Hey! Exploring our pricing? Drop your email and I'll send you a custom B2B agency rate card with an exclusive discount — directly to your inbox. 👇",
  '/services': "Hi there! Looking at our services? Share your email and I'll put together a tailored proposal for your project within 24 hours. 🚀",
};

function getMessageForPath(pathname: string): string {
  const match = TRIGGER_PATHS.find(p => pathname.startsWith(p));
  return match ? PATH_MESSAGES[match] : "Hi! Can I help answer any questions? Drop your email for a personalised response.";
}

export default function BehavioralTrigger() {
  const pathname = usePathname();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    // Clear any existing timer when path changes
    if (timerRef.current) clearTimeout(timerRef.current);
    firedRef.current = false;

    // Only activate on high-intent paths
    const isHighIntent = TRIGGER_PATHS.some(p => pathname.startsWith(p));
    if (!isHighIntent) return;

    // Don't re-trigger if already fired this session for this path
    const sessionKey = `chatbot_triggered_${pathname}`;
    if (typeof window !== 'undefined' && sessionStorage.getItem(sessionKey)) return;

    timerRef.current = setTimeout(() => {
      if (firedRef.current) return;
      firedRef.current = true;

      // Mark as triggered for this session
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(sessionKey, '1');
      }

      // Dispatch the event AIChatbot already listens for, with a custom message
      const message = getMessageForPath(pathname);
      window.dispatchEvent(
        new CustomEvent('forceOpenChatbot', { detail: { message } })
      );

      if (process.env.NODE_ENV === 'development') {
        console.log(`[BehavioralTrigger] Fired on "${pathname}" after ${TRIGGER_DELAY_MS / 1000}s dwell.`);
      }
    }, TRIGGER_DELAY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  // This component renders nothing — it's a pure side-effect orchestrator
  return null;
}
