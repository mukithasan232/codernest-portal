'use client';

import React from 'react';
import Link from 'next/link';
import { Check, Mail, MessageCircle, ArrowRight, Sparkles } from 'lucide-react';
import type { PricingPlan } from '@/types';

interface PricingPlansProps {
  plans?: PricingPlan[];
  title?: string;
  subtitle?: string;
}

const DEFAULT_PLANS: PricingPlan[] = [
  {
    id: 'default-1',
    category: 'PHOTO_EDITING',
    modelType: 'UNIT_BASED',
    title: 'Clipping path',
    name: 'Clipping path',
    priceDisplay: '$0.20',
    unitLabel: '/Per image',
    unit: '/Per image',
    badge: null,
    isPopular: false,
    features: [
      'Starting at Just $0.20 per Simple Image',
      'If you send at least 400+ images, you can enjoy our special bulk pricing.',
    ],
    ctaText: 'Contact Us',
    ctaAction: 'contact',
    ctaLink: '/contact',
    order: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'default-2',
    category: 'PHOTO_EDITING',
    modelType: 'FIXED_PACKAGE',
    title: 'Multi Layer Clipping',
    name: 'Multi Layer Clipping',
    priceDisplay: '$1-$3',
    unitLabel: '/per image',
    unit: '/per image',
    badge: 'Most Popular',
    isPopular: true,
    features: [
      'Multi-Layer Clipping Service allows you to select and isolate every part of your image for precise color correction and detailed editing.',
      'Use our Multi-Layer Clipping to gain full control over your image.',
    ],
    ctaText: 'info@clippingbd.com',
    ctaAction: 'contact',
    ctaLink: 'mailto:info@clippingbd.com',
    order: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'default-3',
    category: 'PHOTO_EDITING',
    modelType: 'FIXED_PACKAGE',
    title: 'Monthly fixed-price packages',
    name: 'Monthly fixed-price packages',
    priceDisplay: '$1',
    unitLabel: '/Per image',
    unit: '/Per image',
    badge: null,
    isPopular: false,
    features: [
      'We also offer monthly fixed-price packages for regular clients — perfect for ongoing photo editing needs at a cost-effective rate & unlimited edits',
      'Dedicated support',
    ],
    ctaText: 'Whats App : +8801749616724',
    ctaAction: 'whatsapp',
    ctaLink: 'https://wa.me/8801749616724',
    order: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function PricingPlans({
  plans,
  title = 'Competitive Market Pricing',
  subtitle = 'Transparent, high-volume rates for global e-commerce, photographers, and studios.',
}: PricingPlansProps) {
  const displayPlans = (plans && plans.length > 0 ? plans : DEFAULT_PLANS).filter(p => p.isActive);

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs sm:text-sm font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" /> High-End Image Studio Pricing
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

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-8 items-stretch pt-4">
        {displayPlans.map((plan) => {
          const link = plan.ctaLink || '#contact';
          const isWhatsApp = link.includes('wa.me') || plan.ctaText.toLowerCase().includes('whats app');
          const isEmail = link.startsWith('mailto:') || plan.ctaText.includes('@');
          const isExternal = link.startsWith('http') || link.startsWith('mailto:');

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl flex flex-col justify-between transition-all duration-300 ${
                plan.isPopular
                  ? 'bg-zinc-900/90 border-2 border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.22)] md:-translate-y-2'
                  : 'bg-zinc-900/60 border border-zinc-800/90 hover:border-zinc-700 shadow-xl hover:shadow-2xl'
              } p-6 sm:p-8 backdrop-blur-xl`}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-zinc-950 shadow-[0_0_20px_rgba(6,182,212,0.6)] z-10 flex items-center gap-1.5 whitespace-nowrap">
                  <Sparkles className="w-3.5 h-3.5 fill-zinc-950" />
                  {plan.badge || 'Most Popular'}
                </div>
              )}

              {/* Card Top */}
              <div>
                {/* Plan Name */}
                <h3 className="text-xl sm:text-2xl font-bold text-white text-center mt-2">
                  {plan.title || plan.name}
                </h3>

                {/* Price Display */}
                <div className="mt-6 mb-8 text-center flex items-baseline justify-center gap-1">
                  <span
                    className={`text-4xl sm:text-5xl font-black tracking-tight ${
                      plan.isPopular ? 'text-cyan-400' : 'text-blue-400'
                    }`}
                  >
                    {plan.priceDisplay}
                  </span>
                  <span className="text-cyan-300/80 font-bold text-sm sm:text-base">
                    {plan.unitLabel || plan.unit || '/per image'}
                  </span>
                </div>

                {/* Features List */}
                <div className="space-y-4 pt-4 border-t border-zinc-800/80">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-8 pt-4">
                {isExternal ? (
                  <a
                    href={link}
                    target={link.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-200 ${
                      plan.isPopular
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-zinc-950 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:scale-[1.02]'
                        : isWhatsApp
                        ? 'bg-zinc-800/90 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/60 shadow-lg'
                        : isEmail
                        ? 'bg-zinc-800/90 hover:bg-blue-600/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60 shadow-lg'
                        : 'bg-zinc-800/90 hover:bg-zinc-700 text-white border border-zinc-700 shadow-lg'
                    }`}
                  >
                    {isWhatsApp && <MessageCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                    {isEmail && <Mail className="w-4 h-4 text-cyan-300 flex-shrink-0" />}
                    <span>{plan.ctaText}</span>
                    {!isWhatsApp && !isEmail && <ArrowRight className="w-4 h-4" />}
                  </a>
                ) : (
                  <Link
                    href={link}
                    className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-200 ${
                      plan.isPopular
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-zinc-950 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:scale-[1.02]'
                        : 'bg-blue-600/20 hover:bg-blue-600 border border-blue-500/40 text-blue-300 hover:text-white shadow-lg'
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
