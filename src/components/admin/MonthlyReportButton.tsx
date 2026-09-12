'use client';

import React, { useState } from 'react';
import { ClipboardCopy, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MonthlyReportButton() {
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/monthly-report');
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate report');
      }

      await navigator.clipboard.writeText(data.report);
      toast.success('Report copied to clipboard! Ready to paste on WhatsApp/Slack', {
        duration: 4000,
        position: 'top-center'
      });
      
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error generating report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleGenerateReport}
      disabled={loading}
      className="px-4 py-2 bg-emerald-600 rounded-xl text-sm font-bold text-white hover:bg-emerald-500 transition flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardCopy className="w-4 h-4" />}
      {loading ? 'Generating...' : 'Generate & Copy Monthly Report'}
    </button>
  );
}
