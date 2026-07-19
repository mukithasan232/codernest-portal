'use client';

import useSWR from 'swr';
import { DollarSign, Loader2 } from 'lucide-react';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function RevenueCard() {
  const { data, error, isLoading } = useSWR('/api/get-revenue', fetcher, {
    refreshInterval: 60000, // Refresh every 1 minute
  });
  
  const [currency, setCurrency] = useState<'USD' | 'BDT'>('USD');
  const exchangeRate = 110; // Simple fallback exchange rate

  let displayValue = '...';
  if (!isLoading && !error && data?.amount !== undefined) {
    const amount = currency === 'USD' ? data.amount : data.amount * exchangeRate;
    displayValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <div className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm flex flex-col justify-center">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-400/10 shrink-0">
          <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1 min-w-0 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Revenue</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white truncate">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : displayValue}
              </p>
            </div>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 shrink-0 ml-2">
            <button
              onClick={() => setCurrency('USD')}
              className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all ${
                currency === 'USD' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              USD
            </button>
            <button
              onClick={() => setCurrency('BDT')}
              className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all ${
                currency === 'BDT' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              BDT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
