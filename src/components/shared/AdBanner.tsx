'use client';

import { useEffect } from 'react';

export default function AdBanner() {
  useEffect(() => {
    // Only run on the client side
    if (typeof window === 'undefined') return;

    // We add an ID to the script so we don't accidentally load it multiple times if the component re-renders
    const scriptId = 'profitableratecpmnetwork-script';
    
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = 'https://pl31346216.profitableratecpmnetwork.com/e7a07442e45561b37d61ab872ced746f/invoke.js';
      
      // Append the script to the body so it can find the container div below
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full flex justify-center items-center my-8 overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900/50 min-h-[90px] border border-slate-200 dark:border-white/10">
      {/* The ad network script will locate this exact ID and inject the ad banner inside it */}
      <div id="container-e7a07442e45561b37d61ab872ced746f" />
    </div>
  );
}
