'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export interface CsvLeadRow {
  name: string;
  email: string;
  company?: string;
  title?: string;   // job title from Apollo — mapped to serviceRequested
  source?: string;
}

export interface BulkImportResult {
  success: boolean;
  count?: number;
  error?: string;
}

/**
 * Bulk-imports leads parsed from a CSV file (e.g. from Apollo.io export).
 * Manually deduplicates by email before inserting since MongoDB's Prisma
 * adapter does not support the skipDuplicates option on createMany.
 */
export async function bulkImportLeads(
  rows: CsvLeadRow[]
): Promise<BulkImportResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: 'Unauthorized.' };
  }
  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    return { success: false, error: 'Forbidden.' };
  }

  if (!rows || rows.length === 0) {
    return { success: false, error: 'No rows to import.' };
  }

  // Validate & sanitize — drop any row missing name or a valid email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validRows = rows.filter(
    (r) => r.name?.trim() && r.email?.trim() && emailRegex.test(r.email.trim())
  );

  if (validRows.length === 0) {
    return {
      success: false,
      error: 'No valid rows found. Ensure every row has a Name and valid Email.',
    };
  }

  try {
    const data = validRows.map((r) => ({
      name: r.name.trim(),
      email: r.email.trim().toLowerCase(),
      company: r.company?.trim() || null,
      // Apollo exports "Title" (job title). We store it in serviceRequested
      // as that's the closest semantic match in the Lead schema.
      serviceRequested: r.title?.trim() || null,
      source: r.source?.trim() || 'CSV Import',
      status: 'new',
      message: null,
      budget: null,
    }));

    // MongoDB's Prisma adapter doesn't support skipDuplicates on createMany.
    // Manually deduplicate: fetch existing emails from this batch, then filter.
    const incomingEmails = data.map((d) => d.email);
    const existing = await prisma.lead.findMany({
      where: { email: { in: incomingEmails } },
      select: { email: true },
    });
    const existingSet = new Set(existing.map((e) => e.email));
    const newRows = data.filter((d) => !existingSet.has(d.email));

    if (newRows.length === 0) {
      revalidatePath('/admin/leads');
      return { success: true, count: 0 };
    }

    const result = await prisma.lead.createMany({ data: newRows });

    revalidatePath('/admin/leads');
    return { success: true, count: result.count };
  } catch (error: unknown) {
    console.error('[bulkImportLeads] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Database error during import.',
    };
  }
}
