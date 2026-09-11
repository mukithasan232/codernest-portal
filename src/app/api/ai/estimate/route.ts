/**
 * AI Project Estimator & Lead Magnet API
 * File: src/app/api/ai/estimate/route.ts
 *
 * 1. Validates lead inputs (Name & Business Email required)
 * 2. Saves lead to Prisma database with 'new' status & 'AI Project Estimator' source
 * 3. Enrolls lead into Upstash Onboarding Workflow (triggerOnboardingWorkflow)
 * 4. Utilizes Google Gemini API / OpenAI / Expert Fallback to generate a comprehensive
 *    architectural blueprint, budget range, and milestone schedule.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { triggerOnboardingWorkflow } from '@/lib/workflow';
import OpenAI from 'openai';

export interface EstimateRequestPayload {
  name: string;
  email: string;
  company?: string;
  projectType: string;
  features: string[];
  timeline: string;
  customNotes?: string;
  targetBudget?: string;
}

export interface MilestoneItem {
  title: string;
  duration: string;
  deliverables: string[];
}

export interface EstimateResponseData {
  summary: string;
  recommendedTechStack: string[];
  architectureHighlights: string[];
  estimatedBudgetMin: number;
  estimatedBudgetMax: number;
  estimatedTimelineWeeks: string;
  milestones: MilestoneItem[];
  flagshipComparison: string;
  ctaProposal: string;
}

/**
 * Intelligent deterministic calculation fallback for high-precision estimates
 */
function generateFallbackEstimate(
  payload: EstimateRequestPayload
): EstimateResponseData {
  const basePrices: Record<string, { min: number; max: number; weeks: string }> = {
    'Next.js SaaS MVP': { min: 2800, max: 4800, weeks: '3–5 Weeks' },
    'Enterprise E-Commerce': { min: 3500, max: 6200, weeks: '4–6 Weeks' },
    'Custom Agency Portal': { min: 2400, max: 4200, weeks: '3–4 Weeks' },
    'Healthcare / MedOS-style Suite': { min: 4500, max: 8000, weeks: '5–8 Weeks' },
    'Automated Marketplace (SMM Elite)': { min: 3800, max: 6800, weeks: '4–7 Weeks' },
    'Mobile-Responsive Web Application': { min: 2000, max: 3500, weeks: '2–4 Weeks' },
  };

  const selectedBase = basePrices[payload.projectType] || { min: 2500, max: 4500, weeks: '3–5 Weeks' };

  // Feature multiplier
  const featureCost = (payload.features?.length || 0) * 350;
  const isRush = payload.timeline.toLowerCase().includes('rush');
  const rushMultiplier = isRush ? 1.25 : 1.0;

  const minBudget = Math.round((selectedBase.min + featureCost) * rushMultiplier);
  const maxBudget = Math.round((selectedBase.max + featureCost * 1.3) * rushMultiplier);

  return {
    summary: `Technical scoping for ${payload.company ? `${payload.company}'s` : 'your'} ${payload.projectType}. Architecture is optimized for high-concurrency serverless execution, real-time data sync, and enterprise security with Next.js App Router and Prisma ORM.`,
    recommendedTechStack: [
      'Next.js 16 (App Router)',
      'TypeScript (Strict Mode)',
      'Tailwind CSS & Framer Motion',
      'Prisma ORM & PostgreSQL / MongoDB',
      'Upstash Redis & QStash',
      'Stripe Payment Gateway',
    ],
    architectureHighlights: [
      'Distributed serverless edge computing with sub-50ms page hydration',
      'Role-based Access Control (RBAC) with cryptographic session tokens',
      'Asynchronous background job queuing and automated email webhooks via QStash',
      'Enterprise database indexing with connection pooling and automated backups',
    ],
    estimatedBudgetMin: minBudget,
    estimatedBudgetMax: maxBudget,
    estimatedTimelineWeeks: isRush ? '2–3 Weeks (Accelerated)' : selectedBase.weeks,
    milestones: [
      {
        title: 'Phase 1: Architecture & UI/UX Design System',
        duration: 'Week 1',
        deliverables: [
          'High-fidelity component wireframes & Tailwind theme',
          'Prisma data schema design & database indexing plan',
          'API contract and authentication layer setup',
        ],
      },
      {
        title: 'Phase 2: Core Engineering & Third-Party Integrations',
        duration: isRush ? 'Week 2' : 'Weeks 2–3',
        deliverables: [
          'Implementation of core features: ' + (payload.features?.slice(0, 3).join(', ') || 'Authentication & Dashboard'),
          'Payment gateway checkout and webhook listeners',
          'Upstash workflow pipelines & background workers',
        ],
      },
      {
        title: 'Phase 3: QA, Performance Hardening & Production Launch',
        duration: isRush ? 'Week 3' : 'Weeks 4–5',
        deliverables: [
          'End-to-end user testing & security audit',
          'Edge caching optimization & Core Web Vitals audit (95+ score)',
          'Production domain deployment and DNS propagation',
        ],
      },
    ],
    flagshipComparison: `Based on our architectural execution of MedOS (Hospital Management System) and SMM Elite (Automated Digital Marketplace), this architecture ensures enterprise stability under heavy user traffic.`,
    ctaProposal: `Ready to accelerate delivery? Book a 15-minute technical discovery session with our Lead Architect to finalize milestone dates and code delivery.`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const payload: EstimateRequestPayload = await req.json();
    const { name, email, company, projectType, features, timeline, customNotes, targetBudget } = payload;

    // 1. Validate Lead Gate
    if (!name || !email || !projectType) {
      return NextResponse.json(
        { error: 'Name, email, and project type are required to generate an estimate.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // 2. Save / Update Lead in Prisma CRM
    let lead = await prisma.lead.findFirst({
      where: { email: cleanEmail },
    });

    const leadRequirements = `Project: ${projectType} | Features: ${(features || []).join(', ')} | Timeline: ${timeline || 'Standard'}${customNotes ? ` | Notes: ${customNotes}` : ''}`;

    if (lead) {
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          name: cleanName,
          company: company || lead.company,
          serviceRequested: projectType,
          budget: targetBudget || lead.budget,
          message: leadRequirements,
          updatedAt: new Date(),
        },
      });
    } else {
      lead = await prisma.lead.create({
        data: {
          name: cleanName,
          email: cleanEmail,
          company: company || null,
          serviceRequested: projectType,
          budget: targetBudget || null,
          message: leadRequirements,
          source: 'AI Project Estimator',
          status: 'new',
        },
      });
    }

    // 3. Trigger Upstash Onboarding Workflow asynchronously
    triggerOnboardingWorkflow({
      leadId: lead.id,
      email: cleanEmail,
      name: cleanName,
      company: company || null,
      serviceRequested: projectType,
      source: 'AI Project Estimator',
      budget: targetBudget || null,
    }).catch((err) => {
      console.error('[AI Estimator] Failed to trigger onboarding workflow:', err);
    });

    // 4. Generate AI Estimate
    let estimate: EstimateResponseData;

    // Attempt Gemini API if key is present
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (geminiKey && !geminiKey.includes('dummy') && !geminiKey.includes('your_')) {
      try {
        const geminiPrompt = `
You are a Senior Principal Solutions Architect at 'CoderNest Digital Solutions' (flagship engineering: MedOS hospital suite, SMM Elite marketplace, CoderNest Cinema).
Generate a professional, realistic engineering project estimate for:
Client: ${cleanName} (${company || 'Company'})
Project Type: ${projectType}
Requested Capabilities: ${(features || []).join(', ')}
Timeline Constraint: ${timeline || 'Standard'}
Notes: ${customNotes || 'None'}

Return ONLY a valid JSON object matching this schema:
{
  "summary": "2-3 sentence executive technical summary",
  "recommendedTechStack": ["Next.js 16 (App Router)", "TypeScript", "Tailwind CSS", "Prisma ORM", "Upstash Redis & QStash", "Stripe API"],
  "architectureHighlights": ["4 bullet points on security, scaling, and data reliability"],
  "estimatedBudgetMin": 3000,
  "estimatedBudgetMax": 5500,
  "estimatedTimelineWeeks": "3–5 Weeks",
  "milestones": [
    { "title": "Phase 1: Architecture & UI System", "duration": "Week 1", "deliverables": ["...", "..."] },
    { "title": "Phase 2: Core Engineering & Integrations", "duration": "Weeks 2-3", "deliverables": ["...", "..."] },
    { "title": "Phase 3: QA, Performance & Launch", "duration": "Week 4", "deliverables": ["...", "..."] }
  ],
  "flagshipComparison": "Mention architectural parallels with MedOS or SMM Elite",
  "ctaProposal": "Compelling call to action to initiate discovery"
}
`;
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: geminiPrompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            estimate = JSON.parse(text);
          } else {
            throw new Error('Empty Gemini response');
          }
        } else {
          throw new Error(`Gemini API returned status ${geminiRes.status}`);
        }
      } catch (geminiErr) {
        console.warn('[AI Estimator] Gemini call failed, falling back:', geminiErr);
        estimate = generateFallbackEstimate(payload);
      }
    } else if (openaiKey && !openaiKey.includes('dummy') && !openaiKey.includes('your_')) {
      try {
        const openai = new OpenAI({ apiKey: openaiKey });
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                "You are an expert Solutions Architect at CoderNest. Generate a realistic, enterprise-level technical proposal for the client. Reference our flagship architectures: MedOS, SMM Elite, and CoderNest Cinema. Return pure JSON matching the specified schema.",
            },
            {
              role: 'user',
              content: `Client: ${cleanName}, Project: ${projectType}, Features: ${(features || []).join(', ')}, Timeline: ${timeline}`,
            },
          ],
          response_format: { type: 'json_object' },
        });

        estimate = JSON.parse(completion.choices[0].message.content || '{}');
      } catch (openaiErr) {
        console.warn('[AI Estimator] OpenAI call failed, falling back:', openaiErr);
        estimate = generateFallbackEstimate(payload);
      }
    } else {
      // Offline / Developer Deterministic Fallback
      estimate = generateFallbackEstimate(payload);
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      estimate,
    });
  } catch (error: unknown) {
    console.error('[/api/ai/estimate] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process project estimate',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
