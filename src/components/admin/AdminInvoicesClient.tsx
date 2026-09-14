'use client';

import { useState } from 'react';
import type { Invoice } from '@/types';
import { createInvoice, markInvoicePaid } from '@/lib/actions/admin.actions';
import {
  DollarSign,
  Plus,
  CheckCircle,
  Clock,
  ExternalLink,
  X,
  CreditCard,
  Printer,
  Copy,
  Check,
  Search,
  Receipt,
  Building,
  Sparkles,
  ShieldCheck,
  Trash,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PackagePreset {
  title: string;
  amount: number;
  description: string;
}

const PACKAGE_PRESETS: PackagePreset[] = [
  {
    title: 'Next.js Agency-in-a-Box Setup',
    amount: 2999,
    description: 'Complete production-ready Next.js App Router agency portal, auth, CRM, and Stripe checkout.',
  },
  {
    title: 'Full-Stack SaaS MVP Build',
    amount: 4500,
    description: 'High-performance SaaS architecture with Prisma ORM, role-based auth, and automated onboarding.',
  },
  {
    title: 'MedOS Healthcare Suite Module',
    amount: 5800,
    description: 'Enterprise healthcare management module with patient workflow and encrypted record handling.',
  },
  {
    title: 'Technical Architecture & Cloud Audit',
    amount: 1499,
    description: 'In-depth performance optimization, database query tuning, and cloud infrastructure assessment.',
  },
];

export default function AdminInvoicesClient({ initialInvoices }: { initialInvoices: Invoice[] }) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'draft'>('all');

  // Modals
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Stripe Checkout Generator State
  const [checkoutForm, setCheckoutForm] = useState({
    title: PACKAGE_PRESETS[0].title,
    description: PACKAGE_PRESETS[0].description,
    amount: PACKAGE_PRESETS[0].amount.toString(),
    clientName: '',
    clientEmail: '',
    company: '',
  });
  const [generatingLink, setGeneratingLink] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Custom Invoice Form State
  const [customForm, setCustomForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientType: 'Local',
    amount: '',
    currency: 'BDT',
    description: '',
    paymentMethod: 'bKash',
    sendEmail: false,
  });
  const [customLoading, setCustomLoading] = useState(false);

  // Handle Preset Select
  function handlePresetSelect(preset: PackagePreset) {
    setCheckoutForm((prev) => ({
      ...prev,
      title: preset.title,
      description: preset.description,
      amount: preset.amount.toString(),
    }));
  }

  // Generate Stripe Checkout Session
  async function handleGenerateCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!checkoutForm.clientEmail || !checkoutForm.amount) {
      toast.error('Client email and amount are required.');
      return;
    }

    setGeneratingLink(true);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: checkoutForm.title,
          description: checkoutForm.description,
          amount: parseFloat(checkoutForm.amount),
          clientName: checkoutForm.clientName,
          clientEmail: checkoutForm.clientEmail,
          company: checkoutForm.company,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate checkout session');
      }

      setGeneratedUrl(data.url);
      toast.success('Stripe checkout link generated!');

      // Fetch fresh list
      const invRes = await fetch(`/api/invoices/${data.invoiceId}?format=json`);
      if (invRes.ok) {
        const invData = await invRes.json();
        if (invData.invoice) {
          setInvoices((prev) => [invData.invoice, ...prev]);
        }
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error generating checkout link');
    } finally {
      setGeneratingLink(false);
    }
  }

  // Create Manual Invoice
  async function handleCreateCustom(e: React.FormEvent) {
    e.preventDefault();
    if (!customForm.clientEmail || !customForm.amount) {
      toast.error('Client email and amount are required.');
      return;
    }

    setCustomLoading(true);
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create invoice.');

      toast.success(customForm.sendEmail ? 'Invoice created and email sent!' : 'Invoice created successfully!');
      setShowCustomModal(false);
      setInvoices([data.invoice as Invoice, ...invoices]);
      setCustomForm({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        clientType: 'Local',
        amount: '',
        currency: 'BDT',
        description: '',
        paymentMethod: 'bKash',
        sendEmail: false,
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create invoice.');
    } finally {
      setCustomLoading(false);
    }
  }

  // Mark as Paid
  async function handleMarkPaid(id: string) {
    const res = await markInvoicePaid(id);
    if (res.success) {
      setInvoices(invoices.map((i) => (i.id === id ? { ...i, status: 'paid', paidAt: new Date() } : i)));
      toast.success('Invoice marked as paid!');
    } else {
      toast.error('Failed to update invoice status.');
    }
  }

  // Delete Invoice
  async function handleDeleteInvoice(id: string) {
    if (!window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/invoices/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete invoice');
      }
      
      setInvoices(invoices.filter((i) => i.id !== id));
      toast.success('Invoice deleted successfully');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete invoice');
    }
  }

  // Copy helper
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    toast.success('Checkout link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  }

  // Analytics
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  const totalCollected = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  const totalPending = invoices
    .filter((inv) => inv.status === 'pending')
    .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  const paidCount = invoices.filter((i) => i.status === 'paid').length;

  // Filtered list
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      (inv.clientEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.invoiceNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : (inv.status || '').toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Billing & Invoices
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
              <ShieldCheck className="w-3.5 h-3.5" /> Stripe Verified
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Create instant Stripe checkout sessions, track payments, and generate branded client invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setGeneratedUrl(null);
              setShowCheckoutModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all"
          >
            <CreditCard className="w-4 h-4" /> Create Checkout Link
          </button>
          <button
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white font-semibold text-sm rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" /> Manual Invoice
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Invoiced
            </span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black mt-2 text-slate-900 dark:text-white">
            ${totalInvoiced.toLocaleString()}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">{invoices.length} invoices generated</span>
        </div>

        <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Collected
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-emerald-600 dark:text-emerald-400">
            ${totalCollected.toLocaleString()}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">{paidCount} paid accounts</span>
        </div>

        <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Pending Balance
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-amber-600 dark:text-amber-400">
            ${totalPending.toLocaleString()}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">Awaiting payment settlement</span>
        </div>

        <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Collection Rate
            </span>
            <Receipt className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-blue-600 dark:text-blue-400">
            {totalInvoiced > 0 ? `${Math.round((totalCollected / totalInvoiced) * 100)}%` : '100%'}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">Settlement efficiency</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client, email, or invoice #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {(['all', 'paid', 'pending', 'draft'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-white/5 text-xs uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold">Invoice #</th>
                <th className="px-6 py-4 font-semibold">Client</th>
                <th className="px-6 py-4 font-semibold">Package / Description</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No invoices match your search or filter.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const isPaid = inv.status === 'paid';
                  const formattedDate = new Date(inv.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        <button
                          onClick={() => setPreviewInvoice(inv)}
                          className="font-mono text-xs text-blue-600 hover:text-blue-500 hover:underline"
                        >
                          {inv.invoiceNumber || `CN-${inv.id.slice(-6)}`}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {inv.clientName || 'Valued Client'}
                        </div>
                        <div className="text-xs text-slate-400">{inv.clientEmail}</div>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-slate-700 dark:text-slate-300">
                        {inv.description || 'Custom Engineering Scope'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        ${(inv.amount || 0).toLocaleString()} {inv.currency || 'USD'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : inv.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {isPaid ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">{formattedDate}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            title="View / Print Receipt"
                            onClick={() => setPreviewInvoice(inv)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {inv.stripePaymentLink && (
                            <a
                              title="Open Checkout Link"
                              href={inv.stripePaymentLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-400 hover:text-blue-500 transition rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}

                          {!isPaid && (
                            <button
                              onClick={() => handleMarkPaid(inv.id)}
                              className="text-xs px-2.5 py-1 font-semibold rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/80 dark:text-emerald-400 transition"
                            >
                              Mark Paid
                            </button>
                          )}

                          <button
                            title="Delete Invoice"
                            onClick={() => handleDeleteInvoice(inv.id)}
                            className="p-1.5 text-red-400 hover:text-red-500 transition rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MODAL: CREATE STRIPE CHECKOUT LINK ─────────────────────────────── */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Generate Stripe Checkout Link
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a flagship package preset or enter custom service terms.
                </p>
              </div>
            </div>

            {/* Presets */}
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Quick Package Presets
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PACKAGE_PRESETS.map((p) => {
                  const isSelected = checkoutForm.title === p.title;
                  return (
                    <button
                      type="button"
                      key={p.title}
                      onClick={() => handlePresetSelect(p)}
                      className={`text-left p-3 rounded-xl border text-xs transition ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
                          : 'border-slate-200 dark:border-white/10 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-slate-900 dark:text-white">{p.title}</div>
                      <div className="text-blue-600 dark:text-blue-400 font-extrabold mt-1">
                        ${p.amount.toLocaleString()} USD
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleGenerateCheckout} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Package / Service Title *
                </label>
                <input
                  required
                  type="text"
                  value={checkoutForm.title}
                  onChange={(e) => setCheckoutForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Amount (USD) *
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={checkoutForm.amount}
                    onChange={(e) => setCheckoutForm((prev) => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Johnathan Smith"
                    value={checkoutForm.clientName}
                    onChange={(e) => setCheckoutForm((prev) => ({ ...prev, clientName: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Client Email *
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="client@company.com"
                    value={checkoutForm.clientEmail}
                    onChange={(e) => setCheckoutForm((prev) => ({ ...prev, clientEmail: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MedVance Systems"
                    value={checkoutForm.company}
                    onChange={(e) => setCheckoutForm((prev) => ({ ...prev, company: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Scope Description
                </label>
                <textarea
                  rows={2}
                  value={checkoutForm.description}
                  onChange={(e) => setCheckoutForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {generatedUrl ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                    <CheckCircle className="w-4 h-4" /> Ready for Payment
                  </div>
                  <input
                    readOnly
                    type="text"
                    value={generatedUrl}
                    className="w-full text-xs font-mono bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(generatedUrl)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition"
                    >
                      {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedLink ? 'Copied!' : 'Copy Link'}
                    </button>
                    <a
                      href={generatedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white font-semibold text-xs rounded-lg transition"
                    >
                      <ExternalLink className="w-4 h-4" /> Test Checkout
                    </a>
                  </div>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={generatingLink}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-sm disabled:opacity-50"
                >
                  {generatingLink ? 'Creating Session...' : 'Generate Stripe Checkout URL'}
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: MANUAL INVOICE CREATION ─────────────────────────────────── */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowCustomModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              Create Manual Invoice Record
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Record bank wire, escrow, or external manual payments.
            </p>

            <form onSubmit={handleCreateCustom} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Client Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={customForm.clientName}
                    onChange={(e) => setCustomForm((prev) => ({ ...prev, clientName: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Client Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={customForm.clientEmail}
                    onChange={(e) => setCustomForm((prev) => ({ ...prev, clientEmail: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={customForm.clientPhone}
                    onChange={(e) => setCustomForm((prev) => ({ ...prev, clientPhone: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Location / Address
                  </label>
                  <input
                    type="text"
                    value={customForm.clientAddress}
                    onChange={(e) => setCustomForm((prev) => ({ ...prev, clientAddress: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Client Type
                  </label>
                  <select
                    value={customForm.clientType}
                    onChange={(e) => setCustomForm((prev) => ({ ...prev, clientType: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Local">Local (Bangladesh)</option>
                    <option value="International">International</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Amount (BDT) *
                  </label>
                  <input
                    required
                    type="number"
                    value={customForm.amount}
                    onChange={(e) => setCustomForm((prev) => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={customForm.paymentMethod}
                    onChange={(e) => setCustomForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Stripe Card">Stripe Card</option>
                    <option value="Cash / Manual">Cash / Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Service Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Next.js App Router Architecture"
                    value={customForm.description}
                    onChange={(e) => setCustomForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={customForm.sendEmail}
                  onChange={(e) => setCustomForm((prev) => ({ ...prev, sendEmail: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-slate-50 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                />
                <label htmlFor="sendEmail" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Automatically email invoice to client
                </label>
              </div>

              <button
                type="submit"
                disabled={customLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-sm disabled:opacity-50 mt-2"
              >
                {customLoading ? 'Saving...' : 'Create Invoice'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: INVOICE PREVIEW / PRINT ─────────────────────────────────── */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Invoice Preview: {previewInvoice.invoiceNumber || previewInvoice.id}
                </h3>
                <p className="text-xs text-slate-500">Official printable client receipt</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/api/invoices/${previewInvoice.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
                >
                  <Printer className="w-3.5 h-3.5" /> Fullscreen & Print
                </a>
                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 transition rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
              <iframe
                src={`/api/invoices/${previewInvoice.id}`}
                className="w-full h-[600px] border-none"
                title="Invoice HTML Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
