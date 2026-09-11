'use client';

/**
 * Quick Lead & Direct Cold Outreach Dispatcher Modal
 * File: src/components/admin/crm/QuickOutreachModal.tsx
 *
 * Allows administrators to manually enter high-priority prospects (from LinkedIn,
 * job boards, or direct referrals), select battle-tested cold outreach templates,
 * customize the message with live variable substitution, and immediately dispatch
 * via QStash/SMTP while enrolling the lead in the 48-hour follow-up automation.
 */

import { useState, useEffect, useId } from 'react';
import {
  X,
  Mail,
  Send,
  Sparkles,
  Building2,
  User,
  Briefcase,
  Loader2,
  CheckCircle2,
  Eye,
  Edit3,
  Flame,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createLeadAndDispatchOutreach } from '@/lib/actions/crm-lead.actions';
import type { Lead } from '@/types';

// ─── Preset Outreach Templates (Strictly Real Flagship Projects) ──────────────

interface TemplateOption {
  id: string;
  label: string;
  description: string;
  badge: string;
  subject: string;
  body: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'node_contract',
    label: 'Senior Next.js & Node.js Contract Role',
    description: 'Targeted at hiring managers & recruiters seeking senior technical execution.',
    badge: 'Flagship: MedOS & SMM Elite',
    subject: 'Senior Next.js & Node.js Engineer for {{company}} Engineering Sprints',
    body: `Hi {{name}},

I came across your tech initiatives at {{company}} and wanted to connect directly regarding your engineering roadmap.

As a Senior Full-Stack Next.js Architect and Node.js specialist at CoderNest, I specialize in building enterprise-grade web applications with extreme performance, zero-latency caching, and secure API architectures.

A few relevant production systems I've architected & shipped:
- MedOS: Hospital Management System with HIPAA-compliant role-based access control, appointment queues, and real-time patient telemetry.
- SMM Elite: Automated Digital Agency Marketplace handling high-throughput order processing and automated webhook fulfillment.
- CoderNest Cinema: High-performance streaming & movie database with Next.js App Router and edge caching.

I am available for immediate high-impact contract or advisory bandwidth. Would you be open to a brief 10-minute sync this week to explore alignment?

Best regards,
Tushar Mukit
Principal Full-Stack Architect | CoderNest Digital Solutions
https://codernest.agency`,
  },
  {
    id: 'saas_perf',
    label: 'SaaS & Database Performance Optimization',
    description: 'Targeted at CTOs & technical leads with slow query latencies or scaling pains.',
    badge: 'Prisma + Redis + QStash',
    subject: 'Optimizing Database Throughput & Serverless Latency for {{company}}',
    body: `Hi {{name}},

I noticed {{company}}'s rapid growth and wanted to connect regarding backend infrastructure scaling and latency optimization.

At CoderNest, we specialize in eliminating database bottlenecks and implementing serverless edge caching (Prisma ORM, PostgreSQL, Upstash Redis, and QStash background task queues).

Recent benchmarks from our production deployments:
- Reduced API heartbeat query times from 4.5s down to <35ms in high-concurrency production environments.
- Optimized connection pooling for MedOS to handle concurrent hospital workloads without database connection exhaustion.
- Built at-least-once distributed background task processing pipelines for SMM Elite.

If your team is currently encountering database bottlenecks, heavy query latency, or scaling friction, let's schedule a brief introductory chat.

Warm regards,
Tushar Mukit
Lead Software Architect | CoderNest
https://codernest.agency`,
  },
  {
    id: 'turnkey_agency',
    label: 'Turnkey Web App & MVP Engineering',
    description: 'For founders and product owners looking to launch fast without compromises.',
    badge: 'DevVibe & CoderNest Cinema',
    subject: 'Accelerating {{company}}\'s Web App MVP & Feature Delivery',
    body: `Hi {{name}},

Reaching out to see if {{company}} currently has bandwidth constraints on upcoming web or product development sprints.

CoderNest operates as an elite product engineering partner. We take ambitious specifications from design to production deployment with clean TypeScript, Next.js App Router, Tailwind CSS, and scalable cloud integrations.

Recent flagship launches:
- DevVibe: Tech-themed apparel e-commerce platform with custom design studio and real-time checkout.
- MedOS: Enterprise clinic management with appointment dispatch and multi-tenant billing.
- CoderNest Cinema: Premium entertainment discovery portal built with edge SSR and dynamic caching.

Happy to share architecture breakdowns or jump on a quick discovery call to see how we can accelerate {{company}}\'s next release.

Cheers,
Tushar Mukit
Founder & Lead Architect | CoderNest Digital Solutions
https://codernest.agency`,
  },
  {
    id: 'custom',
    label: 'Custom Cold Outreach',
    description: 'Write a bespoke personalized cold outreach message from scratch.',
    badge: 'Custom',
    subject: 'Collaboration opportunity with CoderNest for {{company}}',
    body: `Hi {{name}},

I've been following the work you're doing at {{company}} and wanted to introduce myself.

At CoderNest, we build mission-critical web applications, enterprise dashboards, and scalable APIs using Next.js, TypeScript, and Prisma ORM.

Would love to learn more about your current technical focus and see if there is potential for collaboration.

Best regards,
Tushar Mukit
CoderNest Digital Solutions
https://codernest.agency`,
  },
];

// ─── Modal Props ─────────────────────────────────────────────────────────────

export interface QuickOutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (lead: Lead) => void;
  initialValues?: {
    name?: string;
    email?: string;
    company?: string;
    roleOrContext?: string;
  };
}

export default function QuickOutreachModal({
  isOpen,
  onClose,
  onSuccess,
  initialValues,
}: QuickOutreachModalProps) {
  const formId = useId();

  // Form State
  const [name, setName] = useState(initialValues?.name || '');
  const [email, setEmail] = useState(initialValues?.email || '');
  const [company, setCompany] = useState(initialValues?.company || '');
  const [roleOrContext, setRoleOrContext] = useState(initialValues?.roleOrContext || 'LinkedIn Outreach');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('node_contract');
  const [subject, setSubject] = useState(TEMPLATES[0].subject);
  const [messageBody, setMessageBody] = useState(TEMPLATES[0].body);

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // Update initial fields if props change
  useEffect(() => {
    if (initialValues) {
      if (initialValues.name) setName(initialValues.name);
      if (initialValues.email) setEmail(initialValues.email);
      if (initialValues.company) setCompany(initialValues.company);
      if (initialValues.roleOrContext) setRoleOrContext(initialValues.roleOrContext);
    }
  }, [initialValues]);

  // Handle template selection
  const handleSelectTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const chosen = TEMPLATES.find((t) => t.id === tplId);
    if (chosen) {
      setSubject(chosen.subject);
      setMessageBody(chosen.body);
    }
  };

  // Interpolation helper for preview and submission
  const interpolate = (text: string): string => {
    const targetName = name.trim() || 'there';
    const targetCompany = company.trim() || 'your team';
    return text
      .replace(/\{\{name\}\}/gi, targetName)
      .replace(/\{\{company\}\}/gi, targetCompany);
  };

  // Keyboard shortcut: close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter the prospect or recruiter name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      toast.error('Please provide a valid work email address.');
      return;
    }

    if (!subject.trim()) {
      toast.error('Please provide an email subject line.');
      return;
    }

    if (!messageBody.trim()) {
      toast.error('Please provide a message body.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Interpolate tokens so final email text has real names
      const finalSubject = interpolate(subject);
      const finalBody = interpolate(messageBody);

      const res = await createLeadAndDispatchOutreach({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: company.trim() || null,
        roleOrContext: roleOrContext.trim() || 'Manual Outreach',
        subject: finalSubject,
        messageBody: finalBody,
        leadSource: 'Manual / Direct Outreach',
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to dispatch outreach');
      }

      toast.success('Lead saved & outreach dispatched via QStash!');

      // If callback provided, notify parent
      if (onSuccess && res.lead) {
        onSuccess({
          id: res.lead.id,
          name: res.lead.name,
          email: res.lead.email,
          company: res.lead.company,
          status: res.lead.status,
          source: res.lead.source,
          createdAt: res.lead.createdAt,
        });
      }

      // Reset form
      setName('');
      setEmail('');
      setCompany('');
      setRoleOrContext('LinkedIn Outreach');
      handleSelectTemplate('node_contract');
      setActiveTab('edit');

      // Close modal
      onClose();
    } catch (err: unknown) {
      console.error('[QuickOutreachModal Submit Error]:', err);
      const msg = err instanceof Error ? err.message : 'Failed to dispatch email';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTemplate = TEMPLATES.find((t) => t.id === selectedTemplateId) || TEMPLATES[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${formId}-title`}
    >
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Glow Header Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-28 bg-blue-500/20 blur-3xl pointer-events-none rounded-full" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id={`${formId}-title`} className="text-lg font-bold text-white flex items-center gap-2">
                Quick Lead & Direct Outreach Dispatcher
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  SMTP + QStash
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Add prospect, dispatch instant cold email, and enroll in 48-hour follow-up workflow.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <form id={formId} onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Prospect Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Prospect Name */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                Prospect / Recruiter Name <span className="text-red-400">*</span>
              </label>
              <input
                id="outreach-name"
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Sarah Jenkins"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            {/* Target Email */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                Work Email Address <span className="text-red-400">*</span>
              </label>
              <input
                id="outreach-email"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="s.jenkins@techfirm.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono"
              />
            </div>

            {/* Company / Organization */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                Company / Organization
              </label>
              <input
                id="outreach-company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g., Apex Health Technologies"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            {/* Role / Context */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                Role or Outreach Context
              </label>
              <input
                id="outreach-context"
                type="text"
                value={roleOrContext}
                onChange={(e) => setRoleOrContext(e.target.value)}
                placeholder="e.g., Senior Full-Stack Contract Role"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          {/* Quick Template Selector */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Select Outreach Strategy / Template
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Auto-replaces <code className="text-blue-300 font-mono">{'{{name}}'}</code> &{' '}
                <code className="text-blue-300 font-mono">{'{{company}}'}</code>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl.id)}
                    className={`text-left p-3 rounded-xl border transition-all duration-200 relative ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500/60 ring-1 ring-blue-500/40 text-white shadow-md'
                        : 'bg-white/5 border-white/5 hover:border-white/15 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-white leading-snug">{tpl.label}</p>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{tpl.description}</p>
                    <div className="mt-2">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                        {tpl.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email Customization & Live Preview Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <label className="text-xs font-semibold text-slate-300">
                Email Message Content
              </label>
              <div className="flex gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
                    activeTab === 'edit'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
                    activeTab === 'preview'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Live Preview
                </button>
              </div>
            </div>

            {/* Subject Line */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Subject Line</label>
              <input
                id="outreach-subject"
                required
                type="text"
                value={activeTab === 'preview' ? interpolate(subject) : subject}
                disabled={activeTab === 'preview'}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject line with {{company}}..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition disabled:opacity-80 disabled:bg-white/[0.03]"
              />
            </div>

            {/* Message Body or Preview */}
            {activeTab === 'edit' ? (
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Message Body (Markdown/Plaintext)
                </label>
                <textarea
                  id="outreach-body"
                  required
                  rows={9}
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Hi {{name}}..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed font-mono focus:outline-none focus:border-blue-500 transition resize-y"
                />
              </div>
            ) : (
              <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 text-xs text-slate-300 space-y-3 font-sans">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[11px] text-slate-400 font-mono">
                  <span>
                    To: <strong className="text-white">{email || 'prospect@domain.com'}</strong>
                  </span>
                  <span>
                    From: <strong className="text-white">CoderNest Enterprise System</strong>
                  </span>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {interpolate(messageBody)}
                </div>
                <div className="pt-3 border-t border-white/10 text-[10px] text-slate-500">
                  Includes CoderNest official HTML card styling & footer in final delivered email.
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-slate-900/90 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Workflow: 48-Hour Reply Detection Active</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-semibold rounded-xl transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              id="outreach-dispatch-btn"
              form={formId}
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Dispatching QStash...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Save & Dispatch Outreach
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
