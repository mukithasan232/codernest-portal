'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function getLeadsForCampaign() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR')) {
      return { success: false, data: [] };
    }

    const leads = await prisma.lead.findMany({
      select: { id: true, name: true, email: true, company: true },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: leads };
  } catch (error) {
    console.error('Failed to fetch leads for campaign:', error);
    return { success: false, data: [] };
  }
}

export async function sendEmailCampaignAction(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR')) {
      return { error: 'Unauthorized' };
    }

    const subject = formData.get('subject') as string;
    const audience = formData.get('audience') as string;
    const body = formData.get('body') as string;

    if (!subject || !audience || !body) {
      return { error: 'All fields are required.' };
    }

    // Resolve audience to emails and details
    let targetLeads: { email: string; name?: string | null; company?: string | null }[] = [];
    
    if (audience === 'all_leads') {
      targetLeads = await prisma.lead.findMany({ select: { email: true, name: true, company: true } });
    } else if (audience.startsWith('lead_')) {
      const leadId = audience.replace('lead_', '');
      const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { email: true, name: true, company: true } });
      if (lead) targetLeads = [lead];
    } else {
      // For usa_leads, uk_leads, past_clients (Static mock resolution for now)
      targetLeads = [{ email: `mock_${audience}@example.com`, name: 'Mock User', company: 'Mock Inc' }];
    }

    if (targetLeads.length === 0) {
      return { error: 'Selected audience has no valid email addresses.' };
    }

    // Fetch SMTP Settings from Prisma
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'global_settings' }
    });

    if (!settings?.smtpHost || !settings?.smtpUser || !settings?.smtpPassword) {
      return { error: 'SMTP settings are not fully configured in System Settings. Please set Host, User, and Password.' };
    }

    // Setup Nodemailer Transport
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort || 465,
      secure: settings.smtpPort === 465,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPassword,
      },
    });

    // Send emails in parallel or batch (Using a simple loop for now)
    const sendPromises = targetLeads.map(lead => {
      // Dynamic Variable Replacements
      const clientName = lead.name || 'there';
      const companyName = lead.company || 'your company';

      const personalizedBody = body
        .replace(/\[Client Name\]/gi, clientName)
        .replace(/\{\{name\}\}/gi, clientName)
        .replace(/\[Company Name\]/gi, companyName)
        .replace(/\{\{company\}\}/gi, companyName);

      return transporter.sendMail({
        from: `"${settings.siteName}" <${settings.smtpUser}>`,
        to: lead.email,
        subject: subject,
        html: personalizedBody,
      });
    });

    await Promise.all(sendPromises);

    return { success: true, message: `Campaign successfully sent to ${targetLeads.length} recipients.` };
    
  } catch (error: any) {
    console.error('Failed to send campaign:', error);
    return { error: error.message || 'Failed to send emails.' };
  }
}
