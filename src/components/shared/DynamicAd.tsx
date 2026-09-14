'use client';

import { useEffect, useRef } from 'react';

// Extend the Window interface to include atOptions
declare global {
  interface Window {
    atOptions: any;
  }
}

interface DynamicAdProps {
  adKey: string;
  width: number;
  height: number;
  format?: string;
}

export default function DynamicAd({ adKey, width, height, format = 'iframe' }: DynamicAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    // Check if the script for this specific key is already appended
    if (containerRef.current.querySelector(`script[src*="${adKey}"]`)) {
      return;
    }

    // 1. Define the ad network configuration parameters for this specific ad
    window.atOptions = {
      'key' : adKey,
      'format' : format,
      'height' : height,
      'width' : width,
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
    invokeScript.src = `https://www.highrevenueformat.com/${adKey}/invoke.js`;

    // 4. Append both scripts into this specific div
    containerRef.current.appendChild(configScript);
    containerRef.current.appendChild(invokeScript);
  }, [adKey, width, height, format]);

  return (
    <div 
      className="bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-800 my-4"
      style={{ width: `${width}px`, height: `${height}px` }}
      ref={containerRef}
    >
      {/* The ad network will inject the iframe here */}
    </div>
  );
}
