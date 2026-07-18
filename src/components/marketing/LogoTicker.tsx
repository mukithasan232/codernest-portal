import React from 'react';

// Example Logo SVGs - these would typically be imported from a separate file
const Logos = [
  {
    name: 'Acme Corp',
    icon: (
      <svg className="w-auto h-8" viewBox="0 0 100 30" fill="currentColor">
        <path d="M10 20L20 5h10L20 30H10l-5-10 5-10z" />
        <text x="35" y="22" fontSize="20" fontWeight="bold">Acme</text>
      </svg>
    ),
  },
  {
    name: 'Quantum',
    icon: (
      <svg className="w-auto h-8" viewBox="0 0 120 30" fill="currentColor">
        <circle cx="15" cy="15" r="10" />
        <circle cx="25" cy="15" r="10" fillOpacity="0.5" />
        <text x="45" y="22" fontSize="20" fontWeight="bold">Quantum</text>
      </svg>
    ),
  },
  {
    name: 'Echo',
    icon: (
      <svg className="w-auto h-8" viewBox="0 0 100 30" fill="currentColor">
        <path d="M10 15c0-8 6-15 15-15s15 7 15 15-6 15-15 15-15-7-15-15z" />
        <text x="45" y="22" fontSize="20" fontWeight="bold">Echo</text>
      </svg>
    ),
  },
  {
    name: 'Apex',
    icon: (
      <svg className="w-auto h-8" viewBox="0 0 100 30" fill="currentColor">
        <path d="M20 5L5 30h30L20 5z" />
        <text x="40" y="22" fontSize="20" fontWeight="bold">Apex</text>
      </svg>
    ),
  },
  {
    name: 'Nexus',
    icon: (
      <svg className="w-auto h-8" viewBox="0 0 110 30" fill="currentColor">
        <rect x="5" y="5" width="20" height="20" rx="4" />
        <rect x="15" y="15" width="20" height="20" rx="4" fillOpacity="0.5" />
        <text x="45" y="22" fontSize="20" fontWeight="bold">Nexus</text>
      </svg>
    ),
  },
  {
    name: 'Zephyr',
    icon: (
      <svg className="w-auto h-8" viewBox="0 0 120 30" fill="currentColor">
        <path d="M5 25L25 5h15L20 25H5z" />
        <path d="M15 30l20-20h15L30 30H15z" fillOpacity="0.5" />
        <text x="55" y="22" fontSize="20" fontWeight="bold">Zephyr</text>
      </svg>
    ),
  },
];

export default function LogoTicker() {
  return (
    <section 
      aria-labelledby="logo-ticker-heading" 
      className="py-12 bg-white dark:bg-slate-950 overflow-hidden"
    >
      <h2 id="logo-ticker-heading" className="sr-only">
        Trusted by High-Growth Teams
      </h2>
      
      <div className="container mx-auto px-4 md:px-6 mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Trusted by High-Growth Teams
        </p>
      </div>

      <div className="relative flex max-w-[100vw] overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)] group">
        
        {/* First Set of Logos */}
        <div className="flex w-max min-w-full shrink-0 animate-marquee items-center justify-around gap-16 px-8 group-hover:[animation-play-state:paused]">
          {Logos.map((logo, index) => (
            <div 
              key={`logo-1-${index}`}
              className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors duration-300"
              aria-label={logo.name}
            >
              {logo.icon}
            </div>
          ))}
        </div>

        {/* Second Set of Logos (Duplicate for Infinite Loop) */}
        <div 
          aria-hidden="true" 
          className="flex w-max min-w-full shrink-0 animate-marquee items-center justify-around gap-16 px-8 group-hover:[animation-play-state:paused]"
        >
          {Logos.map((logo, index) => (
            <div 
              key={`logo-2-${index}`}
              className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors duration-300"
            >
              {logo.icon}
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
