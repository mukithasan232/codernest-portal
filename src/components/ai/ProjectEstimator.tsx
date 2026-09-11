'use client';

import { useState } from 'react';
import {
  Sparkles,
  Layers,
  Cpu,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Calendar,
  Shield,
  Printer,
  CreditCard,
  Building,
  Mail,
  User,
  Check,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { EstimateResponseData } from '@/app/api/ai/estimate/route';

interface ProjectTypeOption {
  id: string;
  title: string;
  subtitle: string;
  recommendedBudget: string;
  icon: typeof Layers;
}

const PROJECT_TYPES: ProjectTypeOption[] = [
  {
    id: 'Next.js SaaS MVP',
    title: 'Next.js SaaS MVP',
    subtitle: 'Serverless App Router, Prisma ORM, multi-tenant DB, and Stripe billing.',
    recommendedBudget: 'Starting at $2,800',
    icon: Layers,
  },
  {
    id: 'Enterprise E-Commerce',
    title: 'Enterprise E-Commerce',
    subtitle: 'High-speed storefront, automated cart recovery, and global payment gateways.',
    recommendedBudget: 'Starting at $3,500',
    icon: Zap,
  },
  {
    id: 'Custom Agency Portal',
    title: 'Custom Agency Portal',
    subtitle: 'Client dashboard, automated invoicing, lead CRM, and role-based permissions.',
    recommendedBudget: 'Starting at $2,400',
    icon: Building,
  },
  {
    id: 'Healthcare / MedOS-style Suite',
    title: 'Healthcare / MedOS-style Suite',
    subtitle: 'Patient management, encrypted health records, and sub-second queue tracking.',
    recommendedBudget: 'Starting at $4,500',
    icon: Shield,
  },
  {
    id: 'Automated Marketplace (SMM Elite)',
    title: 'Automated Marketplace (SMM Elite)',
    subtitle: 'Distributed job queuing, Upstash QStash fan-out, and dynamic order APIs.',
    recommendedBudget: 'Starting at $3,800',
    icon: Cpu,
  },
];

const AVAILABLE_FEATURES = [
  'Role-based Access Control (RBAC) & NextAuth',
  'Stripe / Subscription Recurring Billing',
  'AI / LLM Integration (Gemini & OpenAI)',
  'Upstash Redis Edge Caching & Rate Limiting',
  'Upstash QStash Background Queues & Webhooks',
  'Real-time WebSockets & Live Traffic Tracking',
  'Analytics Dashboard & Revenue Reports',
  'Automated Email Broadcasts & CRM Triggers',
  'Custom UI/UX & Tailwind Design System',
  'SEO Optimization & OpenGraph Schema',
];

const TIMELINE_OPTIONS = [
  { id: 'Rush (2–3 Weeks)', label: 'Accelerated Sprint', duration: '2–3 Weeks', note: 'Priority allocation for urgent launch' },
  { id: 'Standard (4–6 Weeks)', label: 'Standard Production', duration: '4–6 Weeks', note: 'Recommended balance of speed & depth' },
  { id: 'Enterprise (8–12 Weeks)', label: 'Comprehensive Build', duration: '8–12 Weeks', note: 'Ideal for complex architectures' },
];

export default function ProjectEstimator() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [selectedType, setSelectedType] = useState<string>(PROJECT_TYPES[0].id);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'Role-based Access Control (RBAC) & NextAuth',
    'Stripe / Subscription Recurring Billing',
    'Upstash Redis Edge Caching & Rate Limiting',
  ]);
  const [selectedTimeline, setSelectedTimeline] = useState<string>(TIMELINE_OPTIONS[1].id);

  // Lead Gate
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  // Results & Loading
  const [loading, setLoading] = useState(false);
  const [estimateResult, setEstimateResult] = useState<EstimateResponseData | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  function toggleFeature(feature: string) {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  }

  async function handleGenerateEstimate(e: React.FormEvent) {
    e.preventDefault();

    if (!contactName.trim() || !contactEmail.trim()) {
      toast.error('Please provide your name and work email.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/ai/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          company: contactCompany,
          projectType: selectedType,
          features: selectedFeatures,
          timeline: selectedTimeline,
          customNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate project estimate.');
      }

      setEstimateResult(data.estimate);
      setCurrentStep(5);
      toast.success('Architecture blueprint and estimate ready!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error generating estimate');
    } finally {
      setLoading(false);
    }
  }

  async function handleDirectCheckout() {
    if (!estimateResult) return;
    setCheckoutLoading(true);
    try {
      const depositAmount = Math.min(1500, Math.round(estimateResult.estimatedBudgetMin * 0.3));

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${selectedType} — Initial Engineering Deposit`,
          description: `Kickoff deposit for ${selectedType}. Deliverables: Architecture Setup, Wireframes, and Phase 1 Milestone.`,
          amount: depositAmount,
          clientName: contactName,
          clientEmail: contactEmail,
          company: contactCompany,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Could not initiate checkout');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to start checkout');
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-10 shadow-xl backdrop-blur-md">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" /> AI Architecture & Budget Estimator
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Calculate Your Project Scope & Timeline
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-xl mx-auto">
          Get an instant, architectural breakdown and budget estimate tailored to modern Next.js and high-availability standards.
        </p>
      </div>

      {/* Step Indicator */}
      {currentStep < 5 && (
        <div className="flex items-center justify-between max-w-xs mx-auto mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === step
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-4 ring-blue-100 dark:ring-blue-900/40'
                    : currentStep > step
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-white/10 text-slate-400'
                }`}
              >
                {currentStep > step ? <Check className="w-4 h-4" /> : step}
              </div>
              {step < 4 && (
                <div
                  className={`w-8 sm:w-12 h-0.5 mx-1 transition-all ${
                    currentStep > step ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── STEP 1: PROJECT TYPE ────────────────────────────────────────────── */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="text-left">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Step 1: Select Your Core Platform Architecture
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              What type of software platform or digital solution are you building?
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PROJECT_TYPES.map((pt) => {
              const Icon = pt.icon;
              const isSelected = selectedType === pt.id;
              return (
                <button
                  type="button"
                  key={pt.id}
                  onClick={() => setSelectedType(pt.id)}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 shadow-sm'
                      : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{pt.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {pt.subtitle}
                      </p>
                      <span className="inline-block mt-2 font-mono text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                        {pt.recommendedBudget}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition shadow-sm"
            >
              Continue to Features <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 2: CAPABILITIES & FEATURES ─────────────────────────────────── */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="text-left">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Step 2: Core Engineering Capabilities & Features
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select all high-value modules required for your MVP or production platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {AVAILABLE_FEATURES.map((feat) => {
              const isChecked = selectedFeatures.includes(feat);
              return (
                <button
                  type="button"
                  key={feat}
                  onClick={() => toggleFeature(feat)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left text-xs font-medium transition ${
                    isChecked
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200'
                      : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{feat}</span>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                      isChecked
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-300 dark:border-white/20'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition shadow-sm"
            >
              Set Timeline <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 3: TIMELINE & PRIORITY ─────────────────────────────────────── */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="text-left">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Step 3: Deployment Timeline & Delivery Speed
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              How quickly do you need this platform engineered and deployed?
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TIMELINE_OPTIONS.map((t) => {
              const isSelected = selectedTimeline === t.id;
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setSelectedTimeline(t.id)}
                  className={`p-4 rounded-2xl border text-left transition ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
                      : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm mb-1">
                    <Clock className="w-4 h-4" /> {t.duration}
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">{t.label}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{t.note}</p>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition shadow-sm"
            >
              Final Step: Unlock Report <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 4: LEAD CAPTURE GATE ───────────────────────────────────────── */}
      {currentStep === 4 && (
        <form onSubmit={handleGenerateEstimate} className="space-y-6">
          <div className="text-left">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Step 4: Where Should We Send Your Technical Blueprint?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your contact details to generate and email your personalized scope, tech recommendations, and budget.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="text"
                  placeholder="Alex Rivers"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Work Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="email"
                  placeholder="alex@company.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company / Organization
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Acme Innovations Ltd."
                  value={contactCompany}
                  onChange={(e) => setContactCompany(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Additional Notes or Specific Integrations
              </label>
              <input
                type="text"
                placeholder="e.g. Existing database migration required"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>
              Your estimate unlocks instantly on screen and our senior team enrolls your inquiry into our Upstash Onboarding Pipeline for priority code review.
            </span>
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
            >
              {loading ? (
                <>Calculating Architecture...</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate Project Estimate
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ─── STEP 5: DETAILED AI ESTIMATE REPORT ──────────────────────────────── */}
      {currentStep === 5 && estimateResult && (
        <div className="space-y-6 text-left animate-in fade-in duration-300">
          {/* Top Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/40 via-slate-900 to-indigo-950/40 border border-blue-500/30 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Engineering Scope Proposal
                </span>
                <h3 className="text-2xl font-black mt-1">{selectedType}</h3>
                <p className="text-xs text-slate-300 mt-1">Prepared for: {contactName} ({contactCompany || 'Valued Client'})</p>
              </div>
              <div className="sm:text-right bg-black/40 px-5 py-3 rounded-xl border border-white/10">
                <span className="text-xs text-slate-400 uppercase tracking-wider block">Estimated Budget</span>
                <span className="text-2xl font-extrabold text-emerald-400">
                  ${estimateResult.estimatedBudgetMin.toLocaleString()} – ${estimateResult.estimatedBudgetMax.toLocaleString()}
                </span>
                <span className="text-xs text-slate-300 block mt-0.5">
                  Timeline: {estimateResult.estimatedTimelineWeeks}
                </span>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Architecture Overview
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {estimateResult.summary}
            </p>
          </div>

          {/* Recommended Tech Stack Badges */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Recommended Technology Stack
            </h4>
            <div className="flex flex-wrap gap-2">
              {estimateResult.recommendedTechStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold rounded-lg"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Milestones Schedule */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Phased Milestone Roadmap
            </h4>
            <div className="space-y-3">
              {estimateResult.milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">{m.title}</h5>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 font-mono">
                      {m.duration}
                    </span>
                  </div>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    {m.deliverables.map((d, dIdx) => (
                      <li key={dIdx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Flagship Benchmark Comparison */}
          {estimateResult.flagshipComparison && (
            <div className="p-4 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 text-xs">
              <span className="font-bold text-white block mb-1">Flagship Benchmark:</span>
              {estimateResult.flagshipComparison}
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleDirectCheckout}
              disabled={checkoutLoading}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              {checkoutLoading ? 'Preparing Checkout...' : 'Secure Project Deposit ($1,000)'}
            </button>

            <a
              href="/contact"
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition"
            >
              <Calendar className="w-4 h-4" /> Book Architecture Call
            </a>

            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition"
            >
              <Printer className="w-4 h-4" /> Print / PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
