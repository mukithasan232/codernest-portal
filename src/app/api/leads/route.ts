import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { triggerOnboardingWorkflow } from '@/lib/workflow';

export async function POST(request: Request) {
  try {
    // 1. Verify API Key
    const authHeader = request.headers.get('authorization');
    const expectedKey = process.env.LEADS_API_KEY;

    if (!expectedKey) {
      console.error('LEADS_API_KEY is not configured on the server.');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse Body
    const body = await request.json();
    const { name, email, serviceRequested, message, source, company, budget } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    // 3. Insert Lead
    const newLead = await prisma.lead.create({
      data: {
        name,
        email,
        company: company || null,
        message: message || null,
        budget: budget || null,
        serviceRequested: serviceRequested || null,
        source: source || 'Main B2B Agency',
      },
    });

    // Trigger durable onboarding workflow via Upstash Workflow
    triggerOnboardingWorkflow({
      leadId: newLead.id,
      email: newLead.email,
      name: newLead.name,
      company: newLead.company,
      serviceRequested: newLead.serviceRequested,
      source: newLead.source,
      budget: newLead.budget,
    }).catch((err) => console.error('[Leads API] Failed to trigger onboarding workflow:', err));

    return NextResponse.json({ success: true, data: newLead }, { status: 201 });
  } catch (error: unknown) {
    console.error('Leads API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}
