"use client";

import { useState } from 'react'
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<'web' | 'image'>('web')

  const webPackages = [
    {
      name: "MVP Starter",
      price: "$10k",
      type: "Milestone Based",
      desc: "Perfect for startups needing a robust proof of concept to secure funding.",
      features: ["Next.js App Router", "Supabase Auth & DB", "Stripe Integration", "Basic Admin Dashboard"],
      recommended: false
    },
    {
      name: "Enterprise SaaS",
      price: "$25k+",
      type: "Milestone Based",
      desc: "Full-scale multi-tenant architectures built for scale and security.",
      features: ["Complex Multi-tenancy", "Advanced Role Based Access", "Custom AI Integrations", "High-Availability Setup", "90 Days Support"],
      recommended: true
    }
  ]

  const imagePackages = [
    {
      name: "AI Automated",
      price: "$0.50",
      type: "Per Image",
      desc: "High-volume processing for e-commerce catalogs and marketplaces.",
      features: ["Instant Background Removal", "Color Correction", "Shadow Generation", "API Access"],
      recommended: false
    },
    {
      name: "Pro Retouching",
      price: "$25",
      type: "Per Image",
      desc: "Meticulous human retouching for hero banners and advertising campaigns.",
      features: ["High-end Beauty Retouching", "Complex Compositing", "Creative Direction", "Unlimited Revisions"],
      recommended: true
    }
  ]

  return (
    <main className="relative min-h-screen bg-[#030712] text-slate-50 overflow-hidden pt-28 pb-24">
      {/* Background ambient glows */}
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-[#3B82F6]/10 to-transparent blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 text-center mb-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
        >
          Transparent <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F2FE] to-[#3B82F6]">Pricing</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg text-slate-400"
        >
          No hidden fees, no surprise retainers. Choose your discipline below.
        </motion.p>
      </div>

      {/* Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex justify-center mb-16"
      >
        <div className="bg-white/5 border border-white/10 backdrop-blur-md p-1 rounded-full flex gap-1">
          <button
            onClick={() => setActiveTab('web')}
            className={`px-8 py-3 rounded-full text-sm font-medium transition-all ${
              activeTab === 'web' 
                ? 'bg-gradient-to-r from-[#00F2FE] to-[#3B82F6] text-white shadow-lg' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Web Development
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`px-8 py-3 rounded-full text-sm font-medium transition-all ${
              activeTab === 'image' 
                ? 'bg-gradient-to-r from-[#00F2FE] to-[#3B82F6] text-white shadow-lg' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Image Studio
          </button>
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <div className="max-w-5xl mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {(activeTab === 'web' ? webPackages : imagePackages).map((pkg) => (
              <div 
                key={pkg.name} 
                className={`relative rounded-3xl p-1 transition-all duration-300 ${
                  pkg.recommended 
                    ? 'bg-gradient-to-b from-[#00F2FE] to-[#3B82F6] shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_-10px_rgba(59,130,246,0.5)]' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {pkg.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#00F2FE] to-[#3B82F6] rounded-full text-xs font-bold uppercase tracking-widest text-white flex items-center gap-1 shadow-lg z-10">
                    <Sparkles className="w-3 h-3" /> Recommended
                  </div>
                )}
                
                <div className="h-full bg-[#030712]/95 backdrop-blur-xl rounded-[23px] p-8 md:p-10 flex flex-col">
                  <div className="mb-8 border-b border-white/10 pb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                    <p className="text-slate-400 text-sm h-10">{pkg.desc}</p>
                    <div className="mt-6 flex items-baseline gap-2">
                      <span className="text-5xl font-extrabold">{pkg.price}</span>
                      <span className="text-slate-500 font-medium">{pkg.type}</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-4 mb-10 flex-grow">
                    {pkg.features.map(feature => (
                      <li key={feature} className="flex items-start gap-3 text-slate-300">
                        <CheckCircle2 className={`w-5 h-5 shrink-0 ${pkg.recommended ? 'text-[#00F2FE]' : 'text-slate-500'}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/contact" className="mt-auto">
                    <button className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      pkg.recommended
                        ? 'bg-gradient-to-r from-[#00F2FE] to-[#3B82F6] text-white hover:scale-[1.02]'
                        : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                    }`}>
                      Get Started <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  )
}
