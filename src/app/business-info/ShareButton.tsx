'use client';

import React from 'react';
import { Share2 } from 'lucide-react';

export default function ShareButton() {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'CoderNest', url: 'https://codernest.cloud/business-info' });
    } else {
      navigator.clipboard.writeText('https://codernest.cloud/business-info');
      alert('Link copied!');
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:border-blue-500/30 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
    >
      <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center">
        <Share2 className="w-5 h-5" />
      </div>
      <span className="text-xs font-semibold text-slate-300">Share</span>
    </button>
  );
}
