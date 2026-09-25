"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { sanitizeCustomMarkup } from "@/lib/utils";

interface BrandPromotion {
  id: string;
  title: string;
  slug: string;
  category: string;
  adCodeHtml?: string;
  isActive: boolean;
}

export function PromotionAd() {
  const [promo, setPromo] = useState<BrandPromotion | null>(null);

  useEffect(() => {
    // Fetch a random active promotion
    const fetchPromo = async () => {
      try {
        const res = await fetch("/api/admin/promotions");
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          // Get active promotions only
          const activePromos = data.data.filter((p: BrandPromotion) => p.isActive);
          if (activePromos.length > 0) {
            // Pick a random promotion
            const randomPromo = activePromos[Math.floor(Math.random() * activePromos.length)];
            setPromo(randomPromo);
          }
        }
      } catch (error) {
        console.error("Failed to load promotions:", error);
      }
    };
    fetchPromo();
  }, []);

  if (!promo) return null;

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm relative group">
      <div className="absolute top-2 right-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded uppercase tracking-wider">
        Sponsored
      </div>
      
      {sanitizeCustomMarkup(promo.adCodeHtml) ? (
        <div 
          className="w-full flex items-center justify-center p-4 min-h-[250px]"
          dangerouslySetInnerHTML={{ __html: sanitizeCustomMarkup(promo.adCodeHtml) ?? '' }}
        />
      ) : (
        <Link 
          href={`/api/r/${promo.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-8 min-h-[250px] text-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
            <ExternalLink className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {promo.title}
            </h3>
            <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-full">
              {promo.category}
            </span>
          </div>
          <div className="mt-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
            Check it out &rarr;
          </div>
        </Link>
      )}
    </div>
  );
}
