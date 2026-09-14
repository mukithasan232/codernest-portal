'use client';

import Script from 'next/script';

interface GlobalAdScriptProps {
  src: string;
}

export default function GlobalAdScript({ src }: GlobalAdScriptProps) {
  return (
    <Script 
      src={src}
      strategy="afterInteractive"
    />
  );
}
