'use client';
import { useState, useEffect } from 'react';
import { Loader2, Plus, ExternalLink, Code } from 'lucide-react';
import toast from 'react-hot-toast';

interface BrandPromotion {
  id: string;
  title: string;
  targetUrl?: string;
  trackingUrl?: string;
  slug: string;
  category: string;
  adCodeHtml?: string;
  clicks: number;
  isActive: boolean;
}

export default function BrandPromotionManager() {
  const [title, setTitle] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [category, setCategory] = useState('Recommended');
  const [adCodeHtml, setAdCodeHtml] = useState('');
  const [inputType, setInputType] = useState<'link' | 'html'>('link');
  
  const [promotions, setPromotions] = useState<BrandPromotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchPromos = async () => {
    try {
      const res = await fetch('/api/admin/promotions');
      const data = await res.json();
      if (data.success) {
        setPromotions(data.data);
      } else {
        toast.error("Failed to load promotions");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong loading promotions");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputType === 'link' && !targetUrl) {
      toast.error("Target URL is required");
      return;
    }
    if (inputType === 'html' && !adCodeHtml) {
      toast.error("Ad Code HTML is required");
      return;
    }
    
    setLoading(true);
    try {
      const payload = { 
        title, 
        category,
        targetUrl: inputType === 'link' ? targetUrl : undefined,
        adCodeHtml: inputType === 'html' ? adCodeHtml : undefined
      };

      const res = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success("Promotion created successfully!");
        setTitle('');
        setTargetUrl('');
        setAdCodeHtml('');
        setCategory('Recommended');
        fetchPromos();
      } else {
        toast.error(data.message || data.error || "Failed to create promotion");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#0f172a] text-white rounded-xl border border-gray-800 space-y-6 shadow-xl">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-orange-500" />
          Brand Promotion & Link Injector
        </h2>
        <p className="text-sm text-gray-400 mt-1">Input any brand link or raw HTML Ad Code to generate tracked promotional redirects.</p>
      </div>

      <div className="flex gap-2 p-1 bg-gray-900 rounded-lg w-fit">
        <button 
          onClick={() => setInputType('link')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${inputType === 'link' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
          type="button"
        >
          Standard Link
        </button>
        <button 
          onClick={() => setInputType('html')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${inputType === 'html' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
          type="button"
        >
          HTML Ad Code
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" 
            placeholder="Brand Title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="bg-gray-900 border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg p-2.5 text-sm text-white outline-none transition-all"
            required 
          />
          <input 
            type="text" 
            placeholder="Category (e.g. Hosting)" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="bg-gray-900 border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg p-2.5 text-sm text-white outline-none transition-all"
            required 
          />
        </div>

        {inputType === 'link' ? (
          <input 
            type="url" 
            placeholder="Target URL (e.g. https://...)" 
            value={targetUrl} 
            onChange={(e) => setTargetUrl(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg p-2.5 text-sm text-white outline-none transition-all"
            required 
          />
        ) : (
          <textarea
            placeholder="Paste your raw HTML Ad Code here..."
            value={adCodeHtml}
            onChange={(e) => setAdCodeHtml(e.target.value)}
            rows={4}
            className="w-full bg-gray-900 border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg p-2.5 text-sm text-white outline-none transition-all font-mono"
            required
          />
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg px-6 py-2.5 text-sm transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {loading ? 'Saving...' : 'Create Promo Link'}
        </button>
      </form>

      <div className="overflow-x-auto border border-gray-800 rounded-lg">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
            <tr>
              <th className="p-4 font-medium">Title & Category</th>
              <th className="p-4 font-medium">Tracking Route / Type</th>
              <th className="p-4 font-medium text-center">Clicks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-900/30">
            {fetching ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading promotions...
                </td>
              </tr>
            ) : promotions.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">
                  No promotional links found. Create one above.
                </td>
              </tr>
            ) : (
              promotions.map((promo) => (
                <tr key={promo.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-white">{promo.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{promo.category}</div>
                  </td>
                  <td className="p-4">
                    {promo.trackingUrl ? (
                      <>
                        <div className="text-orange-400 underline truncate max-w-[250px]" title={promo.trackingUrl}>
                          <a href={promo.trackingUrl} target="_blank" rel="noopener noreferrer" className="hover:text-orange-300 transition-colors">
                            /api/r/{promo.slug}
                          </a>
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[250px] mt-1" title={promo.targetUrl}>
                          &rarr; {promo.targetUrl}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5 text-indigo-400">
                        <Code className="w-4 h-4" />
                        <span className="text-xs font-medium">HTML Banner (Direct Embed)</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-bold text-center text-gray-300">
                    <span className="bg-gray-800 px-2 py-1 rounded-md text-xs">{promo.clicks}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
