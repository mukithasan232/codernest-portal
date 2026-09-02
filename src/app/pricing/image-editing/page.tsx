"use client";

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Scissors, Camera, Sparkles, Image as ImageIcon, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type ServiceType = 'clipping' | 'ghost' | 'retouching';

const SERVICES = {
  clipping: {
    name: 'Clipping Path',
    icon: Scissors,
    desc: 'Hand-drawn, precise product cutouts.',
    basePrice: 0.50, // 1-99
    tiers: [
      { min: 1, price: 0.50 },
      { min: 100, price: 0.45 },
      { min: 500, price: 0.39 },
      { min: 1000, price: 0.35 },
    ]
  },
  ghost: {
    name: 'Ghost Mannequin',
    icon: Camera,
    desc: '3D hollow look for apparel.',
    basePrice: 1.50,
    tiers: [
      { min: 1, price: 1.50 },
      { min: 100, price: 1.35 },
      { min: 500, price: 1.20 },
      { min: 1000, price: 0.99 },
    ]
  },
  retouching: {
    name: 'High-End Retouching',
    icon: Sparkles,
    desc: 'Flawless product and model touch-ups.',
    basePrice: 3.00,
    tiers: [
      { min: 1, price: 3.00 },
      { min: 100, price: 2.75 },
      { min: 500, price: 2.50 },
      { min: 1000, price: 2.25 },
    ]
  }
};

export default function ImagePricingPage() {
  const [service, setService] = useState<ServiceType>('clipping');
  const [volume, setVolume] = useState<number>(100);

  // Calculate pricing based on current volume and selected service tiers
  const currentService = SERVICES[service];
  const activeTier = [...currentService.tiers].reverse().find(t => volume >= t.min) || currentService.tiers[0];
  const pricePerImage = activeTier.price;
  const totalCost = volume * pricePerImage;

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-[#050505] text-white pt-32 pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Volume <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Pricing</span></h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Get an instant estimate for your bulk image editing needs. The more you process, the more you save.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Calculator Controls */}
            <div className="flex-1 w-full space-y-10 bg-white/5 border border-white/10 rounded-3xl p-8">
              
              {/* Service Selection */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold">1. Select Service</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(Object.keys(SERVICES) as ServiceType[]).map((key) => {
                    const svc = SERVICES[key];
                    const Icon = svc.icon;
                    const isActive = service === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setService(key)}
                        className={`text-left p-4 rounded-2xl border transition-all ${isActive ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-black/20 border-white/10 hover:bg-white/5 hover:border-white/20'}`}
                      >
                        <Icon className={`w-6 h-6 mb-3 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                        <div className={`font-bold ${isActive ? 'text-blue-400' : 'text-slate-200'}`}>{svc.name}</div>
                        <div className="text-xs text-slate-500 mt-1">{svc.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Volume Slider */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">2. Number of Images</h3>
                  <div className="px-4 py-1.5 bg-white/10 rounded-full font-mono text-blue-400 font-bold">
                    {volume.toLocaleString()} Images
                  </div>
                </div>
                
                <input 
                  type="range"
                  min="1"
                  max="10000"
                  step="1"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                
                <div className="flex justify-between text-xs text-slate-500 font-mono">
                  <span>1</span>
                  <span>10,000+</span>
                </div>
              </div>

            </div>

            {/* Sticky Summary Card */}
            <div className="w-full lg:w-96 sticky top-32">
              <div className="glass bg-slate-900/80 rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-600/30 blur-[60px] rounded-full" />
                
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Estimated Cost</h3>
                
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-5xl font-extrabold text-white">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className="text-slate-400 mb-1 text-sm font-medium">USD</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium mb-8">
                  <ImageIcon className="w-4 h-4" />
                  ${pricePerImage.toFixed(2)} per image
                </div>
                
                <div className="space-y-3 mb-8 border-t border-white/10 pt-6">
                  {currentService.tiers.map((tier, idx) => {
                    const isTierActive = activeTier.min === tier.min;
                    return (
                      <div key={idx} className={`flex justify-between text-sm ${isTierActive ? 'text-white font-bold' : 'text-slate-500'}`}>
                        <span>{tier.min}{idx === currentService.tiers.length - 1 ? '+' : ` - ${currentService.tiers[idx+1].min - 1}`} imgs</span>
                        <span>${tier.price.toFixed(2)} /ea</span>
                      </div>
                    );
                  })}
                </div>

                <Link href="/free-trial" className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-center text-xs text-slate-500 mt-4">
                  Have a custom requirement? <Link href="/contact" className="text-blue-400 hover:underline">Contact Sales</Link>
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
