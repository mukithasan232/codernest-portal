/**
 * /agency/[city] — Programmatic SEO Landing Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates a unique, handcrafted local landing page for each city in
 * targetCities. Content adapts based on:
 *   • focusIndustry   → section framing and service emphasis
 *   • primaryService  → which CoderNest arm is featured first
 *   • localUSP        → hero value proposition
 *   • localChallenges → pain-point section
 *   • trustStat       → social proof callout
 *   • timezone        → collaboration assurance
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  Clock,
  Code2,
  Camera,
  CheckCircle2,
  Globe,
  Zap,
  ShieldCheck,
  MessageSquare,
  TrendingUp,
  Layers,
  Sparkles,
} from 'lucide-react';
import { MotionDiv, MotionH1, MotionP } from '@/components/ui/motion';
import { getCityBySlug, targetCities, type TargetCity } from '@/lib/data/targetCities';

// ─── Static params: all known cities are pre-rendered at build time ───────────
export function generateStaticParams() {
  return targetCities.map((c) => ({ city: c.slug }));
}

// ─── Dynamic metadata ─────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) return { title: 'Not Found' };

  const title = `${city.focusIndustry} Web Agency in ${city.name} | CoderNest`;
  const description = `CoderNest is ${city.name}'s elite software agency specialising in ${city.focusIndustry}. ${city.localUSP}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://codernest.agency/agency/${city.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://codernest.agency/agency/${city.slug}`,
    },
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ServiceCard({
  icon: Icon,
  title,
  description,
  href,
  accent,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  accent: string;
  delay: number;
}) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group relative bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-3xl p-8 hover:border-blue-400/40 dark:hover:border-blue-500/40 hover:shadow-xl dark:hover:shadow-blue-500/5 transition-all duration-300"
    >
      <div className={`w-12 h-12 rounded-2xl ${accent} flex items-center justify-center mb-6`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">{description}</p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:gap-3 transition-all"
      >
        Learn more <ArrowRight className="w-4 h-4" />
      </Link>
    </MotionDiv>
  );
}

function ChallengeCard({ text, index }: { text: string; index: number }) {
  return (
    <MotionDiv
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="flex items-start gap-4 p-5 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl"
    >
      <div className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-xs font-bold text-red-500">{index + 1}</span>
      </div>
      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{text}</p>
    </MotionDiv>
  );
}

// ─── Services config — adapts based on city.primaryService ───────────────────

function getServices(city: TargetCity) {
  const webServices = [
    {
      icon: Code2,
      title: 'Full-Stack Web Engineering',
      description: `Enterprise-grade Next.js 14 App Router applications, Node.js APIs, and Prisma-backed databases — built for ${city.focusIndustry} scale.`,
      href: '/services#web',
      accent: 'bg-blue-500/10 text-blue-500 dark:text-blue-400',
    },
    {
      icon: Layers,
      title: 'SaaS Platform Architecture',
      description: `Multi-tenant, role-based SaaS platforms with real-time dashboards and analytics — the technical foundation ${city.name} investors expect.`,
      href: '/services#web',
      accent: 'bg-purple-500/10 text-purple-500 dark:text-purple-400',
    },
    {
      icon: Zap,
      title: 'Performance Optimisation',
      description: `Core Web Vitals tuning, CDN strategy, and SSR/ISR configuration to dominate ${city.name}'s competitive search landscape.`,
      href: '/services#web',
      accent: 'bg-cyan-500/10 text-cyan-500 dark:text-cyan-400',
    },
  ];

  const imageServices = [
    {
      icon: Camera,
      title: 'AI + Human Image Retouching',
      description: `Professional product photography retouching at scale — the precision ${city.focusIndustry} brands need to command premium prices.`,
      href: '/image-studio',
      accent: 'bg-pink-500/10 text-pink-500 dark:text-pink-400',
    },
    {
      icon: Sparkles,
      title: 'Bulk Image Processing',
      description: `Automated pipelines for high-volume image workflows — perfect for ${city.name} brands with large catalogues and tight deadlines.`,
      href: '/image-studio',
      accent: 'bg-amber-500/10 text-amber-500 dark:text-amber-400',
    },
  ];

  if (city.primaryService === 'web') return webServices;
  if (city.primaryService === 'image') return [...imageServices, webServices[0]];
  // 'both'
  return [webServices[0], imageServices[0], webServices[1]];
}

// ─── Why CoderNest — universal pillars with city-aware copy ──────────────────

function getWhyPoints(city: TargetCity) {
  return [
    {
      icon: Clock,
      title: `${city.timezone} Timezone — Zero Lag`,
      description: `Our async-first workflow means real-time Slack updates, daily standup reports, and no 6am/11pm calls. We operate on your clock.`,
    },
    {
      icon: ShieldCheck,
      title: 'Enterprise-Grade Security',
      description: `Every project ships with OWASP-compliant code, encrypted secrets management, and architecture ready for your compliance requirements.`,
    },
    {
      icon: TrendingUp,
      title: `${city.trustStat.value} — ${city.trustStat.label}`,
      description: `Proven results in the ${city.focusIndustry} vertical. We build for outcomes, not just deliverables.`,
    },
    {
      icon: MessageSquare,
      title: 'Transparent Communication',
      description: `Dedicated Slack channel, Notion project board, and weekly video calls. You always know exactly where your project stands.`,
    },
  ];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CityLandingPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();

  const services = getServices(city);
  const whyPoints = getWhyPoints(city);
  const flagEmoji = city.country === 'UK' ? '🇬🇧' : '🇺🇸';

  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-50 overflow-hidden transition-colors duration-300">

      {/* ── Ambient background glows ───────────────────────────────────────── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-gradient-to-br from-[#00F2FE]/8 to-[#3B82F6]/8 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-40 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-[#3B82F6]/6 to-transparent blur-[120px] pointer-events-none -z-10" />

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          {/* Breadcrumb pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-8">
            <Globe className="w-4 h-4" />
            <span>
              {flagEmoji} {city.name}, {city.country} &nbsp;·&nbsp; {city.focusIndustry}
            </span>
          </div>
        </MotionDiv>

        <div className="max-w-4xl">
          <MotionH1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white leading-[1.1]"
          >
            Elite {city.focusIndustry.split(' ')[0]}{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F2FE] to-[#3B82F6]">
              Agency
            </span>
            <br className="hidden md:block" />
            in {city.name}.
          </MotionH1>

          <MotionP
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mb-4 leading-relaxed"
          >
            {city.localUSP}
          </MotionP>

          {/* Timezone trust signal */}
          <MotionP
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-500 mb-10"
          >
            <Clock className="w-4 h-4 text-blue-400" />
            Seamless collaboration in your local timezone ({city.timezone}) — async-first,
            always responsive.
          </MotionP>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/contact">
              <button className="group w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#3B82F6] text-white font-bold shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)] hover:shadow-[0_0_45px_-5px_rgba(59,130,246,0.6)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                Get a Free Consultation
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/portfolio">
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-white/10 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                View Our Work
              </button>
            </Link>
          </MotionDiv>
        </div>
      </section>

      {/* ══ TRUST STAT BAR ══════════════════════════════════════════════════ */}
      <section className="border-y border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.015] py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: city.trustStat.value, label: city.trustStat.label },
              { value: '100%', label: 'TypeScript — zero runtime surprises' },
              { value: city.timezone, label: 'Your timezone, always in sync' },
              { value: '5★', label: 'Average client satisfaction score' },
            ].map((stat, i) => (
              <MotionDiv
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 leading-snug max-w-[140px] mx-auto">
                  {stat.label}
                </p>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ══ LOCAL CHALLENGES ════════════════════════════════════════════════ */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-sm font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {city.name} Market Challenges
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
            We understand {city.name}'s{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F2FE] to-[#3B82F6]">
              unique pressures.
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-lg">
            These are the exact challenges {city.focusIndustry} businesses in {city.name} bring
            to us — and the ones we solve every single week.
          </p>
        </MotionDiv>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {city.localChallenges.map((challenge, i) => (
            <ChallengeCard key={i} text={challenge} index={i} />
          ))}
        </div>

        {/* Solution bridge */}
        <MotionDiv
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6"
        >
          <CheckCircle2 className="w-10 h-10 text-blue-500 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {city.heroTagline}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              CoderNest has delivered production-ready solutions for {city.focusIndustry} businesses
              across {city.name} and beyond. We don't just write code — we become the technical
              partner your growth depends on.
            </p>
          </div>
          <Link href="/contact" className="flex-shrink-0">
            <button className="whitespace-nowrap px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex items-center gap-2 group">
              Let&apos;s Talk
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </MotionDiv>
      </section>

      {/* ══ SERVICES ════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-white dark:bg-white/[0.015] border-y border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              Services for {city.name}'s{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F2FE] to-[#3B82F6]">
                {city.focusIndustry}
              </span>{' '}
              market
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              Every service is delivered with the rigour and precision that{' '}
              {city.focusIndustry} businesses in {city.name} demand.
            </p>
          </MotionDiv>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <ServiceCard key={service.title} {...service} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHY CODERNEST ═══════════════════════════════════════════════════ */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
            Why {city.name} businesses choose CoderNest
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            We're not a generic agency. We understand {city.focusIndustry} and we've built a
            workflow that eliminates the friction most agencies create.
          </p>
        </MotionDiv>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {whyPoints.map((point, i) => (
            <MotionDiv
              key={point.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-5 p-6 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl hover:border-blue-400/30 dark:hover:border-blue-500/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <point.icon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{point.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {point.description}
                </p>
              </div>
            </MotionDiv>
          ))}
        </div>
      </section>

      {/* ══ PROCESS STRIP ═══════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-slate-900 dark:bg-black border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs font-semibold text-slate-500 uppercase tracking-widest mb-10">
            Our {city.name} engagement model
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Discovery Call', desc: `30 min call to understand your ${city.focusIndustry} specific needs and goals.` },
              { step: '02', title: 'Proposal & Scope', desc: 'Fixed-price proposal delivered within 24 hours. No surprise invoices.' },
              { step: '03', title: 'Sprint Delivery', desc: '1–2 week sprints with daily async updates and demo sessions.' },
              { step: '04', title: 'Launch & Support', desc: 'Monitored go-live, post-launch support, and optional retainer.' },
            ].map((phase, i) => (
              <MotionDiv
                key={phase.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl font-black text-white/5 mb-3">{phase.step}</div>
                <h3 className="text-sm font-bold text-white mb-2">{phase.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{phase.desc}</p>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ═════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-4 max-w-4xl mx-auto text-center">
        <MotionDiv
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
            Ready to dominate{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F2FE] to-[#3B82F6]">
              {city.name}'s
            </span>{' '}
            digital space?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
            Join {city.focusIndustry} businesses in {city.name} that chose CoderNest as their
            engineering partner. Let's build something exceptional together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <button className="group w-full sm:w-auto px-10 py-5 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#3B82F6] text-white font-bold text-lg shadow-[0_0_40px_-5px_rgba(59,130,246,0.5)] hover:shadow-[0_0_60px_-5px_rgba(59,130,246,0.7)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                Start Your Project
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/portfolio">
              <button className="w-full sm:w-auto px-10 py-5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold text-lg hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-300">
                See Case Studies
              </button>
            </Link>
          </div>

          {/* Micro trust signals */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8 text-sm text-slate-500 dark:text-slate-500">
            {[
              '✅ No lock-in contracts',
              `🕐 ${city.timezone} timezone support`,
              '💳 Milestone-based billing',
              '📋 NDA signed on request',
            ].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </MotionDiv>
      </section>
    </main>
  );
}
