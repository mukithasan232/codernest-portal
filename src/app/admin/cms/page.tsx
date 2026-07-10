'use client';

/**
 * Admin CMS Hub — links to all content management sections
 */

import Link from 'next/link';
import { BookOpen, Layers, DollarSign, ArrowRight } from 'lucide-react';

const CMS_SECTIONS = [
  {
    href: '/admin/cms/blog',
    icon: BookOpen,
    label: 'Blog Posts',
    description: 'Create, edit, and publish blog articles. Markdown supported.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
  },
  {
    href: '/admin/cms/case-studies',
    icon: Layers,
    label: 'Case Studies',
    description: 'Manage portfolio case studies with Challenge / Solution / Tech Stack layout.',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/20',
  },
  {
    href: '/admin/cms/pricing',
    icon: DollarSign,
    label: 'Service Pricing',
    description: 'Update pricing tiers for Web Dev and Image Studio services.',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/20',
  },
];

export default function CmsHubPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Content Management</h1>
        <p className="text-slate-400 mt-1">Manage all site content without touching the codebase.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CMS_SECTIONS.map(sec => {
          const Icon = sec.icon;
          return (
            <Link
              key={sec.href}
              href={sec.href}
              className={`glass rounded-3xl border ${sec.border} p-8 flex flex-col gap-5 hover:scale-[1.02] transition-all group`}
            >
              <div className={`w-14 h-14 rounded-2xl ${sec.bg} flex items-center justify-center`}>
                <Icon className={`w-7 h-7 ${sec.color}`} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white group-hover:text-blue-300 transition">{sec.label}</h2>
                <p className="text-slate-400 text-sm mt-1">{sec.description}</p>
              </div>
              <div className={`flex items-center gap-2 text-sm font-semibold ${sec.color}`}>
                Open Editor <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
