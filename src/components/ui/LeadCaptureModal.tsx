'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';

interface AuditResult {
  [key: string]: any;
}

interface LeadCaptureModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Close the modal without submitting */
  onClose: () => void;
  /**
   * Called after a successful submission.
   * @param email The real email that was submitted
   */
  onCapture: (email: string) => void;
  /** Optional audit/context data to bundle with the lead */
  auditResult?: AuditResult;
  /** Headline shown in the gate — override for different gate contexts */
  headline?: string;
  /** Sub-copy shown below the headline */
  subCopy?: string;
  /** CTA button text */
  ctaLabel?: string;
  /** Which source tag to send to the CRM */
  source?: string;
}

export default function LeadCaptureModal({
  isOpen,
  onClose,
  onCapture,
  auditResult,
  headline = 'Unlock Your Full SEO Audit Report',
  subCopy = 'Enter your name and work email to view performance scores & fix recommendations.',
  ctaLabel = 'Get Full Report & Free Proposal',
  source = 'SEO_AUDITOR',
}: LeadCaptureModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, source, data: auditResult }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Something went wrong. Please try again.');
        return;
      }

      setSubmitted(true);
      onCapture(email);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.7)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="w-full max-w-md bg-[#0F1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Gradient header bar */}
            <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600" />

            <div className="p-7">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* Lock icon */}
                    <div className="w-12 h-12 mb-5 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-orange-400" />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{headline}</h3>
                    <p className="text-sm text-slate-400 mb-6">{subCopy}</p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                      <input
                        type="text"
                        placeholder="Your Full Name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all text-sm"
                      />
                      <input
                        type="email"
                        placeholder="name@company.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all text-sm"
                      />

                      {error && (
                        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                          {error}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-400 hover:to-pink-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/20 text-sm"
                      >
                        {isSubmitting ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Securing your report...</>
                        ) : (
                          <>{ctaLabel} <ChevronRight className="w-4 h-4" /></>
                        )}
                      </button>

                      <p className="text-center text-[11px] text-slate-600 pt-1">
                        🔒 No spam. Unsubscribe anytime. Your data is never sold.
                      </p>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-8 text-center"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">Report Unlocked! 🎉</h4>
                    <p className="text-sm text-slate-400">
                      Check your inbox at <span className="text-orange-400 font-medium">{email}</span> for the full breakdown and our free proposal.
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-6 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium rounded-xl transition-all border border-white/10"
                    >
                      Close
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
