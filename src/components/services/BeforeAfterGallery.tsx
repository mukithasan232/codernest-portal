'use client';

import React, { useState } from 'react';
import { Sparkles, Layers, Image as ImageIcon } from 'lucide-react';
import BeforeAfterSlider from '@/components/ui/BeforeAfterSlider';
import type { BeforeAfterShowcase } from '@/types';

interface BeforeAfterGalleryProps {
  showcases?: BeforeAfterShowcase[];
  title?: string;
  subtitle?: string;
}

const DEFAULT_SHOWCASES: BeforeAfterShowcase[] = [
  {
    id: 'sc-1',
    title: 'Jewelry Clipping & Retouching',
    category: 'Clipping Path',
    beforeImage: '/uploads/media/1788382703903-412306699-Screenshot2026-09-03at2.58.20AM.png',
    afterImage: '/uploads/media/1788382734277-944822245-Screenshot2026-09-03at2.58.50AM.png',
    order: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sc-2',
    title: 'Apparel Ghost Mannequin & Neck Joint',
    category: 'Ghost Mannequin',
    beforeImage: '/uploads/media/1788382656271-910943777-Screenshot2026-09-03at2.57.32AM.png',
    afterImage: '/uploads/media/1788382787841-202593526-Screenshot2026-09-03at2.59.43AM.png',
    order: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sc-3',
    title: 'Product Shadow & Color Correction',
    category: 'Color Correction',
    beforeImage: '/uploads/media/1788382441956-422497682-Screenshot2026-09-03at2.53.54AM.png',
    afterImage: '/uploads/media/1788382493882-771316256-Screenshot2026-09-03at2.54.49AM.png',
    order: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function BeforeAfterGallery({
  showcases,
  title = 'Interactive Before / After Showcase',
  subtitle = 'Drag the slider handle to inspect our pixel-perfect pen tool cutouts and color grading.',
}: BeforeAfterGalleryProps) {
  const items = (showcases && showcases.length > 0 ? showcases : DEFAULT_SHOWCASES).filter(s => s.isActive);

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))];
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter(i => i.category === activeCategory);

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs sm:text-sm font-semibold mb-4">
          <Layers className="w-3.5 h-3.5" /> High-Resolution Inspection
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            {subtitle}
          </p>
        )}

        {/* Category Filters */}
        {categories.length > 2 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-cyan-500 text-zinc-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                    : 'bg-zinc-900/80 text-slate-400 hover:text-white border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid of Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-zinc-950/80 border border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-white">
                  {item.title}
                </h3>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  {item.category}
                </span>
              </div>
              <BeforeAfterSlider
                beforeImage={item.beforeImage}
                afterImage={item.afterImage}
                altText={item.title}
                className="border border-white/10 shadow-2xl rounded-2xl"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
