'use client';

import { motion } from 'framer-motion';
import type { CaseStudy } from '@/types';
import { ArrowRight, Layers, TrendingUp, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function CaseStudiesHighlight({ studies }: { studies: CaseStudy[] }) {
  if (!studies || studies.length === 0) return null;

  return (
    <div className="space-y-16">
      {studies.map((study, idx) => (
        <motion.div
          key={study.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className={`flex flex-col ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center`}
        >
          {/* Image Side */}
          <div className="flex-1 w-full">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <img
                src={study.imageUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085"}
                alt={study.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-6 left-6 z-20">
                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-3 inline-block shadow-sm">
                  {study.sector === 'web' ? 'Web Dev' : 'Image Studio'}
                </span>
                <h3 className="text-2xl font-bold text-white">{study.title}</h3>
                {study.clientName && <p className="text-slate-300 text-sm mt-1">{study.clientName}</p>}
              </div>
            </div>
          </div>

          {/* Content Side (Challenge -> Solution -> ROI) */}
          <div className="flex-1 w-full space-y-8">
            <div className="space-y-6">
              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-none">
                <h4 className="flex items-center gap-2 text-sm font-bold text-red-500 mb-2 uppercase tracking-wide">
                  <AlertCircleIcon className="w-4 h-4" /> The Challenge
                </h4>
                <p className="text-slate-700 dark:text-slate-400 text-sm leading-relaxed">{study.challenge}</p>
              </div>

              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-none">
                <h4 className="flex items-center gap-2 text-sm font-bold text-blue-500 mb-2 uppercase tracking-wide">
                  <Layers className="w-4 h-4" /> Our Solution
                </h4>
                <p className="text-slate-700 dark:text-slate-400 text-sm leading-relaxed">{study.solution}</p>
              </div>

              {study.results && (
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-none">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-green-500 mb-2 uppercase tracking-wide">
                    <TrendingUp className="w-4 h-4" /> ROI & Impact
                  </h4>
                  <p className="text-slate-700 dark:text-slate-400 text-sm leading-relaxed">{study.results}</p>
                </div>
              )}
            </div>

            <Link href={`/portfolio/${study.slug}`} className="inline-flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group">
              Read Full Case Study <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function AlertCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}
