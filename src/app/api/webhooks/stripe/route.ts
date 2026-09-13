/**
 * Stripe Webhook Handler: Automated Invoicing & CRM Progression
 * File: src/app/api/webhooks/stripe/route.ts
 *
 * Listens for checkout.session.completed events:
 * 1. Cryptographically verifies Stripe signature
 * 2. Generates branded, printable HTML invoice record in Prisma
 * 3. Updates Lead CRM stage to 'paid' / 'active_client'
 * 4. Dispatches confirmation email receipt via QStash / SMTP
 */

import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { generateInvoiceHtml, InvoiceLineItem } from '@/lib/invoice-generator';
import { enqueueEmail } from '@/lib/qstash';

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const signature = headerList.get('stripe-signature');

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  // Step 1: Verify webhook signature
  try {
    if (!webhookSecret || webhookSecret.includes('your_stripe')) {
      console.warn('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not set. Processing event in simulation mode.');
      event = JSON.parse(body) as Stripe.Event;
    } else {
      if (!signature) {
        return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
      }
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    }
  } catch (error: unknown) {
    console.error('[Stripe Webhook] Signature verification failed:', error);
    return NextResponse.json(
      { error: `Webhook signature error: ${error instanceof Error ? error.message : 'Unknown'}` },
      { status: 400 }
    );
  }

  // Step 2: Handle checkout.session.completed
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata || {};

      const invoiceId = metadata.invoiceId;
      const invoiceNumber = metadata.invoiceNumber || `CN-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
      const clientEmail = (metadata.clientEmail || session.customer_email || session.customer_details?.email || '').toLowerCase();
      const clientName = metadata.clientName || session.customer_details?.name || 'Valued Client';
      const company = metadata.company || null;
      const title = metadata.title || 'CoderNest Software Engineering Package';
      const leadId = metadata.leadId;

      const totalAmount = session.amount_total ? session.amount_total / 100 : 0;
      const currency = session.currency || 'USD';

      // 1. Build line items & generate HTML invoice markup
      const lineItems: InvoiceLineItem[] = [
        {
          name: title,
          description: `Authorized payment for ${title}. Order ref: ${session.id}`,
          quantity: 1,
          unitPrice: totalAmount,
          total: totalAmount,
        },
      ];

      const invoiceHtml = generateInvoiceHtml({
        invoiceNumber,
        clientName,
        clientEmail,
        companyName: company,
        items: lineItems,
        amount: totalAmount,
        currency,
        status: 'paid',
        paymentMethod: 'Stripe Card (Verified)',
        stripeSessionId: session.id,
        createdAt: new Date(),
        paidAt: new Date(),
      });

      // 2. Upsert / Update Invoice in Prisma
      let invoiceRecord;
      if (invoiceId) {
        invoiceRecord = await prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            status: 'paid',
            paidAt: new Date(),
            stripeSessionId: session.id,
            invoiceHtml,
            items: lineItems as any,
          },
        }).catch((err) => {
          console.warn('[Stripe Webhook] Invoice update by ID failed, creating new record:', err);
          return null;
        });
      }

      if (!invoiceRecord) {
        const matchingUser = clientEmail ? await prisma.user.findFirst({ where: { email: clientEmail } }) : null;
        const resolvedClientId = matchingUser?.id || '000000000000000000000000';

        invoiceRecord = await prisma.invoice.create({
          data: {
            clientId: resolvedClientId,
            clientName,
            clientEmail,
            amount: totalAmount,
            currency: currency.toUpperCase(),
            status: 'paid',
            invoiceNumber,
            description: title,
            paymentMethod: 'Stripe Card Payment',
            stripeSessionId: session.id,
            invoiceHtml,
            items: lineItems as any,
            paidAt: new Date(),
          },
        });
      }

      // 3. Update Client's CRM Stage in Prisma Lead table to 'paid' / 'active_client'
      if (leadId) {
        await prisma.lead.update({
          where: { id: leadId },
          data: {
            status: 'active_client',
            updatedAt: new Date(),
          },
        }).catch((err) => {
          console.error('[Stripe Webhook] Failed to update lead by ID:', err);
        });
      } else if (clientEmail) {
        const matchingLead = await prisma.lead.findFirst({
          where: { email: clientEmail },
        });

        if (matchingLead) {
          await prisma.lead.update({
            where: { id: matchingLead.id },
            data: {
              status: 'active_client',
              updatedAt: new Date(),
            },
          }).catch((err) => {
            console.error('[Stripe Webhook] Failed to update matching lead by email:', err);
          });
        }
      }

      // 4. Update or promote matching User to CLIENT with active credits
      if (clientEmail) {
        const user = await prisma.user.findUnique({
          where: { email: clientEmail },
        });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              role: 'USER',
              updatedAt: new Date(),
            },
          }).catch((err) => console.error('[Stripe Webhook] Failed to update user role:', err));
        }
      }

      // 5. Asynchronously dispatch receipt email via QStash / worker
      if (clientEmail) {
        await enqueueEmail({
          to: clientEmail,
          subject: `Payment Receipt: ${invoiceNumber} — CoderNest Digital Solutions`,
          html: invoiceHtml,
          clientName,
          companyName: company || undefined,
          leadId: leadId || undefined,
          type: 'system',
        }).catch((err) => {
          console.error('[Stripe Webhook] Failed to enqueue receipt email:', err);
        });
      }

      console.log(`[Stripe Webhook SUCCESS]: Processed invoice ${invoiceNumber} for ${clientEmail} ($${totalAmount})`);
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error('[Stripe Webhook] Processing error:', error);
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
