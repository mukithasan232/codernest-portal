import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import { verifyQStashSignature, EmailJobPayload } from '@/lib/qstash';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // 1. Cryptographic Signature Verification
    const verification = await verifyQStashSignature(req, rawBody);
    if (!verification.isValid) {
      console.warn('[QStash Worker] Signature rejected:', verification.error);
      return NextResponse.json({ error: verification.error || 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse Validated Payload
    let payload: EmailJobPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { to, subject, html, text, leadId, campaignId, type, attachments } = payload;

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json({ error: 'Missing required email fields (to, subject, html/text)' }, { status: 400 });
    }

    // 3. Load Global SMTP Settings
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'global_settings' },
    });

    const smtpHost = settings?.smtpHost || process.env.SMTP_HOST;
    const smtpPort = settings?.smtpPort || parseInt(process.env.SMTP_PORT || '465');
    const smtpUser = settings?.smtpUser || process.env.SMTP_USER;
    const smtpPass = settings?.smtpPassword || process.env.SMTP_PASS;
    const siteName = settings?.siteName || 'CoderNest Digital Solutions';

    const isMock =
      !smtpHost ||
      !smtpUser ||
      !smtpPass ||
      smtpHost.includes('example.com') ||
      smtpHost.includes('mock');

    if (isMock) {
      console.log('\n--- [QStash Worker] MOCK EMAIL DISPATCH ---');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Type: ${type || 'general'}`);
      console.log(`Attachments: ${attachments?.length || 0} files`);
      console.log(`Snippet: ${(html || text || '').substring(0, 120)}...`);
      console.log('-------------------------------------------\n');

      if (campaignId && leadId) {
        const existingLog = await prisma.emailTrackingLog.findFirst({
          where: { campaignId, leadId }
        });
        if (!existingLog) {
          await prisma.emailTrackingLog.create({
            data: { campaignId, leadId, status: 'SENT' },
          }).catch(err => console.error('[QStash Worker] Failed to log tracking:', err));
        }
      }

      return NextResponse.json({
        success: true,
        mock: true,
        message: 'Mock email dispatched and logged (no active SMTP host).',
      });
    }

    // 4. Initialize Production Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const nodemailerAttachments = attachments && attachments.length > 0
      ? attachments.map((att) => ({
          filename: att.filename,
          content: Buffer.from(att.content, 'base64'),
          contentType: att.contentType,
        }))
      : undefined;

    // 5. Send Individual Message
    const info = await transporter.sendMail({
      from: `"${siteName}" <${smtpUser}>`,
      to,
      subject,
      html: html || undefined,
      text: text || undefined,
      attachments: nodemailerAttachments,
    });

    // 6. Record Tracking Log & CRM Status Updates
    if (campaignId && leadId) {
      const existingLog = await prisma.emailTrackingLog.findFirst({
        where: { campaignId, leadId }
      });
      if (!existingLog) {
        await prisma.emailTrackingLog.create({
          data: { campaignId, leadId, status: 'SENT' },
        }).catch(err => console.error('[QStash Worker] Failed to save tracking log:', err));
      }
    }

    if (leadId && type === 'onboarding') {
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          status: 'contacted',
          updatedAt: new Date(),
        },
      }).catch(err => console.error('[QStash Worker] Failed to update lead status:', err));
    }

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
    });
  } catch (error: unknown) {
    console.error('[QStash Worker] Error dispatching email:', error);
    return NextResponse.json(
      {
        error: 'Failed to process email delivery',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
