'use client';

import { useState } from 'react';
import type { Invoice } from '@/types';
import { createInvoice, markInvoicePaid } from '@/lib/actions/admin.actions';
import { DollarSign, Plus, CheckCircle, Clock, AlertCircle, ExternalLink, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminInvoicesClient({ initialInvoices }: { initialInvoices: Invoice[] }) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    clientId: '', clientEmail: '', amount: '', currency: 'USD',
    stripePaymentLink: '', paypalLink: '', paymentMethod: 'stripe',
  });
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clientEmail || !form.amount) return;
    setLoading(true);
    try {
      const res = await createInvoice(form);
      if (!res.success) throw new Error(res.error);
      toast.success('Invoice created!');
      setShowCreate(false);
      setInvoices([res.invoice as Invoice, ...invoices]);
      setForm({ clientId: '', clientEmail: '', amount: '', currency: 'USD', stripePaymentLink: '', paypalLink: '', paymentMethod: 'stripe' });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to create invoice.');
    } finally {
      setLoading(false);
    }
  }

  async function markPaid(id: string) {
    const res = await markInvoicePaid(id);
    if (res.success) {
      setInvoices(invoices.map(i => i.id === id ? { ...i, status: 'paid', paidAt: new Date() } : i));
      toast.success('Marked as paid!');
    } else {
      toast.error('Failed to mark as paid.');
    }
  }

  const total = invoices.reduce((s, i) => s + (i.amount ?? 0), 0);
  const collected = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.amount ?? 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Invoices</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Create and track client payment links.</p>
        </div>
        <button
          id="invoice-create-btn"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Invoiced', value: `$${total.toLocaleString()}`, color: 'text-slate-900 dark:text-white' },
          { label: 'Collected',      value: `$${collected.toLocaleString()}`, color: 'text-green-500 dark:text-green-400' },
          { label: 'Pending',        value: `$${(total - collected).toLocaleString()}`, color: 'text-yellow-500 dark:text-yellow-400' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className={`text-2xl font-extrabold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Create Invoice Form */}
      {showCreate && (
        <div className="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-8 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">New Invoice</h2>
            <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form id="invoice-form" onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Client Email *</label>
              <input required type="email" value={form.clientEmail}
                onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition"
                placeholder="client@example.com" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Amount (USD) *</label>
              <input required type="number" value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition"
                placeholder="500" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Stripe Payment Link</label>
              <input type="url" value={form.stripePaymentLink}
                onChange={e => setForm(f => ({ ...f, stripePaymentLink: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition"
                placeholder="https://buy.stripe.com/…" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">PayPal / Escrow Link</label>
              <input type="url" value={form.paypalLink}
                onChange={e => setForm(f => ({ ...f, paypalLink: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition"
                placeholder="https://paypal.me/…" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={loading}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50">
                {loading ? 'Creating…' : 'Create Invoice'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invoice List */}
      <div className="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-200 dark:divide-white/5">
          {invoices.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" />
              No invoices yet.
            </div>
          ) : invoices.map(inv => {
            const StatusIcon = inv.status === 'paid' ? CheckCircle : inv.status === 'overdue' ? AlertCircle : Clock;
            const statusColor = inv.status === 'paid' ? 'text-green-500 dark:text-green-400' : inv.status === 'overdue' ? 'text-red-500 dark:text-red-400' : 'text-yellow-500 dark:text-yellow-400';
            return (
              <div key={inv.id} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">${inv.amount.toLocaleString()} {inv.currency}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{inv.clientEmail} · {new Date(inv.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1.5 text-xs font-bold capitalize ${statusColor}`}>
                    <StatusIcon className="w-3.5 h-3.5" /> {inv.status}
                  </span>
                  {inv.stripePaymentLink && (
                    <a href={inv.stripePaymentLink} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      <ExternalLink className="w-3 h-3" /> Stripe
                    </a>
                  )}
                  {inv.status !== 'paid' && (
                    <button id={`mark-paid-${inv.id}`} onClick={() => markPaid(inv.id)}
                      className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-600/20 dark:hover:bg-green-600/40 dark:text-green-400 text-xs font-bold rounded-lg transition-all">
                      Mark Paid
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
