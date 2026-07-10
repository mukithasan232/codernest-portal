'use client';

/**
 * CaseStudyCard — Portfolio case study preview card
 */

import Link from 'next/link';
import type { CaseStudy } from '@/types';
import { ArrowRight, Star, Code2, Image as ImageIcon } from 'lucide-react';

interface CaseStudyCardProps {
  study: CaseStudy;
}

export default function CaseStudyCard({ study }: CaseStudyCardProps) {
  const SectorIcon = study.sector === 'web' ? Code2 : ImageIcon;

  return (
    <Link
      href={`/portfolio/${study.slug}`}
      className="group glass rounded-3xl border border-white/10 overflow-hidden hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 block"
    >
      {/* Cover image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-900/30 to-purple-900/30 overflow-hidden">
        {study.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={study.imageUrl}
            alt={study.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <SectorIcon className="w-16 h-16 text-white/10" />
          </div>
        )}

        {/* Sector badge */}
        <div className="absolute top-4 left-4">
          <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
            study.sector === 'web'
              ? 'bg-blue-500/80 text-white'
              : 'bg-purple-500/80 text-white'
          }`}>
            <SectorIcon className="w-3 h-3" />
            {study.sector === 'web' ? 'Web Dev' : 'Image Studio'}
          </span>
        </div>

        {study.featured && (
          <div className="absolute top-4 right-4">
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-yellow-500/80 text-white">
              <Star className="w-3 h-3 fill-white" /> Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-3">
        {study.clientName && (
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{study.clientName}</p>
        )}

        <h3 className="text-lg font-extrabold text-white group-hover:text-blue-300 transition-colors leading-snug">
          {study.title}
        </h3>

        <p className="text-sm text-slate-400 line-clamp-2">{study.challenge}</p>

        {/* Tech stack */}
        {study.techStack?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {study.techStack.slice(0, 4).map(tech => (
              <span key={tech} className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/10 text-slate-300">
                {tech}
              </span>
            ))}
            {study.techStack.length > 4 && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/10 text-slate-500">
                +{study.techStack.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5 text-sm font-bold text-blue-400 pt-2">
          Read Case Study
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
