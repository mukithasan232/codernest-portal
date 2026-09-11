/**
 * Stripe & Paddle Checkout Session Initiator API
 * File: src/app/api/create-checkout-session/route.ts
 *
 * Accepts project packages (e.g. Next.js Agency-in-a-Box Setup, Custom SaaS MVP)
 * and generates a secure Stripe Checkout Session URL with line items and CRM metadata.
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { getAppBaseUrl } from '@/lib/qstash';

export interface CheckoutRequestPayload {
  packageKey?: string;
  title: string;
  description?: string;
  amount: number;
  currency?: string;
  clientName: string;
  clientEmail: string;
  company?: string;
  leadId?: string;
  provider?: 'stripe' | 'paddle';
}

export async function POST(req: NextRequest) {
  try {
    const body: CheckoutRequestPayload = await req.json();
    const {
      packageKey = 'custom_package',
      title,
      description = 'CoderNest Digital Solutions Engineering Package',
      amount,
      currency = 'usd',
      clientName,
      clientEmail,
      company,
      leadId,
      provider = 'stripe',
    } = body;

    if (!title || !amount || !clientEmail) {
      return NextResponse.json(
        { error: 'Missing required parameters: title, amount, and clientEmail are required.' },
        { status: 400 }
      );
    }

    const appUrl = getAppBaseUrl();
    const numericAmount = Math.round(Number(amount));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: 'Invalid checkout amount.' }, { status: 400 });
    }

    const isStripeConfigured = Boolean(
      process.env.STRIPE_SECRET_KEY &&
      !process.env.STRIPE_SECRET_KEY.includes('dummy') &&
      !process.env.STRIPE_SECRET_KEY.includes('your_stripe')
    );

    // Resolve client ID (matching User or valid 24-char guest ObjectId)
    const matchingUser = await prisma.user.findFirst({ where: { email: clientEmail } });
    const resolvedClientId = matchingUser?.id || '000000000000000000000000';

    // If Stripe keys are missing in local dev, provide a simulated checkout response
    if (!isStripeConfigured) {
      console.warn('[Checkout] STRIPE_SECRET_KEY not configured. Generating simulated test session.');

      // Pre-create pending invoice in database for local inspection
      const simulatedInvNumber = `INV-${Date.now().toString().slice(-6)}`;
      let mockInvoice: any;
      try {
        mockInvoice = await (prisma.invoice as any).create({
          data: {
            clientId: resolvedClientId,
            clientName,
            clientEmail,
            amount: numericAmount,
            currency: currency.toUpperCase(),
            status: 'pending',
            invoiceNumber: simulatedInvNumber,
            description: title,
            paymentMethod: `${provider.toUpperCase()} (Sandbox Simulator)`,
          },
        });
      } catch {
        mockInvoice = await prisma.invoice.create({
          data: {
            clientId: resolvedClientId,
            clientEmail,
            amount: numericAmount,
            currency: currency.toUpperCase(),
            status: 'pending',
            paymentMethod: `${provider.toUpperCase()}: ${title}`,
          },
        });
      }

      return NextResponse.json({
        success: true,
        mock: true,
        sessionId: `cs_simulated_${Date.now()}`,
        url: `${appUrl}/admin/invoices?mock_checkout=success&invoice_id=${mockInvoice.id}`,
        message: 'Sandbox checkout session initiated (Stripe keys not set in env).',
      });
    }

    // 1. Create a draft invoice in Prisma to track pending status
    const invoiceNumber = `CN-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
    let draftInvoice: any;
    try {
      draftInvoice = await (prisma.invoice as any).create({
        data: {
          clientId: resolvedClientId,
          clientName,
          clientEmail,
          amount: numericAmount,
          currency: currency.toUpperCase(),
          status: 'pending',
          invoiceNumber,
          description: title,
          paymentMethod: 'Stripe Card Payment',
          items: [
            {
              name: title,
              description,
              quantity: 1,
              unitPrice: numericAmount,
              total: numericAmount,
            },
          ],
        },
      });
    } catch {
      draftInvoice = await prisma.invoice.create({
        data: {
          clientId: resolvedClientId,
          clientEmail,
          amount: numericAmount,
          currency: currency.toUpperCase(),
          status: 'pending',
          paymentMethod: 'Stripe Card Payment',
        },
      });
    }

    // 2. Create Real Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: clientEmail,
      client_reference_id: draftInvoice.id,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: title,
              description: description || 'CoderNest Digital Solutions Enterprise Engineering Package',
              images: ['https://codernest.agency/opengraph-image.jpg'],
            },
            unit_amount: numericAmount * 100, // Cents
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/admin/invoices?session_id={CHECKOUT_SESSION_ID}&success=true&inv=${draftInvoice.id}`,
      cancel_url: `${appUrl}/pricing?cancelled=true`,
      metadata: {
        invoiceId: draftInvoice.id,
        invoiceNumber,
        packageKey,
        clientName: clientName || '',
        clientEmail,
        company: company || '',
        leadId: leadId || '',
        title,
      },
    });

    // 3. Update invoice with Stripe session ID & link
    await prisma.invoice.update({
      where: { id: draftInvoice.id },
      data: {
        stripeSessionId: session.id,
        stripePaymentLink: session.url || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      invoiceId: draftInvoice.id,
      invoiceNumber,
    });
  } catch (error: unknown) {
    console.error('[/api/create-checkout-session] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to initiate checkout session.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
