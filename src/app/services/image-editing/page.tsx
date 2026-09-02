import { Metadata } from 'next';
import Link from 'next/link';
import { Camera, Scissors, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import BeforeAfterSlider from '@/components/ui/BeforeAfterSlider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'High-End Image Processing & Editing Services | CoderNest',
  description: 'Professional Clipping Path, Ghost Mannequin, and High-End Retouching services for ecommerce and brands.',
};

export default function ImageEditingServicesPage() {
  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 pt-32">
        {/* Hero Section */}
        <section className="relative px-6 py-20 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
              <Sparkles className="w-4 h-4" /> Pixel-Perfect Editing Studio
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight">
              Flawless Imagery,<br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Delivered Fast.</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0">
              Transform your raw product photos into high-converting masterpieces. Specializing in Clipping Path, Ghost Mannequin, and High-End Retouching for global brands.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
              <Link href="/free-trial" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                Try 3 Images Free
              </Link>
              <Link href="/pricing/image-editing" className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold transition-all">
                View Volume Pricing
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-2xl relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full -z-10" />
            <BeforeAfterSlider 
              beforeImage="/dummy-laptop.png" 
              afterImage="/dummy-laptop.png"
              className="border border-white/10 shadow-2xl"
            />
          </div>
        </section>

        {/* Services Showcase */}
        <section className="px-6 py-24 max-w-7xl mx-auto space-y-32">
          
          {/* 1. Clipping Path */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 w-full order-2 lg:order-1">
              <BeforeAfterSlider 
                beforeImage="/dummy-laptop.png" 
                afterImage="/dummy-laptop.png"
                className="border border-white/10 shadow-2xl rounded-3xl"
              />
            </div>
            <div className="flex-1 space-y-6 order-1 lg:order-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                <Scissors className="w-8 h-8" />
              </div>
              <h2 className="text-4xl font-bold">Clipping Path & Cutouts</h2>
              <p className="text-slate-400 text-lg">Hand-drawn, pixel-perfect paths using the Pen Tool in Photoshop. No automated magic wands—just precision.</p>
              <ul className="space-y-3 text-slate-300">
                {['100% Hand-Drawn Paths', 'Multiple Path & Color Masking', 'Drop Shadow & Reflection Creation'].map(i => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" /> {i}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 2. Ghost Mannequin */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                <Camera className="w-8 h-8" />
              </div>
              <h2 className="text-4xl font-bold">Ghost Mannequin (Neck Joint)</h2>
              <p className="text-slate-400 text-lg">Give your apparel a 3D, hollow look. We seamlessly stitch the front and inner neck parts to create a premium store-ready display.</p>
              <ul className="space-y-3 text-slate-300">
                {['Symmetrical Shaping', 'Wrinkle & Crease Removal', 'Color Correction matching'].map(i => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-400" /> {i}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full">
              <BeforeAfterSlider 
                beforeImage="/dummy-laptop.png" 
                afterImage="/dummy-laptop.png"
                className="border border-white/10 shadow-2xl rounded-3xl"
              />
            </div>
          </div>

          {/* 3. High-End Retouching */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 w-full order-2 lg:order-1">
              <BeforeAfterSlider 
                beforeImage="/dummy-laptop.png" 
                afterImage="/dummy-laptop.png"
                className="border border-white/10 shadow-2xl rounded-3xl"
              />
            </div>
            <div className="flex-1 space-y-6 order-1 lg:order-2">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-4xl font-bold">High-End Retouching</h2>
              <p className="text-slate-400 text-lg">Jewelry, Beauty, and Product retouching that elevates your brand. We remove dust, scratches, and imperfections while preserving natural textures.</p>
              <ul className="space-y-3 text-slate-300">
                {['Frequency Separation', 'Jewelry Sparkle Enhancement', 'Model Skin Retouching'].map(i => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-rose-400" /> {i}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </section>

        {/* CTA Section */}
        <section className="px-6 py-24 max-w-5xl mx-auto">
          <div className="glass rounded-[3rem] border border-white/10 p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 to-transparent" />
            <h2 className="text-4xl font-bold relative z-10 mb-6">Ready to scale your product imagery?</h2>
            <p className="text-lg text-slate-400 relative z-10 mb-8 max-w-2xl mx-auto">
              Test our quality before committing. Upload up to 3 images and our experts will process them for free within 24 hours.
            </p>
            <div className="flex justify-center relative z-10">
              <Link href="/free-trial" className="flex items-center gap-2 px-8 py-4 bg-white text-black hover:bg-slate-200 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl">
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
