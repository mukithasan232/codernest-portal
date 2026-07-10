'use client';

/**
 * Image Studio Upload Page
 * - Shows free credit counter from Firestore
 * - Drag-and-drop upload (Firebase Storage)
 * - Tier A (AI Auto) vs Tier B (Human Pro) selection
 * - Paywall triggered when credits exhausted
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FREE_IMAGE_CREDIT_LIMIT } from '@/types';
import ImageUploader from '@/components/ui/ImageUploader';
import PaywallModal from '@/components/ui/PaywallModal';
import {
  Zap, UserCheck, ArrowRight, Loader2, CheckCircle,
  AlertTriangle, CreditCard, Info
} from 'lucide-react';
import toast from 'react-hot-toast';

type Tier = 'A-automated' | 'B-human';

interface ProcessResult {
  processedUrl?: string;
  orderId?: string;
  message: string;
  isManual: boolean;
}

export default function UploadPage() {
  const { appUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<Tier>('A-automated');
  const [instructions, setInstructions] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [creditsUsed, setCreditsUsed] = useState(0);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !appUser) {
      router.push('/auth/login?redirectTo=/image-studio/upload');
    }
  }, [appUser, authLoading, router]);

  // Load credits from Supabase
  useEffect(() => {
    if (!appUser) return;
    const fetchCredits = async () => {
      const { data } = await supabase.from('users').select('freeCreditsUsed').eq('id', appUser.id).single();
      if (data) {
        setCreditsUsed(data.freeCreditsUsed ?? 0);
      }
    };
    fetchCredits();
  }, [appUser, supabase]);

  const isFreeCreditsExhausted = creditsUsed >= FREE_IMAGE_CREDIT_LIMIT;
  const freeCreditsLeft = Math.max(0, FREE_IMAGE_CREDIT_LIMIT - creditsUsed);

  const handleUploadComplete = (url: string, name: string) => {
    setUploadedUrl(url);
    setUploadedFileName(name);
    setResult(null);
  };

  async function handleProcess() {
    if (!uploadedUrl || !appUser) return;

    // Check free credit limit for non-paying users (simplified — real app checks payment status)
    if (isFreeCreditsExhausted) {
      setShowPaywall(true);
      return;
    }

    setProcessing(true);
    try {
      const endpoint = selectedTier === 'A-automated'
        ? '/api/image/process-auto'
        : '/api/image/request-manual';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: uploadedUrl,
          fileName: uploadedFileName,
          userId: appUser.id,
          instructions,
          tier: selectedTier,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Processing failed');

      // Increment free credits in Supabase
      const newCredits = creditsUsed + 1;
      await supabase.from('users').update({ freeCreditsUsed: newCredits }).eq('id', appUser.id);
      setCreditsUsed(newCredits);

      setResult({
        processedUrl: data.processedUrl,
        orderId: data.orderId,
        message: data.message,
        isManual: selectedTier === 'B-human',
      });

      toast.success(selectedTier === 'A-automated' ? 'Image processed!' : 'Order submitted to our team!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setProcessing(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 py-16 px-4">
      <div className="container mx-auto max-w-3xl space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold text-white">Image Processing Studio</h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Upload your image, choose AI automation or human expert editing, and get studio-grade results.
          </p>
        </div>

        {/* Free Credits Banner */}
        <div className={`glass rounded-2xl border p-4 flex items-center justify-between gap-4 ${isFreeCreditsExhausted ? 'border-red-500/40 bg-red-500/5' : 'border-blue-500/30 bg-blue-500/5'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isFreeCreditsExhausted ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
              {isFreeCreditsExhausted
                ? <AlertTriangle className="w-5 h-5 text-red-400" />
                : <Info className="w-5 h-5 text-blue-400" />
              }
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {isFreeCreditsExhausted ? 'Free credits exhausted' : `${freeCreditsLeft} free credit${freeCreditsLeft !== 1 ? 's' : ''} remaining`}
              </p>
              <p className="text-xs text-slate-400">
                {isFreeCreditsExhausted ? 'Upgrade to continue processing images.' : `You've used ${creditsUsed} of ${FREE_IMAGE_CREDIT_LIMIT} free trial images.`}
              </p>
            </div>
          </div>
          {/* Credit dots */}
          <div className="hidden sm:flex items-center gap-1.5">
            {Array.from({ length: FREE_IMAGE_CREDIT_LIMIT }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${i < creditsUsed ? 'bg-blue-500' : 'bg-white/10'}`}
              />
            ))}
          </div>
        </div>

        {/* Upload */}
        <div className="glass rounded-3xl border border-white/10 p-8 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
            Upload Your Image
          </h2>
          <ImageUploader
            userId={appUser?.id ?? ''}
            onUploadComplete={handleUploadComplete}
            disabled={!appUser}
          />
        </div>

        {/* Tier Selection */}
        <div className="glass rounded-3xl border border-white/10 p-8 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center">2</span>
            Choose Processing Tier
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tier A */}
            <button
              id="tier-a-select"
              onClick={() => setSelectedTier('A-automated')}
              className={`text-left p-5 rounded-2xl border transition-all space-y-3 ${
                selectedTier === 'A-automated'
                  ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500'
                  : 'border-white/10 bg-white/5 hover:border-blue-400/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                {selectedTier === 'A-automated' && (
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                )}
              </div>
              <div>
                <p className="font-bold text-white">Tier A — AI Automated</p>
                <p className="text-xs text-slate-400 mt-1">Results in &lt;60 seconds. Free during trial.</p>
              </div>
              <div className="text-xs text-blue-400 font-semibold">$2 / image after trial</div>
            </button>

            {/* Tier B */}
            <button
              id="tier-b-select"
              onClick={() => setSelectedTier('B-human')}
              className={`text-left p-5 rounded-2xl border transition-all space-y-3 ${
                selectedTier === 'B-human'
                  ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500'
                  : 'border-white/10 bg-white/5 hover:border-purple-400/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-purple-400" />
                </div>
                {selectedTier === 'B-human' && (
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                )}
              </div>
              <div>
                <p className="font-bold text-white">Tier B — Human Pro</p>
                <p className="text-xs text-slate-400 mt-1">Expert editor. Results within 24 hours.</p>
              </div>
              <div className="text-xs text-purple-400 font-semibold">$15 / image</div>
            </button>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="instructions">
              Processing Instructions (optional)
            </label>
            <textarea
              id="instructions"
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              rows={3}
              placeholder={selectedTier === 'A-automated'
                ? 'e.g. Remove background, enhance colors…'
                : 'e.g. Remove background, keep hair details, add transparent PNG output…'
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition resize-none"
            />
          </div>
        </div>

        {/* Process Button */}
        <button
          id="process-image-btn"
          onClick={handleProcess}
          disabled={!uploadedUrl || processing}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xl"
        >
          {processing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</>
          ) : isFreeCreditsExhausted ? (
            <><CreditCard className="w-5 h-5" /> Upgrade to Process</>
          ) : (
            <>{selectedTier === 'A-automated' ? <Zap className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
            Process Image — {selectedTier === 'A-automated' ? 'AI Auto' : 'Human Pro'}
            <ArrowRight className="w-5 h-5" /></>
          )}
        </button>

        {/* Result */}
        {result && (
          <div className={`glass rounded-3xl border p-8 space-y-4 text-center ${result.isManual ? 'border-purple-500/30' : 'border-green-500/30'}`}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${result.isManual ? 'bg-purple-500/20' : 'bg-green-500/20'}`}>
              {result.isManual ? <UserCheck className="w-8 h-8 text-purple-400" /> : <CheckCircle className="w-8 h-8 text-green-400" />}
            </div>
            <h3 className="text-xl font-bold text-white">{result.isManual ? 'Order Submitted!' : 'Processing Complete!'}</h3>
            <p className="text-slate-400 text-sm">{result.message}</p>
            {result.processedUrl && (
              <a
                id="download-result-btn"
                href={result.processedUrl}
                download
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold transition-all"
              >
                Download Processed Image
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
            {result.orderId && (
              <p className="text-xs text-slate-500">Order ID: {result.orderId}</p>
            )}
          </div>
        )}
      </div>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        creditsUsed={creditsUsed}
        maxCredits={FREE_IMAGE_CREDIT_LIMIT}
      />
    </div>
  );
}
