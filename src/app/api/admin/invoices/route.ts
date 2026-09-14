import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import nodemailer from 'nodemailer';
import { generateInvoiceHtml } from '@/lib/invoice-generator';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EMPLOYEE') {
      return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
    }

    const body = await req.json();
    const {
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      clientType,
      amount,
      currency,
      description,
      paymentMethod,
      sendEmail,
    } = body;

    if (!clientEmail || !amount) {
      return NextResponse.json({ success: false, error: 'Client email and amount are required' }, { status: 400 });
    }

    const invoiceNumber = `CN-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
    const parsedAmount = Math.round(Number(amount));

    const invoice = await prisma.invoice.create({
      data: {
        clientName: clientName || null,
        clientEmail: clientEmail,
        clientPhone: clientPhone || null,
        clientAddress: clientAddress || null,
        clientType: clientType || 'Local',
        amount: parsedAmount,
        currency: currency || 'USD',
        status: 'pending',
        invoiceNumber,
        description: description || 'Custom Agency Project Invoice',
        paymentMethod: paymentMethod || 'Stripe Card Payment',
      },
    });

    if (sendEmail) {
      const host = process.env.SMTP_HOST;
      const port = parseInt(process.env.SMTP_PORT || '587');
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;

      if (host && user && pass) {
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: {
            user,
            pass,
          },
        });

        const htmlContent = generateInvoiceHtml({
          invoiceNumber: invoice.invoiceNumber!,
          clientName: invoice.clientName || 'Valued Client',
          clientEmail: invoice.clientEmail!,
          clientPhone: invoice.clientPhone,
          clientAddress: invoice.clientAddress,
          clientType: invoice.clientType,
          amount: invoice.amount,
          currency: invoice.currency,
          status: invoice.status as any,
          paymentMethod: invoice.paymentMethod,
          items: [
            {
              name: invoice.description || 'CoderNest Software Engineering Package',
              unitPrice: invoice.amount,
              total: invoice.amount,
              quantity: 1,
            },
          ],
          createdAt: invoice.createdAt,
        });

        await transporter.sendMail({
          from: `"CoderNest" <${user}>`,
          to: invoice.clientEmail!,
          subject: `Invoice ${invoice.invoiceNumber} from CoderNest`,
          html: htmlContent,
        });
      } else {
        console.warn('SMTP credentials not configured, skipping email dispatch.');
      }
    }

    return NextResponse.json({ success: true, invoice });
  } catch (error: any) {
    console.error('[/api/admin/invoices POST] Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
