'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    atOptions: any;
  }
}

interface AdsterraBannerProps {
  adKey: string;
  width: number;
  height: number;
  format?: string;
}

export default function AdsterraBanner({ adKey, width, height, format = 'iframe' }: AdsterraBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    // Prevent duplicate injections on fast re-renders
    if (containerRef.current.querySelector(`script[src*="${adKey}"]`)) {
      return;
    }

    // Configure Adsterra options
    window.atOptions = {
      'key' : adKey,
      'format' : format,
      'height' : height,
      'width' : width,
      'params' : {}
    };

    const configScript = document.createElement('script');
    configScript.type = 'text/javascript';
    configScript.innerHTML = `atOptions = ${JSON.stringify(window.atOptions)};`;

    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.async = true;
    invokeScript.src = `https://www.highrevenueformat.com/${adKey}/invoke.js`;

    containerRef.current.appendChild(configScript);
    containerRef.current.appendChild(invokeScript);
  }, [adKey, width, height, format]);

  return (
    <div 
      className="bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-800 my-8 mx-auto"
      style={{ width: `${width}px`, height: `${height}px`, minHeight: `${height}px` }}
      ref={containerRef}
    >
      {/* Adsterra script will inject the iframe here */}
    </div>
  );
}
