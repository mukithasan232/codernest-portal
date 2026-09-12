import { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BeforeAfterSlider from '@/components/ui/BeforeAfterSlider';
import ServicesGrid from '@/components/services/ServicesGrid';
import PricingPlans from '@/components/services/PricingPlans';
import BeforeAfterGallery from '@/components/services/BeforeAfterGallery';
import {
  getCachedPhotoServices,
  getCachedPricingPlans,
  getCachedBeforeAfterShowcases,
} from '@/lib/cache/cached-queries';

export const metadata: Metadata = {
  title: 'Professional Photo Editing & Clipping Path Services | CoderNest',
  description: 'Clipping Path, Multi-Layer Masking, Ghost Mannequin, and High-End Retouching services starting at $0.20/image for e-commerce and creative studios.',
};

// Incremental Static Regeneration (ISR) - Cache on global Edge CDN for 24h (stale-while-revalidate)
export const revalidate = 86400;

export default async function ImageEditingServicesPage() {
  const [services, pricingPlans, showcases] = await Promise.all([
    getCachedPhotoServices(),
    getCachedPricingPlans(),
    getCachedBeforeAfterShowcases(),
  ]);

  const heroShowcase = showcases[0] || {
    beforeImage: '/uploads/media/1788382703903-412306699-Screenshot2026-09-03at2.58.20AM.png',
    afterImage: '/uploads/media/1788382734277-944822245-Screenshot2026-09-03at2.58.50AM.png',
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30 pt-28 pb-20">
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 sm:gap-16">
          <div className="flex-1 space-y-6 z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs sm:text-sm font-semibold">
              <Sparkles className="w-4 h-4" /> Pixel-Perfect Photo Editing Studio
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Flawless Imagery,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400">
                Delivered in 24 Hours.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0">
              Transform your raw e-commerce catalogs and product photos into high-converting visual assets. 100% hand-drawn Clipping Paths, Ghost Mannequins, and High-End Retouching starting at <strong>$0.20 /image</strong>.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
              <Link
                href="/free-trial"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-extrabold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(6,182,212,0.4)]"
              >
                Test 3 Images Free
              </Link>
              <Link
                href="#pricing"
                className="w-full sm:w-auto px-8 py-4 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-white rounded-xl font-bold transition-all"
              >
                View Plans & Pricing
              </Link>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-6 pt-2 text-xs sm:text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-cyan-400" /> 100% Hand-Drawn</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-cyan-400" /> 24-hr Turnaround</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-cyan-400" /> Bulk Discounts</span>
            </div>
          </div>

          <div className="flex-1 w-full max-w-2xl relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full -z-10" />
            <BeforeAfterSlider
              beforeImage={heroShowcase.beforeImage}
              afterImage={heroShowcase.afterImage}
              className="border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
              priority={true}
            />
          </div>
        </section>

        {/* Dynamic Services Grid */}
        <ServicesGrid services={services} />

        {/* Dynamic Before/After Showcase Slider Gallery */}
        <BeforeAfterGallery showcases={showcases} />

        {/* Dynamic Pricing Plans (ClippingBD Engine) */}
        <div id="pricing">
          <PricingPlans plans={pricingPlans} />
        </div>

        {/* CTA Section */}
        <section className="px-4 sm:px-6 py-20 max-w-5xl mx-auto">
          <div className="bg-zinc-950/80 rounded-[2.5rem] border border-zinc-800/80 p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-600/10 via-blue-600/10 to-transparent pointer-events-none" />
            <h2 className="text-3xl sm:text-5xl font-extrabold relative z-10 mb-4 text-white">
              Ready to scale your product imagery?
            </h2>
            <p className="text-base sm:text-lg text-slate-400 relative z-10 mb-8 max-w-2xl mx-auto">
              Test our craftsmanship with zero commitments. Upload up to 3 sample photos and our Photoshop experts will return pixel-perfect results within 24 hours.
            </p>
            <div className="flex justify-center relative z-10">
              <Link
                href="/free-trial"
                className="flex items-center gap-2 px-8 py-4 bg-white text-zinc-950 hover:bg-slate-200 rounded-xl font-extrabold transition-all hover:scale-105 active:scale-95 shadow-xl"
              >
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
