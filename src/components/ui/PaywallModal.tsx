'use client';

/**
 * Paywall Modal — triggered when free credits are exhausted.
 * Presents Tier A (AI Auto) and Tier B (Human Pro) paid options.
 */

import { X, Zap, UserCheck, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditsUsed: number;
  maxCredits: number;
}

const PLANS = [
  {
    id: 'tier-a',
    icon: Zap,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/20',
    label: 'Tier A — AI Automated',
    price: '$2',
    priceLabel: '/ image',
    description: 'Lightning-fast AI processing. Results in under 60 seconds. Perfect for bulk work.',
    features: ['Instant AI processing', 'Background removal', 'Auto color correction', 'Download in 3 formats'],
    cta: 'Get AI Credits',
    href: '/pricing?tier=automated',
    badge: null,
    cardClass: 'border-white/10',
  },
  {
    id: 'tier-b',
    icon: UserCheck,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/20',
    label: 'Tier B — Human Pro',
    price: '$15',
    priceLabel: '/ image',
    description: 'Expert human editors. Pixel-perfect results within 24 hours. Studio-grade quality.',
    features: ['Human expert editing', 'Custom retouching', 'Priority support', 'Revisions included'],
    cta: 'Order Human Edit',
    href: '/pricing?tier=human',
    badge: 'Best Quality',
    cardClass: 'border-purple-500/50 ring-1 ring-purple-500/30',
  },
];

export default function PaywallModal({ isOpen, onClose, creditsUsed, maxCredits }: PaywallModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl glass rounded-3xl border border-white/10 p-8 space-y-8 shadow-2xl z-10">
        {/* Close */}
        <button
          id="paywall-close-btn"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-500 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center mx-auto">
            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            You&apos;ve used all {maxCredits} free credits
          </h2>
          <p className="text-slate-400">
            You&apos;ve processed {creditsUsed}/{maxCredits} free images. Upgrade to continue with premium quality.
          </p>
          {/* Credit bar */}
          <div className="w-48 mx-auto">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-red-500 rounded-full"
                style={{ width: `${(creditsUsed / maxCredits) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">{creditsUsed} / {maxCredits} credits used</p>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PLANS.map(plan => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative glass rounded-2xl border p-6 space-y-4 transition-all hover:scale-[1.01] ${plan.cardClass}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-bold tracking-wide">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl ${plan.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${plan.iconColor}`} />
                </div>

                <div>
                  <h3 className="font-bold text-white text-sm">{plan.label}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-slate-400 text-sm">{plan.priceLabel}</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-1.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  id={`paywall-cta-${plan.id}`}
                  href={plan.href}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all"
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-500">
          No subscription required · Pay per image · Secure checkout via Stripe
        </p>
      </div>
    </div>
  );
}
