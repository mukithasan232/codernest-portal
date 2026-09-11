/**
 * Invoice Retrieval & Printable View API
 * File: src/app/api/invoices/[id]/route.ts
 *
 * Returns formatted HTML invoice markup for printing or JSON data for dashboard rendering.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateInvoiceHtml } from '@/lib/invoice-generator';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let invoice = null;
    try {
      invoice = await prisma.invoice.findUnique({
        where: { id },
      });
    } catch {
      invoice = await prisma.invoice.findFirst({
        where: { id },
      });
    }

    if (!invoice) {
      return new NextResponse('Invoice not found', { status: 404 });
    }

    const format = req.nextUrl.searchParams.get('format');
    if (format === 'json') {
      return NextResponse.json({ success: true, invoice });
    }

    // Return HTML document for direct browser viewing / printing
    const htmlContent = invoice.invoiceHtml || generateInvoiceHtml({
      invoiceNumber: invoice.invoiceNumber || `CN-${invoice.id.slice(-6)}`,
      clientName: invoice.clientName || 'Valued Client',
      clientEmail: invoice.clientEmail || 'billing@codernest.agency',
      amount: invoice.amount,
      currency: invoice.currency,
      status: invoice.status as any,
      paymentMethod: invoice.paymentMethod,
      stripeSessionId: invoice.stripeSessionId,
      items: (invoice.items as any) || [
        {
          name: invoice.description || 'CoderNest Software Engineering Package',
          unitPrice: invoice.amount,
          total: invoice.amount,
          quantity: 1,
        },
      ],
      createdAt: invoice.createdAt,
      paidAt: invoice.paidAt,
    });

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error: unknown) {
    console.error('[/api/invoices/[id]] Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
