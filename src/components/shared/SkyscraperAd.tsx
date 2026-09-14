'use client';

import { useEffect, useRef } from 'react';

// Extend the Window interface to include atOptions
declare global {
  interface Window {
    atOptions: any;
  }
}

export default function SkyscraperAd() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    // Check if the script is already appended in this container to prevent duplicates
    if (containerRef.current.querySelector('script[src*="highrevenueformat"]')) {
      return;
    }

    // 1. Define the ad network configuration parameters
    window.atOptions = {
      'key' : '82a8b46c6fd15d4b05c8a2a95b98bef3',
      'format' : 'iframe',
      'height' : 600,
      'width' : 160,
      'params' : {}
    };

    // 2. Create the configuration script block
    const configScript = document.createElement('script');
    configScript.type = 'text/javascript';
    configScript.innerHTML = `atOptions = ${JSON.stringify(window.atOptions)};`;

    // 3. Create the external invoke script
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.async = true;
    invokeScript.src = "https://www.highrevenueformat.com/82a8b46c6fd15d4b05c8a2a95b98bef3/invoke.js";

    // 4. Append both scripts into this specific div
    containerRef.current.appendChild(configScript);
    containerRef.current.appendChild(invokeScript);
  }, []);

  return (
    <div 
      className="w-[160px] h-[600px] bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-800"
      ref={containerRef}
    >
      {/* The script will inject the 160x600 iframe here */}
    </div>
  );
}
