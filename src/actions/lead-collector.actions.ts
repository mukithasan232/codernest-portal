'use server';

import { prisma } from '@/lib/prisma';
import { normalizeLeadData, RawLeadData, LeadValidationError } from '@/lib/lead-normalizer';

// ─── Proxy Email Guard ────────────────────────────────────────────────────────
// Returns true for system-generated anonymous placeholder addresses that should
// never receive automated outreach emails.
function isProxyEmail(email: string): boolean {
  const lower = email.toLowerCase();
  return (
    lower.endsWith('@codernest.lead') ||
    lower.includes('prospect_')       ||
    lower.includes('@example.com')    ||
    lower.startsWith('mock_')
  );
}

export async function saveScrapedLead(rawLeadData: RawLeadData) {
  try {
    // 1. Parse and Normalize Data
    const leadData = normalizeLeadData(rawLeadData);

    // 2. Check for existing lead by email to prevent duplicates and update activity if found
    const existing = await prisma.lead.findFirst({
      where: { email: leadData.email }
    });

    if (existing) {
      await prisma.lead.update({
        where: { id: existing.id },
        data: { updatedAt: new Date() } // Update activity timestamp
      });
      return { 
        success: true, 
        message: 'Lead already exists, updated activity.',
        lead: existing 
      };
    }

    // 3. Save new lead to database
    const newLead = await prisma.lead.create({
      data: {
        name: leadData.name,
        email: leadData.email,
        source: leadData.source,
        message: leadData.requirements,
        budget: leadData.budget || undefined,
        status: 'new'
      }
    });

    // 4. Proxy email check — lead is saved but flag caller to skip auto-dispatch
    if (isProxyEmail(leadData.email)) {
      console.log('[LEAD COLLECTED — PROXY EMAIL, NO DISPATCH]:', newLead.email);
      return {
        success: true,
        isProxyEmail: true,
        message: 'CRM_PROXY_SAVED',
        lead: newLead,
      };
    }

    console.log('[LEAD COLLECTED SUCCESS]:', newLead.email);
    return { success: true, isProxyEmail: false, lead: newLead };
  } catch (error: any) {
    console.error('[LEAD COLLECTION ERROR]:', error);
    
    if (error instanceof LeadValidationError) {
      return { success: false, error: error.message };
    }

    return { success: false, error: error.message || 'Failed to sync lead into CoderNest CRM.' };
  }
}

export async function getRecentLeads(limit: number = 5) {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });
    return { success: true, leads };
  } catch (error: any) {
    console.error('[FETCH LEADS ERROR]:', error);
    return { success: false, error: 'Failed to fetch recent leads.' };
  }
}
