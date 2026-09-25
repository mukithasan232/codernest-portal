import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { Metadata } from 'next';
import { sanitizeCustomMarkup } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Our Partners & Recommended Tools | CoderNest',
  description: 'Discover the best tools and services recommended by CoderNest.',
};

export const revalidate = 60; // Revalidate every minute

async function getPromotions() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://codernest.agency';
  try {
    const res = await fetch(`${baseUrl}/api/admin/promotions`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch promotions:", error);
    return [];
  }
}

export default async function PartnersPage() {
  const promotions = await getPromotions();

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium border border-orange-500/20">
            <Sparkles className="w-4 h-4" />
            Curated Recommendations
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-outfit tracking-tight">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">Partners & Tools</span>
          </h1>
          <p className="text-gray-400 text-lg">
            A curated list of premium tools, platforms, and services we use and recommend for modern digital businesses.
          </p>
        </div>

        {promotions.length === 0 ? (
          <div className="text-center p-12 border border-gray-800 rounded-2xl bg-gray-900/20">
            <p className="text-gray-400">No active promotions found at the moment. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promo: any) => (
              <div 
                key={promo.id} 
                className="group flex flex-col justify-between bg-[#0f172a] rounded-2xl p-6 border border-gray-800 hover:border-orange-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.15)] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                
                <div className="space-y-4 relative z-10">
                  <div className="inline-block px-3 py-1 bg-gray-800 text-gray-300 text-xs font-semibold rounded-full">
                    {promo.category}
                  </div>
                  <h3 className="text-xl font-bold text-gray-100 group-hover:text-orange-400 transition-colors">
                    {promo.title}
                  </h3>
                </div>

                <div className="mt-8 relative z-10 w-full flex items-center justify-center min-h-[60px]">
                  {sanitizeCustomMarkup(promo.adCodeHtml) ? (
                    <div 
                      className="w-full flex justify-center [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg"
                      dangerouslySetInnerHTML={{ __html: sanitizeCustomMarkup(promo.adCodeHtml) ?? '' }} 
                    />
                  ) : (
                    <a 
                      href={promo.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/5 hover:bg-orange-500 text-white font-medium rounded-xl transition-all duration-300 group-hover:shadow-lg"
                    >
                      Get Started
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
