'use client';

import { motion } from 'framer-motion';
import { Stethoscope, Globe, Film, Tag } from 'lucide-react';

const LOGOS = [
  { name: 'MedOS', icon: Stethoscope },
  { name: 'SMM Elite', icon: Globe },
  { name: 'CoderNest Cinema', icon: Film },
  { name: 'DevVibe', icon: Tag },
  // Duplicate for seamless loop
  { name: 'MedOS', icon: Stethoscope },
  { name: 'SMM Elite', icon: Globe },
  { name: 'CoderNest Cinema', icon: Film },
  { name: 'DevVibe', icon: Tag },
];

export default function ClientLogos() {
  return (
    <section className="py-10 border-y border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <p className="text-center text-sm font-medium text-slate-500 uppercase tracking-widest">
          OUR FLAGSHIP PROJECTS & BRANDS
        </p>
      </div>
      
      {/* Marquee Container */}
      <div className="flex w-[200%] md:w-[150%] lg:w-[120%] whitespace-nowrap">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 25, repeat: Infinity }}
          className="flex gap-12 md:gap-24 items-center justify-start opacity-70 px-4"
        >
          {LOGOS.map((logo, i) => {
            const Icon = logo.icon;
            return (
              <div key={i} className="flex items-center gap-3 text-slate-800 dark:text-slate-300 min-w-max">
                <Icon className="w-8 h-8 md:w-10 md:h-10" />
                <span className="text-xl md:text-2xl font-bold tracking-tight">{logo.name}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
      
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-50 dark:from-black to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-50 dark:from-black to-transparent pointer-events-none" />
    </section>
  );
}
