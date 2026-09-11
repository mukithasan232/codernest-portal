'use client';

import React from 'react';
import { BrainCircuit, Boxes, Radio } from 'lucide-react';

interface IconProps {
  className?: string;
}

// Crisp Vector Icons for Technologies
const PythonIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11.914 2c-4.475 0-4.184 1.94-4.184 1.94l.006 2.01h4.254v.6H6.17S3.5 6.25 3.5 10.74c0 4.48 2.33 4.33 2.33 4.33h1.39v-1.95s-.08-2.33 2.29-2.33h3.94s2.21.03 2.21-2.15V4.18S15.98 2 11.914 2zm-2.28 1.25a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6zm2.457 18.75c4.475 0 4.184-1.94 4.184-1.94l-.006-2.01H12.015v-.6h5.815s2.67.3 2.67-4.19c0-4.48-2.33-4.33-2.33-4.33h-1.39v1.95s.08 2.33-2.29 2.33h-3.94s-2.21-.03-2.21 2.15v4.46s-.32 2.18 3.75 2.18zm2.28-1.25a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6z"/>
  </svg>
);

const TypeScriptIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 3h18v18H3V3zm8.9 9.3h-2.1V19H7.6v-6.7H5.5V11h6.4v1.3zm7.3 3.6c-.3.7-.8 1.3-1.5 1.7-.7.4-1.6.6-2.6.6-1.1 0-2-.2-2.7-.7-.7-.5-1.1-1.2-1.3-2.1l2-.8c.1.5.4.9.8 1.2.4.3.9.4 1.5.4.5 0 .9-.1 1.2-.3.3-.2.4-.5.4-.8 0-.3-.1-.5-.4-.7-.2-.2-.7-.4-1.4-.6-1-.3-1.7-.7-2.1-1.1-.4-.4-.7-1-.7-1.7 0-.7.3-1.4.9-1.9.6-.5 1.4-.8 2.4-.8.9 0 1.7.2 2.4.6.7.4 1.1 1 1.3 1.8l-1.9.8c-.1-.4-.3-.7-.6-.9-.3-.2-.7-.3-1.2-.3-.5 0-.8.1-1.1.3-.2.2-.4.4-.4.7 0 .3.1.5.3.6.2.2.6.3 1.3.5 1 .3 1.8.7 2.2 1.1.5.5.7 1.1.7 1.8z" />
  </svg>
);

const JavaScriptIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 3h18v18H3V3zm8.2 12.8c0 .8-.2 1.4-.6 1.8-.4.4-1 .6-1.8.6-.8 0-1.5-.3-1.9-.8l1.3-1.3c.2.3.4.5.7.5.3 0 .5-.1.6-.2.1-.1.2-.3.2-.6v-5.2h1.5v5.2zm7 0c0 .9-.3 1.6-.8 2.1-.6.5-1.4.7-2.4.7-1 0-1.8-.2-2.4-.7-.6-.5-1-1.2-1.1-2.1l1.6-.6c.1.5.3.9.6 1.2.3.3.8.4 1.3.4.5 0 .9-.1 1.2-.3.3-.2.4-.5.4-.8 0-.3-.1-.5-.4-.7-.2-.2-.6-.3-1.3-.5-1-.3-1.7-.6-2.1-1-.4-.4-.6-.9-.6-1.6 0-.7.3-1.4.8-1.8.6-.5 1.3-.7 2.2-.7.9 0 1.6.2 2.2.6.6.4.9 1 1.1 1.7l-1.6.6c-.1-.4-.3-.7-.5-.9-.3-.2-.6-.3-1.1-.3-.4 0-.8.1-1 .3-.2.2-.4.4-.4.7 0 .3.1.5.3.6.2.2.6.3 1.2.5 1 .3 1.8.7 2.2 1.1.4.5.6 1.1.6 1.8z" />
  </svg>
);

const HTML5Icon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M4.07 2.25l1.46 16.33L12 20.42l6.47-1.84 1.46-16.33H4.07zm13.14 5.37h-7.6l.18 2.01h7.24l-.57 6.42-4.46 1.24-4.46-1.24-.31-3.48h1.99l.16 1.78 2.62.71 2.62-.71.27-3.03H7.4l-.54-6.05h10.53l-.18 2.35z"/>
  </svg>
);

const CSS3Icon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M4.07 2.25l1.46 16.33L12 20.42l6.47-1.84 1.46-16.33H4.07zm12.96 4.37l-.22 2.46H8.56l.22 2.45h7.79l-.58 6.46-3.99 1.11-3.99-1.11-.26-2.91h2.02l.14 1.49 2.09.56 2.09-.56.22-2.52H6.98l-.66-7.44h10.71z"/>
  </svg>
);

const ReactIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="-11.5 -10.23174 23 20.46348" fill="currentColor" className={className}>
    <circle cx="0" cy="0" r="2.05" />
    <g stroke="currentColor" strokeWidth="1" fill="none">
      <ellipse rx="11" ry="4.2" />
      <ellipse rx="11" ry="4.2" transform="rotate(60)" />
      <ellipse rx="11" ry="4.2" transform="rotate(120)" />
    </g>
  </svg>
);

const NextjsIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.3 14.7L9.5 8.7V16H8V8h1.6l5.8 7.9V8h1.5v8.7h-1.6z"/>
  </svg>
);

const TailwindIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.335 6.182 14.974 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.335 13.382 8.974 12 6.001 12z"/>
  </svg>
);

const NodejsIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L3.5 6.9v9.8L12 21.6l8.5-4.9V6.9L12 2zm-1.1 14.6c-2.3 0-3.6-1.1-3.6-2.9 0-2.1 1.7-2.6 3.6-2.8v-.6c0-.6-.4-.9-1.2-.9-.7 0-1.3.2-1.8.5l-.5-1.1c.7-.5 1.6-.7 2.6-.7 1.9 0 2.8.9 2.8 2.4v4.2c0 .6.1 1 .2 1.2h-1.8c-.1-.2-.2-.6-.3-.9-.6.8-1.4 1.1-2.4 1.1zm.4-1.4c.7 0 1.3-.3 1.6-.8v-1.7c-1.3.2-2.1.5-2.1 1.5 0 .7.5 1 1.2 1.0z"/>
  </svg>
);

const ExpressIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3.1 6.5h3.3l3.1 5.3 3.1-5.3h3.3l-4.7 7.7 5 7.8h-3.4l-3.3-5.5-3.3 5.5H3.1l4.9-7.8-4.9-7.7zm14.3 6.9c.7-1.1 1.9-1.8 3.3-1.8 2.2 0 3.8 1.6 3.8 4.2v.3h-5.4c.1 1.3.9 2 2.1 2 .8 0 1.5-.3 1.9-.8l1.1 1.1c-.7.9-1.8 1.4-3.1 1.4-2.4 0-4-1.7-4-4.2 0-2.3 1.6-4.2 3.8-4.2 2.3 0 3.7 1.8 3.7 4 0 .3 0 .6-.1.8h-7.1c.1-1.3.8-2 2-2z"/>
  </svg>
);

const PrismaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.55 2.13a.9.9 0 0 0-1.1.25L2.1 16.5a.9.9 0 0 0 .5 1.38l8.28 3.99a.9.9 0 0 0 1.05-.22l9.9-12.8a.9.9 0 0 0-.25-1.28L12.55 2.13zm-.5 2.76 7.43 4.29-8.1 10.47-6.55-3.16L12.05 4.89z" />
  </svg>
);

const PostgresIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12c0 2.85 1.2 5.42 3.12 7.24.4-.38.83-.71 1.3-.98C5.55 16.8 5 15.22 5 13.5c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5c0 1.72-.55 3.3-1.42 4.76.47.27.9.6 1.3.98C19.8 17.42 21 14.85 21 12c0-5.52-4.48-10-9-10zm-1 7h2v5h-2V9zm-3 2h2v3H8v-3zm6 0h2v3h-2v-3z"/>
  </svg>
);

const SupabaseIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13.4 2.1c-.5-.6-1.5-.2-1.5.6v8.4H3.4c-.8 0-1.2 1-.6 1.5l8.5 9.3c.5.6 1.5.2 1.5-.6v-8.4h8.5c.8 0 1.2-1 .6-1.5L13.4 2.1z"/>
  </svg>
);

const FirebaseIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M4.5 18.2L6.8 3.9a.7.7 0 0 1 1.3-.2l2.9 5.4-6.5 9.1zm14.3.4L17.2 9.5a.7.7 0 0 0-1.3-.2l-2.4 4.5 5.3 4.8zm-15 1.1l1.8 1c.7.4 1.6.4 2.3 0l8.7-5-5.6-5.1-7.2 9.1z"/>
  </svg>
);

const MySQLIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 3C7.03 3 3 5.24 3 8v8c0 2.76 4.03 5 9 5s9-2.24 9-5V8c0-2.76-4.03-5-9-5zm0 2c4.08 0 7 1.7 7 3s-2.92 3-7 3-7-1.7-7-3 2.92-3 7-3zm7 6.13c-.92.83-2.3 1.48-3.9 1.85 1.05.5 1.7 1.15 1.7 1.87 0 .2-.06.39-.17.57.94-.37 1.7-.82 2.37-1.34v-2.95zm-14 0v2.95c.67.52 1.43.97 2.37 1.34-.11-.18-.17-.37-.17-.57 0-.72.65-1.37 1.7-1.87-1.6-.37-2.98-1.02-3.9-1.85zM12 19c-4.08 0-7-1.7-7-3v-1.12c1.78 1.17 4.22 1.87 7 1.87s5.22-.7 7-1.87V16c0 1.3-2.92 3-7 3z"/>
  </svg>
);

const OpenAIIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M21.5 10.4c-.2-.9-.8-1.6-1.5-2-.2-.1-.5-.2-.7-.2.1-.6 0-1.3-.4-1.8-.4-.7-1.1-1.1-1.9-1.3-.5-.1-1.1 0-1.6.3-.4-.5-1-.9-1.7-1.1-.9-.2-1.8 0-2.5.6-.4-.3-.9-.5-1.5-.5-1.1 0-2.1.6-2.6 1.5-.4.6-.5 1.4-.4 2.1-.7.2-1.3.6-1.7 1.2-.5.7-.7 1.6-.5 2.5-.5.3-.9.8-1.2 1.3-.4.8-.4 1.8 0 2.6.2.5.6.9 1 1.2-.1.7 0 1.4.4 2 .4.7 1.1 1.2 1.9 1.4.5.1 1.1 0 1.6-.3.4.5 1 .9 1.7 1.1.9.2 1.8 0 2.5-.6.4.3.9.5 1.5.5 1.1 0 2.1-.6 2.6-1.5.4-.6.5-1.4.4-2.1.7-.2 1.3-.6 1.7-1.2.5-.7.7-1.6.5-2.5.5-.3.9-.8 1.2-1.3.4-.8.4-1.8 0-2.6-.2-.6-.6-1-1-1.3zM12 14.5c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z"/>
  </svg>
);

const GeminiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 24C12 17.37 6.63 12 0 12C6.63 12 12 6.63 12 0C12 6.63 17.37 12 24 12C17.37 12 12 17.37 12 24Z"/>
  </svg>
);

export interface TechStackItem {
  name: string;
  category: 'Languages' | 'Frontend' | 'Backend & DB' | 'Architecture & AI';
  icon: React.ComponentType<IconProps>;
}

// Complete expanded tech stack organized for a balanced, dynamic marquee
export const TECH_STACK_ITEMS: TechStackItem[] = [
  // 1. Next.js (App Router)
  {
    name: 'Next.js (App Router)',
    category: 'Frontend',
    icon: NextjsIcon,
  },
  // 2. Python
  {
    name: 'Python',
    category: 'Languages',
    icon: PythonIcon,
  },
  // 3. React.js (React 19)
  {
    name: 'React.js (React 19)',
    category: 'Frontend',
    icon: ReactIcon,
  },
  // 4. OpenAI
  {
    name: 'OpenAI',
    category: 'Architecture & AI',
    icon: OpenAIIcon,
  },
  // 5. TypeScript
  {
    name: 'TypeScript',
    category: 'Languages',
    icon: TypeScriptIcon,
  },
  // 6. Node.js
  {
    name: 'Node.js',
    category: 'Backend & DB',
    icon: NodejsIcon,
  },
  // 7. Gemini API
  {
    name: 'Gemini API',
    category: 'Architecture & AI',
    icon: GeminiIcon,
  },
  // 8. PostgreSQL
  {
    name: 'PostgreSQL',
    category: 'Backend & DB',
    icon: PostgresIcon,
  },
  // 9. Tailwind CSS
  {
    name: 'Tailwind CSS',
    category: 'Frontend',
    icon: TailwindIcon,
  },
  // 10. Supabase
  {
    name: 'Supabase',
    category: 'Backend & DB',
    icon: SupabaseIcon,
  },
  // 11. LLM Workflows
  {
    name: 'LLM Workflows',
    category: 'Architecture & AI',
    icon: BrainCircuit,
  },
  // 12. JavaScript
  {
    name: 'JavaScript',
    category: 'Languages',
    icon: JavaScriptIcon,
  },
  // 13. Express.js
  {
    name: 'Express.js',
    category: 'Backend & DB',
    icon: ExpressIcon,
  },
  // 14. Monorepo
  {
    name: 'Monorepo',
    category: 'Architecture & AI',
    icon: Boxes,
  },
  // 15. Prisma ORM
  {
    name: 'Prisma ORM',
    category: 'Backend & DB',
    icon: PrismaIcon,
  },
  // 16. HTML5
  {
    name: 'HTML5',
    category: 'Languages',
    icon: HTML5Icon,
  },
  // 17. Firebase
  {
    name: 'Firebase',
    category: 'Backend & DB',
    icon: FirebaseIcon,
  },
  // 18. UDP Protocol
  {
    name: 'UDP Protocol',
    category: 'Architecture & AI',
    icon: Radio,
  },
  // 19. MySQL/MariaDB
  {
    name: 'MySQL/MariaDB',
    category: 'Backend & DB',
    icon: MySQLIcon,
  },
  // 20. CSS3
  {
    name: 'CSS3',
    category: 'Languages',
    icon: CSS3Icon,
  },
];

const TechCard: React.FC<{ tech: TechStackItem; 'aria-hidden'?: boolean }> = ({ tech, 'aria-hidden': ariaHidden }) => {
  const IconComponent = tech.icon;

  return (
    <div
      aria-hidden={ariaHidden}
      className="group/item flex items-center gap-3.5 px-4 py-2.5 md:px-5 md:py-3 rounded-xl border border-slate-200/80 dark:border-white/5 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md transition-all duration-300 hover:border-slate-400 dark:hover:border-white/20 hover:bg-white dark:hover:bg-slate-800/90 hover:shadow-lg hover:shadow-blue-500/5 dark:hover:shadow-[0_0_22px_rgba(255,255,255,0.08)] hover:-translate-y-0.5 cursor-default shrink-0 select-none"
    >
      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover/item:text-slate-900 dark:group-hover/item:text-white transition-all duration-300 group-hover/item:scale-110 shrink-0">
        <IconComponent className="w-4 h-4 md:w-5 md:h-5" />
      </div>
      <div className="flex flex-col text-left">
        <span className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover/item:text-slate-900 dark:group-hover/item:text-white transition-colors duration-200 whitespace-nowrap">
          {tech.name}
        </span>
        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {tech.category}
        </span>
      </div>
    </div>
  );
};

export default function TechStack() {
  return (
    <section className="py-12 md:py-16 border-b border-slate-200 dark:border-white/5 bg-slate-100/60 dark:bg-white/[0.02] transition-colors duration-300 relative overflow-hidden group-marquee">
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <p className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.25em]">
          Powered by cutting-edge technology
        </p>
      </div>

      {/* Infinite Horizontal Marquee Track */}
      <div className="relative w-full overflow-hidden">
        {/* Soft edge masking gradients */}
        <div className="absolute inset-y-0 left-0 w-20 md:w-44 bg-gradient-to-r from-slate-100 dark:from-[#000000] to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-20 md:w-44 bg-gradient-to-l from-slate-100 dark:from-[#000000] to-transparent pointer-events-none z-10" />

        {/* Marquee Track with Pause on Hover */}
        <div className="flex overflow-hidden">
          <div className="animate-marquee-scroll flex items-center gap-4 md:gap-5 py-2">
            {/* Primary Track */}
            {TECH_STACK_ITEMS.map((tech, idx) => (
              <TechCard key={`tech-primary-${idx}`} tech={tech} />
            ))}
            {/* Duplicate Track for Seamless Loop */}
            {TECH_STACK_ITEMS.map((tech, idx) => (
              <TechCard key={`tech-duplicate-${idx}`} tech={tech} aria-hidden />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
