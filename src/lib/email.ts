import * as nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

interface NotificationPayload {
  to?: string;
  subject: string;
  title: string;
  message: string;
  dataSummary?: Record<string, any>;
}

export async function sendOfficialNotification(payload: NotificationPayload) {
  try {
    // 1. Fetch System Settings to dynamically configure SMTP and branding
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'global_settings' },
    });

    if (!settings || !settings.smtpHost || !settings.smtpUser || !settings.smtpPassword) {
      throw new Error('SMTP settings are not fully configured in the Global Settings CMS.');
    }

    // 2. Create Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort || 465,
      secure: (settings.smtpPort === 465), // true for 465, false for other ports
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPassword,
      },
    });

    // 3. Construct the dynamic HTML Email Template
    const systemName = settings.siteName || 'CoderNest Digital Solutions';
    const logoUrl = settings.logoUrl || 'https://via.placeholder.com/150x50?text=System+Logo';
    const primaryColor = settings.brandColor || '#3B82F6';
    const secondaryColor = settings.secondaryColor || '#00F2FE';
    const supportEmail = settings.supportEmail || settings.primaryEmail || 'support@codernest.agency';

    // Format Data Summary if provided
    let dataSummaryHtml = '';
    if (payload.dataSummary && Object.keys(payload.dataSummary).length > 0) {
      dataSummaryHtml = `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-top: 24px;">
          <h3 style="margin-top: 0; color: #1e293b; font-size: 16px; margin-bottom: 12px;">Data Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              ${Object.entries(payload.dataSummary).map(([key, value]) => `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px; font-weight: 600; width: 40%; text-transform: capitalize;">${key}</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px;">${String(value)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${payload.subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                
                <!-- HEADER -->
                <tr>
                  <td align="center" style="padding: 32px 40px; background: linear-gradient(to right, ${secondaryColor}, ${primaryColor});">
                    <img src="${logoUrl}" alt="${systemName} Logo" style="max-height: 50px; max-width: 200px; display: block; border: 0;" />
                  </td>
                </tr>
                
                <!-- BODY -->
                <tr>
                  <td style="padding: 40px;">
                    <h1 style="margin: 0 0 16px; font-size: 24px; color: #0f172a; font-weight: 700;">${payload.title}</h1>
                    <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569;">
                      ${payload.message.replace(/\n/g, '<br />')}
                    </p>
                    
                    ${dataSummaryHtml}
                    
                    <p style="margin: 32px 0 0; font-size: 14px; line-height: 1.5; color: #64748b;">
                      This is an automated official notification from ${systemName}. Please do not reply directly to this email unless specified.
                    </p>
                  </td>
                </tr>
                
                <!-- FOOTER -->
                <tr>
                  <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 13px; color: #94a3b8; font-weight: 600;">
                      ${systemName} &copy; ${new Date().getFullYear()}
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                      Need help? Contact our support team at <a href="mailto:${supportEmail}" style="color: ${primaryColor}; text-decoration: none;">${supportEmail}</a>
                    </p>
                    ${settings.address ? `<p style="margin: 8px 0 0; font-size: 12px; color: #cbd5e1;">${settings.address}</p>` : ''}
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // 4. Send Email
    const info = await transporter.sendMail({
      from: `"${systemName} System" <${settings.smtpUser}>`,
      to: payload.to || settings.primaryEmail || settings.smtpUser,
      subject: payload.subject,
      html: htmlTemplate,
    });

    return { success: true, messageId: info.messageId };

  } catch (error: any) {
    console.error('Failed to send official notification:', error);
    return { success: false, error: error.message };
  }
}
