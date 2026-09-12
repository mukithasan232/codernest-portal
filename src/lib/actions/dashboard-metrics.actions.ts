'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { TransactionType, ExpenseCategory } from '@prisma/client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MonthlyDataPoint {
  month: string;       // e.g. "Mar", "Apr"
  revenue: number;
  spend: number;
  netMargin: number;
}

export interface MonetizationMilestone {
  label: string;
  achieved: boolean;
  current: number;
  target: number;
  unit: string;
}

export interface DashboardMetrics {
  // Revenue
  allTimeRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  revenueChangePercent: number;

  // Spend
  totalAdSpend: number;
  thisMonthSpend: number;

  // Derived
  netProfit: number;
  netProfitMargin: number; // percentage
  roas: number;            // Revenue / AdSpend × 100

  // Monetization
  monetizationScore: number; // 0–100
  milestones: MonetizationMilestone[];

  // Chart
  monthlyData: MonthlyDataPoint[];
}

export interface LogRevenueInput {
  title: string;
  clientName?: string;
  amount: number;
  type: TransactionType;
  status?: string;
  notes?: string;
  receivedAt?: string;
}

export interface LogExpenseInput {
  campaign: string;
  category: ExpenseCategory;
  amountSpent: number;
  clicks?: number;
  impressions?: number;
  date?: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function getMonthBoundaries(monthsAgo = 0): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const end   = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

// ─── Main aggregator ──────────────────────────────────────────────────────────

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const { start: thisMonthStart, end: thisMonthEnd } = getMonthBoundaries(0);
  const { start: lastMonthStart, end: lastMonthEnd } = getMonthBoundaries(1);

  // ── Fetch all data in parallel ─────────────────────────────────────────────
  const [
    allRevRecords,
    thisMonthRevRecords,
    lastMonthRevRecords,
    allExpenses,
    thisMonthExpenses,
    publishedBlogCount,
    recentPageViews,
  ] = await Promise.all([
    prisma.revenueRecord.findMany({ where: { status: 'PAID' }, select: { amount: true, receivedAt: true } }),
    prisma.revenueRecord.findMany({ where: { status: 'PAID', receivedAt: { gte: thisMonthStart, lte: thisMonthEnd } }, select: { amount: true } }),
    prisma.revenueRecord.findMany({ where: { status: 'PAID', receivedAt: { gte: lastMonthStart, lte: lastMonthEnd } }, select: { amount: true } }),
    prisma.marketingExpense.findMany({ select: { amountSpent: true, date: true } }),
    prisma.marketingExpense.findMany({ where: { date: { gte: thisMonthStart } }, select: { amountSpent: true } }),
    prisma.blog.count({ where: { status: 'published' } }),
    prisma.pageView.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
  ]);

  // ── Revenue aggregations ───────────────────────────────────────────────────
  const allTimeRevenue  = allRevRecords.reduce((s, r) => s + r.amount, 0);
  const thisMonthRevenue = thisMonthRevRecords.reduce((s, r) => s + r.amount, 0);
  const lastMonthRevenue = lastMonthRevRecords.reduce((s, r) => s + r.amount, 0);
  const revenueChangePercent = lastMonthRevenue === 0
    ? 100
    : parseFloat((((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1));

  // ── Spend aggregations ────────────────────────────────────────────────────
  const totalAdSpend   = allExpenses.reduce((s, e) => s + e.amountSpent, 0);
  const thisMonthSpend = thisMonthExpenses.reduce((s, e) => s + e.amountSpent, 0);

  // ── Derived metrics ───────────────────────────────────────────────────────
  const netProfit       = allTimeRevenue - totalAdSpend;
  const netProfitMargin = allTimeRevenue === 0 ? 0 : parseFloat(((netProfit / allTimeRevenue) * 100).toFixed(1));
  const roas            = totalAdSpend   === 0 ? 0 : parseFloat(((allTimeRevenue / totalAdSpend) * 100).toFixed(1));

  // ── Monetization score ────────────────────────────────────────────────────
  const hasCustomDomain = !!(process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost'));
  const hasGA4          = true; // Always true — installed in layout
  const blogTarget      = 15;
  const pageviewTarget  = 1000;

  const milestones: MonetizationMilestone[] = [
    {
      label: 'Custom Domain & SSL Active',
      achieved: hasCustomDomain,
      current: hasCustomDomain ? 1 : 0,
      target: 1,
      unit: 'domain',
    },
    {
      label: 'Google Analytics & GA4 Active',
      achieved: hasGA4,
      current: 1,
      target: 1,
      unit: 'integration',
    },
    {
      label: 'Published Blog / Case Study Posts',
      achieved: publishedBlogCount >= blogTarget,
      current: publishedBlogCount,
      target: blogTarget,
      unit: 'posts',
    },
    {
      label: 'Monthly Organic Pageviews (30d)',
      achieved: recentPageViews >= pageviewTarget,
      current: recentPageViews,
      target: pageviewTarget,
      unit: 'views',
    },
  ];

  // Weighted score: domain 20%, GA4 20%, blogs 30%, pageviews 30%
  const weights = [0.2, 0.2, 0.3, 0.3];
  const monetizationScore = Math.round(
    milestones.reduce((score, m, i) => {
      const progress = Math.min(m.current / m.target, 1);
      return score + progress * weights[i] * 100;
    }, 0)
  );

  // ── 6-month chart data ────────────────────────────────────────────────────
  const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const monthlyData: MonthlyDataPoint[] = Array.from({ length: 6 }, (_, i) => {
    const { start, end } = getMonthBoundaries(5 - i);
    const monthRev = allRevRecords
      .filter(r => r.receivedAt >= start && r.receivedAt <= end)
      .reduce((s, r) => s + r.amount, 0);
    const monthSpend = allExpenses
      .filter(e => e.date >= start && e.date <= end)
      .reduce((s, e) => s + e.amountSpent, 0);
    const margin = monthRev + monthSpend === 0 ? 0 : parseFloat(((monthRev - monthSpend) / (monthRev || 1) * 100).toFixed(1));

    return {
      month: SHORT_MONTHS[start.getMonth()],
      revenue: parseFloat(monthRev.toFixed(2)),
      spend: parseFloat(monthSpend.toFixed(2)),
      netMargin: margin,
    };
  });

  return {
    allTimeRevenue,
    thisMonthRevenue,
    lastMonthRevenue,
    revenueChangePercent,
    totalAdSpend,
    thisMonthSpend,
    netProfit,
    netProfitMargin,
    roas,
    monetizationScore,
    milestones,
    monthlyData,
  };
}

// ─── Mutation: Log Revenue ────────────────────────────────────────────────────

export async function logRevenueRecord(input: LogRevenueInput) {
  await prisma.revenueRecord.create({
    data: {
      title:      input.title,
      clientName: input.clientName,
      amount:     input.amount,
      type:       input.type,
      status:     input.status ?? 'PAID',
      notes:      input.notes,
      receivedAt: input.receivedAt ? new Date(input.receivedAt) : new Date(),
    },
  });
  revalidatePath('/admin');
  return { success: true };
}

// ─── Mutation: Log Expense ────────────────────────────────────────────────────

export async function logMarketingExpense(input: LogExpenseInput) {
  await prisma.marketingExpense.create({
    data: {
      campaign:    input.campaign,
      category:    input.category,
      amountSpent: input.amountSpent,
      clicks:      input.clicks ?? 0,
      impressions: input.impressions ?? 0,
      date:        input.date ? new Date(input.date) : new Date(),
    },
  });
  revalidatePath('/admin');
  return { success: true };
}
