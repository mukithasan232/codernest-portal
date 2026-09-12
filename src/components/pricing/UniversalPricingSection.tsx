'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Code2,
  Camera,
  Clock,
  Layers,
  Sparkles,
  Check,
  ArrowRight,
  MessageCircle,
  Mail,
  Calculator,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import type { PricingPlan, ServiceCategory, PricingModelType } from '@/types';

interface UniversalPricingSectionProps {
  plans?: PricingPlan[];
  initialCategory?: ServiceCategory;
  initialModel?: PricingModelType;
  title?: string;
  subtitle?: string;
}

export default function UniversalPricingSection({
  plans = [],
  initialCategory = 'SOFTWARE_DEV',
  initialModel = 'FIXED_PACKAGE',
  title = 'Transparent, Value-Driven Pricing',
  subtitle = 'Choose your discipline and billing model below. No surprises, no hidden retainers.',
}: UniversalPricingSectionProps) {
  const [category, setCategory] = useState<ServiceCategory>(initialCategory);
  const [modelType, setModelType] = useState<PricingModelType>(initialModel);

  // Unit-based interactive calculator states
  const [photoUnits, setPhotoUnits] = useState<number>(200); // 200 images
  const [devHours, setDevHours] = useState<number>(40);      // 40 hours

  // Filter plans based on active category & model
  const activePlans = useMemo(() => {
    return plans.filter(p => p.isActive && p.category === category && p.modelType === modelType);
  }, [plans, category, modelType]);

  // Helper to parse base numeric value from priceDisplay like "$0.20", "$40", "$4,500"
  const parsePrice = (priceStr: string): number => {
    const cleaned = priceStr.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-indigo-600/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs sm:text-sm font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Universal Dual-Mode Pricing
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            {subtitle}
          </p>
        )}
      </div>

      {/* DUAL SWITCHER BAR */}
      <div className="flex flex-col items-center gap-5 mb-14">
        {/* Tab 1: Category Switcher */}
        <div className="p-1.5 rounded-full bg-zinc-950/80 border border-zinc-800 backdrop-blur-xl flex items-center gap-1 shadow-2xl">
          <button
            onClick={() => setCategory('SOFTWARE_DEV')}
            className={`flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-300 ${
              category === 'SOFTWARE_DEV'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_25px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Software & SaaS Engineering</span>
          </button>

          <button
            onClick={() => setCategory('PHOTO_EDITING')}
            className={`flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-300 ${
              category === 'PHOTO_EDITING'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-zinc-950 shadow-[0_0_25px_rgba(6,182,212,0.5)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Photo Editing Studio</span>
          </button>
        </div>

        {/* Tab 2: Billing Model Switcher */}
        <div className="p-1 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md flex items-center gap-1">
          <button
            onClick={() => setModelType('FIXED_PACKAGE')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              modelType === 'FIXED_PACKAGE'
                ? 'bg-zinc-800 text-white shadow-md border border-zinc-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fixed Retainers & Milestones</span>
          </button>

          <button
            onClick={() => setModelType('UNIT_BASED')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              modelType === 'UNIT_BASED'
                ? 'bg-zinc-800 text-white shadow-md border border-zinc-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Pay As You Go / Per Unit</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC CALCULATOR SLIDER (Shown when modelType === 'UNIT_BASED') */}
      {modelType === 'UNIT_BASED' && (
        <div className="max-w-2xl mx-auto mb-12 p-6 sm:p-7 rounded-3xl bg-zinc-950/80 border border-zinc-800/90 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Calculator className="w-4 h-4" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white">
                {category === 'PHOTO_EDITING'
                  ? 'Batch Volume Estimator'
                  : 'Engineering Hours Estimator'}
              </h4>
            </div>
            <span className="text-xs sm:text-sm font-black px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              {category === 'PHOTO_EDITING' ? `${photoUnits} Images` : `${devHours} Hours`}
            </span>
          </div>

          {category === 'PHOTO_EDITING' ? (
            <div className="space-y-3">
              <input
                type="range"
                min="50"
                max="2000"
                step="50"
                value={photoUnits}
                onChange={e => setPhotoUnits(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-bold">
                <span>50 images (Min)</span>
                <span>400 images (Bulk Tier)</span>
                <span>2,000 images</span>
              </div>
              {photoUnits >= 400 && (
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 pt-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Special high-volume batch rate applied automatically!
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="range"
                min="10"
                max="160"
                step="5"
                value={devHours}
                onChange={e => setDevHours(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-bold">
                <span>10 hrs (Sprint)</span>
                <span>40 hrs (1 Week)</span>
                <span>160 hrs (Full Month)</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PRICING CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
        {activePlans.map(plan => {
          const isWhatsApp = plan.ctaAction === 'whatsapp' || plan.ctaLink?.includes('wa.me') || plan.ctaText.toLowerCase().includes('whats app');
          const isEmail = plan.ctaLink?.startsWith('mailto:') || plan.ctaText.includes('@');
          const isExternal = plan.ctaLink?.startsWith('http') || plan.ctaLink?.startsWith('mailto:');

          // Compute estimated total for unit-based plans
          const unitRate = parsePrice(plan.priceDisplay);
          const computedEstimate = modelType === 'UNIT_BASED' && unitRate > 0
            ? (category === 'PHOTO_EDITING'
                ? (photoUnits * unitRate).toFixed(2)
                : Math.round(devHours * unitRate).toLocaleString())
            : null;

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl flex flex-col justify-between transition-all duration-300 ${
                plan.isPopular
                  ? 'bg-zinc-950/90 border-2 border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.25)] md:-translate-y-1.5'
                  : 'bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 shadow-xl'
              } p-7 sm:p-9 backdrop-blur-xl`}
            >
              {/* Top Badge */}
              {plan.badge && (
                <div
                  className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 z-10 whitespace-nowrap ${
                    plan.isPopular
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-zinc-950 shadow-[0_0_20px_rgba(6,182,212,0.6)]'
                      : 'bg-zinc-800 text-slate-300 border border-zinc-700'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  {plan.badge}
                </div>
              )}

              <div>
                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-white text-center mt-2">
                  {plan.title || plan.name}
                </h3>

                {/* Description */}
                {plan.description && (
                  <p className="mt-2 text-xs sm:text-sm text-slate-400 text-center line-clamp-2">
                    {plan.description}
                  </p>
                )}

                {/* Price Display */}
                <div className="mt-6 mb-6 text-center">
                  <div className="flex items-baseline justify-center gap-1 font-mono">
                    <span
                      className={`text-4xl sm:text-5xl font-black tracking-tight ${
                        plan.isPopular ? 'text-cyan-400' : 'text-blue-400'
                      }`}
                    >
                      {plan.priceDisplay}
                    </span>
                    <span className="text-slate-400 text-xs sm:text-sm font-bold">
                      {plan.unitLabel || plan.unit}
                    </span>
                  </div>

                  {/* Computed Estimate Pill for Unit-Based */}
                  {computedEstimate && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold text-cyan-300">
                      <Calculator className="w-3 h-3" />
                      <span>
                        Estimated Total: ~${computedEstimate}{' '}
                        <span className="text-slate-400 font-normal">
                          ({category === 'PHOTO_EDITING' ? `${photoUnits} images` : `${devHours} hrs`})
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-3.5 pt-5 border-t border-zinc-800/80">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4">
                {isExternal ? (
                  <a
                    href={plan.ctaLink || '#contact'}
                    target={plan.ctaLink?.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-200 ${
                      plan.isPopular
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-zinc-950 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:scale-[1.02]'
                        : isWhatsApp
                        ? 'bg-zinc-800 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 shadow-lg'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 shadow-lg'
                    }`}
                  >
                    {isWhatsApp && <MessageCircle className="w-4 h-4 text-emerald-400" />}
                    {isEmail && <Mail className="w-4 h-4 text-cyan-400" />}
                    <span>{plan.ctaText}</span>
                    {!isWhatsApp && !isEmail && <ArrowRight className="w-4 h-4" />}
                  </a>
                ) : (
                  <Link
                    href={plan.ctaLink || '/contact'}
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

      {/* Trust Badges */}
      <div className="mt-14 pt-8 border-t border-zinc-900 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-400">
        <span className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" /> Transparent SLA & Invoicing
        </span>
        <span className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" /> Free Trial / Risk-Free Assessment
        </span>
        <span className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" /> Zero Lock-in Contracts
        </span>
      </div>
    </section>
  );
}
