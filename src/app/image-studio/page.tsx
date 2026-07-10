import Link from 'next/link';
import { TrustBadgeRow } from '@/components/ui/TrustBadge';
import {
  Zap, UserCheck, Shield, ArrowRight, Star,
  Image as ImageIcon, Clock, Download
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Studio | CoderNest — AI + Human Image Processing',
  description: 'Professional image processing: AI-automated (Tier A) and human expert editing (Tier B). Background removal, retouching, color grading.',
};

const FEATURES = [
  { icon: Zap,       title: 'AI Automated (Tier A)', desc: 'Lightning-fast results in under 60 seconds.', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { icon: UserCheck, title: 'Human Pro (Tier B)',    desc: 'Expert editors. Pixel-perfect within 24h.',  color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { icon: Shield,    title: 'Secure & Private',      desc: 'Your images are encrypted and never shared.', color: 'text-green-400', bg: 'bg-green-400/10' },
  { icon: Download,  title: 'Multiple Formats',      desc: 'Download PNG, JPG, WEBP at any resolution.',  color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
];

const SERVICES = [
  { label: 'Background Removal',   emoji: '✂️' },
  { label: 'Color Grading',        emoji: '🎨' },
  { label: 'Portrait Retouching',  emoji: '👤' },
  { label: 'Product Photo Edit',   emoji: '📦' },
  { label: 'Batch Processing',     emoji: '🗂️' },
  { label: 'Custom AI Filters',    emoji: '🤖' },
];

export default function ImageStudioPage() {
  return (
    <div className="min-h-screen bg-surface-950">
      {/* Hero */}
      <section className="pt-24 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-purple-600/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-4xl text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-semibold">
            🎨 Creative Image Studio
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white">
            Studio-Grade{' '}
            <span className="gradient-text">Image Processing</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Choose AI-automated speed or human expert precision.
            5 free credits on signup — no card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/image-studio/upload"
              id="studio-hero-cta"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-lg rounded-2xl flex items-center gap-2 transition-all shadow-xl"
            >
              <ImageIcon className="w-5 h-5" />
              Start Processing — Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/pricing" className="px-8 py-4 border border-white/10 hover:bg-white/5 text-white font-semibold rounded-2xl transition-all">
              View Pricing
            </Link>
          </div>

          <div className="pt-2 flex justify-center">
            <TrustBadgeRow
              upworkUrl="https://upwork.com"
              fiverrUrl="https://fiverr.com"
              githubUrl="https://github.com"
            />
          </div>
        </div>
      </section>

      {/* Free credits callout */}
      <section className="px-4 py-4">
        <div className="container mx-auto max-w-2xl">
          <div className="glass rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 flex items-center gap-4">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-8 h-8 rounded-lg bg-blue-500/30 border border-blue-500/40 flex items-center justify-center text-blue-300 text-xs font-bold">
                  {i}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-300">
              <span className="font-bold text-white">5 free image credits</span> for every new account.
              No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-white">Two Tiers, One Studio</h2>
            <p className="text-slate-400 mt-3">Choose speed or perfection — or use both.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="glass rounded-2xl border border-white/10 p-5 space-y-3">
                  <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <h3 className="font-bold text-white text-sm">{f.title}</h3>
                  <p className="text-slate-400 text-xs">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-extrabold text-white text-center mb-10">Tier A vs Tier B</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Tier A */}
            <div className="glass rounded-3xl border border-blue-500/30 p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Tier A</h3>
                  <p className="text-blue-400 text-sm font-semibold">AI Automated</p>
                </div>
              </div>
              <div className="space-y-2">
                {['Results in &lt;60 seconds', 'AI background removal', 'Auto color correction', '$2 per image after trial'].map(f => (
                  <p key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="text-blue-400">✓</span>
                    <span dangerouslySetInnerHTML={{ __html: f }} />
                  </p>
                ))}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">$2</span>
                <span className="text-slate-400">/ image</span>
              </div>
              <Link href="/image-studio/upload?tier=A" className="block text-center py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all">
                Try Free Now
              </Link>
            </div>

            {/* Tier B */}
            <div className="glass rounded-3xl border border-purple-500/40 ring-1 ring-purple-500/20 p-8 space-y-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-bold">
                  <Star className="w-3 h-3 fill-white" /> Best Quality
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Tier B</h3>
                  <p className="text-purple-400 text-sm font-semibold">Human Pro Edit</p>
                </div>
              </div>
              <div className="space-y-2">
                {['Expert human editors', 'Custom retouching instructions', 'Results within 24 hours', 'Revisions included'].map(f => (
                  <p key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="text-purple-400">✓</span> {f}
                  </p>
                ))}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">$15</span>
                <span className="text-slate-400">/ image</span>
              </div>
              <Link href="/image-studio/upload?tier=B" className="block text-center py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all">
                Order Expert Edit
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-3xl font-extrabold text-white">What We Process</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {SERVICES.map(s => (
              <div key={s.label} className="glass rounded-2xl border border-white/10 p-5 flex items-center gap-3 hover:border-purple-400/30 transition-all">
                <span className="text-2xl">{s.emoji}</span>
                <span className="text-sm font-semibold text-white">{s.label}</span>
              </div>
            ))}
          </div>
          <Link
            href="/image-studio/upload"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl transition-all hover:opacity-90"
          >
            <Clock className="w-5 h-5" /> Upload Your First Image — Free
          </Link>
        </div>
      </section>
    </div>
  );
}
