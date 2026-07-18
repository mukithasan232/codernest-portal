'use client';

import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Tilt from 'react-parallax-tilt';

export default function PricingCard({ pkg, index = 0 }: { pkg: any, index?: number }) {
  const cardContent = (
    <div 
      className={`relative rounded-3xl p-1 transition-all duration-300 h-full ${
        pkg.isPopular 
          ? 'bg-gradient-to-b from-[#00F2FE] to-[#3B82F6] shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_-10px_rgba(59,130,246,0.5)]' 
          : 'bg-white/10 hover:bg-white/20'
      }`}
    >
      {pkg.isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#00F2FE] to-[#3B82F6] rounded-full text-xs font-bold uppercase tracking-widest text-white flex items-center gap-1 shadow-lg z-10">
          <Sparkles className="w-3 h-3" /> Recommended
        </div>
      )}
      
      {/* Animated Conic Gradient for Popular Plan */}
      {pkg.isPopular && (
        <div className="absolute inset-0 -z-10 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute -inset-[100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#00F2FE_0%,#3B82F6_50%,#00F2FE_100%)] opacity-20" />
        </div>
      )}

      {pkg.customHtml ? (
        <div 
          className="h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[23px] overflow-hidden"
          dangerouslySetInnerHTML={{ __html: pkg.customHtml }}
        />
      ) : (
        <div className="h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[23px] p-8 md:p-10 flex flex-col relative z-0">
          <div className="mb-8 border-b border-slate-200 dark:border-white/10 pb-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{pkg.name}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm h-10">{pkg.priceLabel}</p>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-slate-900 dark:text-white">{pkg.price}</span>
              <span className="text-slate-500 font-medium">{pkg.tier}</span>
            </div>
          </div>
          
          <ul className="space-y-4 mb-10 flex-grow">
            {(pkg.features || []).map((feature: string) => (
              <li key={feature} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className={`w-5 h-5 shrink-0 ${pkg.isPopular ? 'text-blue-500' : 'text-slate-400'}`} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Link href="/contact" className="mt-auto">
            <button className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              pkg.isPopular
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-[1.02]'
                : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10'
            }`}>
              {pkg.ctaLabel || 'Get Started'} <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full"
    >
      <Tilt
        glareEnable={true}
        glareMaxOpacity={0.15}
        glareColor="#ffffff"
        glarePosition="all"
        tiltMaxAngleX={5}
        tiltMaxAngleY={5}
        scale={1.02}
        transitionSpeed={2500}
        className="h-full"
      >
        {cardContent}
      </Tilt>
    </motion.div>
  );
}
