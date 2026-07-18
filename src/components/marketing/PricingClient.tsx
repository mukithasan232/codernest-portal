"use client";

import { useState } from 'react'
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import PricingCard from './PricingCard';


export default function PricingClient({ pricingData }: { pricingData: any[] }) {
  const [activeTab, setActiveTab] = useState<'web' | 'image'>('web')

  const webPackages = pricingData.filter(p => p.sector === 'web' || p.sector === 'Web');
  const imagePackages = pricingData.filter(p => p.sector === 'image' || p.sector === 'Image');

  // Fallbacks if DB is empty
  const defaultWeb = [
    {
      name: "MVP Starter",
      price: "$10k",
      tier: "Milestone Based",
      priceLabel: "Perfect for startups needing a robust proof of concept to secure funding.",
      features: ["Next.js App Router", "Supabase Auth & DB", "Stripe Integration", "Basic Admin Dashboard"],
      isPopular: false,
      ctaLabel: "Get Started"
    },
    {
      name: "Enterprise SaaS",
      price: "$25k+",
      tier: "Milestone Based",
      priceLabel: "Full-scale multi-tenant architectures built for scale and security.",
      features: ["Complex Multi-tenancy", "Advanced Role Based Access", "Custom AI Integrations", "High-Availability Setup", "90 Days Support"],
      isPopular: true,
      ctaLabel: "Get Started"
    }
  ];

  const defaultImage = [
    {
      name: "AI Automated",
      price: "$0.50",
      tier: "Per Image",
      priceLabel: "High-volume processing for e-commerce catalogs and marketplaces.",
      features: ["Instant Background Removal", "Color Correction", "Shadow Generation", "API Access"],
      isPopular: false,
      ctaLabel: "Get Started"
    },
    {
      name: "Pro Retouching",
      price: "$25",
      tier: "Per Image",
      priceLabel: "Meticulous human retouching for hero banners and advertising campaigns.",
      features: ["High-end Beauty Retouching", "Complex Compositing", "Creative Direction", "Unlimited Revisions"],
      isPopular: true,
      ctaLabel: "Get Started"
    }
  ];

  const currentWeb = webPackages.length > 0 ? webPackages : defaultWeb;
  const currentImage = imagePackages.length > 0 ? imagePackages : defaultImage;

  return (
    <>
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
            {(activeTab === 'web' ? currentWeb : currentImage).map((pkg, index) => (
              <PricingCard key={pkg.id || pkg.name} pkg={pkg} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  )
}
