'use client';

import React, { useState } from 'react';
import { ClipboardCopy, Loader2, FileText, MessageCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MonthlyReportButton() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/monthly-report');
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate report');
      }

      setReport(data.report);
      setIsModalOpen(true);
      
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error generating report');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (report) {
      await navigator.clipboard.writeText(report);
      toast.success('Report copied to clipboard!', { duration: 3000, position: 'top-center' });
    }
  };

  const shareOnWhatsApp = () => {
    if (report) {
      const encodedText = encodeURIComponent(report);
      window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    }
  };

  return (
    <>
      <button 
        onClick={handleGenerateReport}
        disabled={loading}
        className="px-4 py-2 bg-emerald-600 rounded-xl text-sm font-bold text-white hover:bg-emerald-500 transition flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
        {loading ? 'Generating...' : 'Generate Monthly Report'}
      </button>

      {/* Report Modal */}
      {isModalOpen && report && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in-up">
            
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                Monthly Performance Report
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 max-h-[50vh] overflow-y-auto leading-relaxed">
                {report}
              </pre>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button 
                onClick={copyToClipboard}
                className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"
              >
                <ClipboardCopy className="w-4 h-4" /> Copy Text
              </button>
              <button 
                onClick={shareOnWhatsApp}
                className="w-full sm:w-auto px-4 py-2 bg-[#25D366] rounded-xl text-sm font-bold text-white hover:bg-[#22bf5b] transition flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle className="w-4 h-4" /> Send to WhatsApp
              </button>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}
