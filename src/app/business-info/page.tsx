import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Globe, Search, Phone, ChevronRight, CheckCircle, Github, Linkedin, Facebook } from 'lucide-react';
import ShareButton from './ShareButton';

export const metadata = {
  title: 'CoderNest Business Profile | B2B Software Agency',
  description: 'Verified Enterprise SaaS Provider - Active since 2024. View our contact information, social links, and portfolio.',
};

export default function BusinessInfoPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white selection:bg-cyan-500/30 flex justify-center p-4">
      <div className="w-full max-w-md mx-auto pt-8 pb-12 flex flex-col gap-8">
        
        {/* Header Profile Section */}
        <div className="flex flex-col items-center text-center gap-4 animate-fade-in-up">
          <div className="relative w-28 h-28 rounded-full border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] flex items-center justify-center bg-slate-900/50 overflow-hidden">
            {/* You can replace this with an actual <Image src="/logo.png" /> */}
            <div className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">CN</div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">CoderNest</h1>
            <p className="text-cyan-400/80 text-sm font-medium mt-1">Enterprise B2B Software Agency</p>
          </div>
        </div>

        {/* Quick Action Buttons Row */}
        <div className="grid grid-cols-3 gap-3 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <a href="tel:+8801968869151" className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:border-cyan-500/30 transition-all duration-200 hover:scale-[1.02] cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-300">Call</span>
          </a>
          <ShareButton />
          <Link href="/services" className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:border-purple-500/30 transition-all duration-200 hover:scale-[1.02] cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-300">Search</span>
          </Link>
        </div>

        {/* Business Info Cards */}
        <div className="flex flex-col gap-3 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Verified Business</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Verified Enterprise SaaS Provider - Active since 2024. Delivering high-performance scalable software solutions globally.
            </p>
          </div>

          <a href="mailto:contact@codernest.cloud" className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:border-cyan-500/40 hover:bg-slate-800/60 transition-all duration-200 flex items-center justify-between group cursor-pointer hover:scale-[1.01]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-700/50 text-slate-300 flex items-center justify-center group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-medium">Email Us</span>
                <span className="text-sm font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">contact@codernest.cloud</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </a>

          <a href="https://codernest.cloud" target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:border-blue-500/40 hover:bg-slate-800/60 transition-all duration-200 flex items-center justify-between group cursor-pointer hover:scale-[1.01]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-700/50 text-slate-300 flex items-center justify-center group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors">
                <Globe className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-medium">Official Website</span>
                <span className="text-sm font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">codernest.cloud</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
          </a>

          <Link href="/portfolio" className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:border-purple-500/40 hover:bg-slate-800/60 transition-all duration-200 flex items-center justify-between group cursor-pointer hover:scale-[1.01]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-700/50 text-slate-300 flex items-center justify-center group-hover:bg-purple-500/10 group-hover:text-purple-400 transition-colors">
                <Globe className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-medium">Media & Docs</span>
                <span className="text-sm font-semibold text-slate-100 group-hover:text-purple-400 transition-colors">View Case Studies</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
          </Link>

          {/* Social Links Row */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            <a href="https://linkedin.com/company/codernest" target="_blank" rel="noopener noreferrer" className="py-3 px-2 rounded-xl bg-[#0077b5]/10 border border-[#0077b5]/20 hover:bg-[#0077b5]/20 transition-all duration-200 flex flex-col items-center gap-1">
              <Linkedin className="w-5 h-5 text-[#0077b5]" />
              <span className="text-[10px] font-semibold text-slate-300">LinkedIn</span>
            </a>
            <a href="https://facebook.com/codernest" target="_blank" rel="noopener noreferrer" className="py-3 px-2 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/20 hover:bg-[#1877F2]/20 transition-all duration-200 flex flex-col items-center gap-1">
              <Facebook className="w-5 h-5 text-[#1877F2]" />
              <span className="text-[10px] font-semibold text-slate-300">Facebook</span>
            </a>
            <a href="https://github.com/codernest" target="_blank" rel="noopener noreferrer" className="py-3 px-2 rounded-xl bg-slate-700/30 border border-slate-600 hover:bg-slate-700/50 transition-all duration-200 flex flex-col items-center gap-1">
              <Github className="w-5 h-5 text-slate-300" />
              <span className="text-[10px] font-semibold text-slate-300">GitHub</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
