// src/lib/lead-capture-email.ts
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/resend';
import * as nodemailer from 'nodemailer';

const TRANSPARENT_PIXEL =
  '<img src="PIXEL_URL" width="1" height="1" alt="" style="display:none;width:1px;height:1px;border:0;" />';

function getAppBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://codernest.agency';
  return url.replace(/\/$/, '');
}

function isProxyEmail(email: string): boolean {
  const lower = email.toLowerCase();
  return (
    lower.endsWith('@codernest.lead') ||
    lower.includes('prospect_') ||
    lower.includes('@example.com') ||
    lower.startsWith('mock_')
  );
}

export interface TrackedLeadCaptureParams {
  leadId: string;
  name: string;
  email: string;
  company?: string | null;
  location?: string | null;
  visitedPages?: string[];
}

export interface TrackedLeadCaptureResult {
  trackingId: string | null;
  emailed: boolean;
  error?: string;
}

export async function sendTrackedLeadCaptureEmail(
  params: TrackedLeadCaptureParams
): Promise<TrackedLeadCaptureResult> {
  if (isProxyEmail(params.email)) {
    return { trackingId: null, emailed: false };
  }

  // 1. Locate or create outreach campaign for live traffic lead capture
  let campaign = await prisma.campaign.findFirst({
    where: { name: 'Live Traffic Lead Capture' },
  });

  if (!campaign) {
    campaign = await prisma.campaign.create({
      data: {
        name: 'Live Traffic Lead Capture',
        subject: 'CoderNest — Next-Gen B2B Product Engineering',
        totalSent: 0,
      },
    });
  }

  // 2. Generate unique tracking ID (UUID)
  const trackingId = randomUUID();

  // 3. Persist EmailTrackingLog in Prisma
  await prisma.emailTrackingLog.create({
    data: {
      trackingId,
      campaignId: campaign.id,
      leadId: params.leadId,
      status: 'SENT',
    },
  });

  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { totalSent: { increment: 1 } },
  });

  // 4. Construct email with transparent 1x1 tracking pixel
  const baseUrl = getAppBaseUrl();
  const pixelUrl = `${baseUrl}/api/track/email/${trackingId}`;
  const trackingPixelHtml = TRANSPARENT_PIXEL.replace('PIXEL_URL', pixelUrl);

  const pagesSummary = (params.visitedPages || []).slice(0, 5).join(', ') || 'our flagship services';
  const companyGreeting = params.company ? ` at ${params.company}` : '';
  const firstName = params.name.trim().split(' ')[0] || 'there';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>CoderNest Inquiry</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:24px auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
        <tr>
          <td style="padding:28px 36px;background:#0f172a;color:#ffffff;">
            <strong style="font-size:20px;letter-spacing:-0.5px;">CoderNest</strong>
            <span style="font-size:12px;color:#94a3b8;margin-left:8px;font-weight:500;">B2B Software Agency</span>
          </td>
        </tr>
        <tr>
          <td style="padding:36px;line-height:1.6;font-size:15px;color:#334155;">
            <p style="margin:0 0 16px;font-size:17px;font-weight:600;color:#0f172a;">
              Hi ${firstName},
            </p>
            <p style="margin:0 0 16px;">
              Thank you for exploring CoderNest${companyGreeting}. We noticed interest from ${params.location || 'your region'} reviewing <strong>${pagesSummary}</strong>.
            </p>
            <p style="margin:0 0 20px;">
              Whether you need enterprise-grade architectures like <strong>MedOS</strong> (our Hospital Management System), high-throughput transactional solutions like <strong>SMM Elite</strong> (Automated Agency Marketplace), media platforms like <strong>CoderNest Cinema</strong>, or custom Next.js App Router engineering, our senior engineers are ready to assist.
            </p>
            <div style="margin:28px 0;">
              <a href="${baseUrl}/contact" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:10px;">
                Schedule Engineering Consultation &rarr;
              </a>
            </div>
            <p style="margin:24px 0 0;font-size:13px;color:#64748b;border-top:1px solid #f1f5f9;padding-top:16px;">
              Direct inquiry reply will connect you with a Senior Solution Architect.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 36px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center;">
            &copy; ${new Date().getFullYear()} CoderNest Digital Solutions. All rights reserved.
          </td>
        </tr>
      </table>
      ${trackingPixelHtml}
    </body>
    </html>
  `;

  // 5. Send using Resend first, fallback to Nodemailer SMTP
  let emailSent = false;
  let lastError: string | undefined;

  try {
    const resendResult = await sendEmail({
      to: params.email,
      subject: 'Connecting with CoderNest — Project & Architecture Consultation',
      html,
    });

    if (resendResult.success) {
      emailSent = true;
    } else {
      lastError = typeof resendResult.error === 'string' ? resendResult.error : 'Resend dispatch failed';
      console.warn('[Lead Capture Email] Resend failed, trying Nodemailer SMTP fallback:', lastError);
    }
  } catch (err) {
    lastError = err instanceof Error ? err.message : 'Unknown Resend error';
    console.warn('[Lead Capture Email] Resend threw error, falling back to SMTP:', lastError);
  }

  // Fallback to Nodemailer SMTP if Resend did not succeed
  if (!emailSent) {
    try {
      const settings = await prisma.systemSettings.findUnique({
        where: { id: 'global_settings' },
      });

      if (settings?.smtpHost && settings?.smtpUser && settings?.smtpPassword) {
        const transporter = nodemailer.createTransport({
          host: settings.smtpHost,
          port: settings.smtpPort || 465,
          secure: settings.smtpPort === 465,
          auth: {
            user: settings.smtpUser,
            pass: settings.smtpPassword,
          },
        });

        await transporter.sendMail({
          from: `"${settings.siteName || 'CoderNest'}" <${settings.smtpUser}>`,
          to: params.email,
          subject: 'Connecting with CoderNest — Project & Architecture Consultation',
          html,
        });

        emailSent = true;
        lastError = undefined;
      }
    } catch (smtpErr) {
      console.error('[Lead Capture Email] Nodemailer SMTP fallback failed:', smtpErr);
      lastError = smtpErr instanceof Error ? smtpErr.message : 'SMTP fallback failed';
    }
  }

  return {
    trackingId,
    emailed: emailSent,
    error: lastError,
  };
}
