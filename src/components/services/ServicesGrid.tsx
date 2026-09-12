'use client';

import React from 'react';
import Link from 'next/link';
import {
  Scissors,
  Crop,
  Sparkles,
  Layers,
  Camera,
  Image as ImageIcon,
  Wand2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import type { PhotoService } from '@/types';

interface ServicesGridProps {
  services?: PhotoService[];
  title?: string;
  subtitle?: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Scissors,
  Crop,
  Sparkles,
  Layers,
  Camera,
  Wand2,
  Image: ImageIcon,
};

const DEFAULT_SERVICES: PhotoService[] = [
  {
    id: 'default-s1',
    title: 'Clipping Path',
    slug: 'clipping-path',
    description: 'High-quality precise clipping paths for product images with 100% hand-drawn pen tool vectors.',
    iconName: 'Scissors',
    imageUrl: '/dummy-laptop.png',
    features: [
      '100% Hand-Drawn Pen Tool Paths',
      'Multiple Path & Color Masking',
      'Drop Shadow & Reflection Creation',
      'Complex Jewelry & Apparel Handling',
    ],
    order: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'default-s2',
    title: 'Image Cutout',
    slug: 'image-cutout',
    description: 'Remove unwanted parts & 3D photo editing service with pixel-perfect edges.',
    iconName: 'Crop',
    imageUrl: '/dummy-laptop.png',
    features: [
      'Precise Edge Extraction',
      'Alpha Channel & Raster Masking',
      'Ghost Mannequin / Neck Joint',
      'Transparent PNG / White Background',
    ],
    order: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'default-s3',
    title: 'Retouching',
    slug: 'retouching',
    description: 'Enhance brightness, color, and overall image quality for high-converting ecommerce products.',
    iconName: 'Sparkles',
    imageUrl: '/dummy-laptop.png',
    features: [
      'High-End Jewelry & Beauty Retouching',
      'Frequency Separation & Texture Preservation',
      'Dust, Scratch & Glare Cleanup',
      'Color Cast & Exposure Correction',
    ],
    order: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'default-s4',
    title: 'Background Removal',
    slug: 'background-removal',
    description: 'Clearly remove or replace backgrounds with ease, complying with Amazon and marketplace rules.',
    iconName: 'Layers',
    imageUrl: '/dummy-laptop.png',
    features: [
      'Amazon, eBay & Shopify Compliance',
      'Natural Shadow Preservation',
      'Custom Background Replacement',
      'Bulk Batch Processing in 24 Hours',
    ],
    order: 4,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function ServicesGrid({
  services,
  title = 'Specialized Photo Editing Services',
  subtitle = 'Enterprise-grade post-production for e-commerce studios, fashion brands, and high-volume agencies.',
}: ServicesGridProps) {
  const displayServices = (services && services.length > 0 ? services : DEFAULT_SERVICES).filter(s => s.isActive);

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs sm:text-sm font-semibold mb-4">
          <Scissors className="w-3.5 h-3.5" /> Hand-Crafted Photoshop Precision
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            {subtitle}
          </p>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {displayServices.map((service, index) => {
          const Icon = (service.iconName && ICON_MAP[service.iconName]) || Scissors;

          return (
            <div
              key={service.id}
              className="group relative bg-zinc-950/70 border border-zinc-800/80 hover:border-cyan-500/50 rounded-3xl p-7 sm:p-9 transition-all duration-300 hover:shadow-[0_0_35px_rgba(6,182,212,0.15)] flex flex-col justify-between backdrop-blur-md"
            >
              <div>
                {/* Icon & Index Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-300">
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-black tracking-widest text-zinc-600 group-hover:text-cyan-400 transition-colors uppercase">
                    SERVICE 0{index + 1}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
                  {service.description}
                </p>

                {/* Features Bullets */}
                <div className="mt-6 space-y-2.5 pt-4 border-t border-zinc-800/60">
                  {service.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-slate-300 font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Link */}
              <div className="mt-8 pt-4 flex items-center justify-between border-t border-zinc-800/40">
                <Link
                  href={`/services/image-editing#${service.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors"
                >
                  Explore Details
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </Link>
                <Link
                  href="/free-trial"
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition"
                >
                  Test 3 Images Free
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
