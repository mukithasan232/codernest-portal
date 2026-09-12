'use client';

import { Twitter, Linkedin, Share2, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ShareButtons({ title }: { title: string }) {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this article: ${title}`,
          url: url,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      // Fallback: Copy to clipboard if Web Share API is not supported (e.g., older desktop browsers)
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button 
        onClick={shareTwitter}
        aria-label="Share on Twitter"
        className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
      >
        <Twitter className="w-4 h-4"/>
      </button>
      
      <button 
        onClick={shareLinkedIn}
        aria-label="Share on LinkedIn"
        className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-[#0A66C2]/10 text-slate-600 hover:text-[#0A66C2] transition-colors"
      >
        <Linkedin className="w-4 h-4"/>
      </button>
      
      <button 
        onClick={handleNativeShare}
        aria-label="Share Article"
        className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors relative"
      >
        {copied ? <Check className="w-4 h-4 text-green-600"/> : <Share2 className="w-4 h-4"/>}
      </button>
    </div>
  );
}
