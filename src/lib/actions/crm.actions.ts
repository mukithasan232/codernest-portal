'use server';

import { prisma } from '@/lib/prisma';
import { sendEmail } from "@/lib/resend";
import { revalidatePath } from 'next/cache';
import { LeadStatus } from '@/types';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function createLead(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const company = formData.get('company') as string;
  const message = formData.get('message') as string;

  if (!name || !email || !message) {
    return { success: false, error: 'Missing required fields.' };
  }

  try {
    await prisma.lead.create({
      data: { name, email, company, message },
    });

    // Send auto-email to client
    await sendEmail({
      to: email,
      subject: "Thanks for reaching out to CoderNest!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #3b82f6;">Hi ${name},</h2>
          <p>Thanks for contacting CoderNest! We've received your message and our team is already reviewing it.</p>
          <p>We'll get back to you within 24 hours to discuss how we can help with your project.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">This is an automated confirmation. No need to reply to this email.</p>
        </div>
      `,
    });

    // Notify admin
    await sendEmail({
      to: "admin@codernest.agency",
      subject: `New Lead: ${name}`,
      html: `
        <div style="font-family: sans-serif;">
          <h2>New Lead Captured</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Company:</strong> ${company || "N/A"}</p>
          <p><strong>Message:</strong> ${message}</p>
          <br />
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/leads" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View in Admin Panel</a>
        </div>
      `,
    });

    revalidatePath('/admin/leads');
    return { success: true };
  } catch (error: any) {
    console.error('Lead Insert Error:', error);
    return { success: false, error: 'Failed to submit lead.' };
  }
}

export async function getLeads() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized' };

  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });
    // Serialize object ids if needed, but since it's Next 14/15 RSC, plain objects work if we don't pass dates/functions. Wait, dates are passed.
    // RSC supports dates, but passing them to Client Components might require serialization. Let's return them.
    return { success: true, data: leads };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized' };

  try {
    await prisma.lead.update({
      where: { id },
      data: { status },
    });
    revalidatePath('/crm');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteLead(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized' };

  try {
    await prisma.lead.delete({
      where: { id },
    });
    revalidatePath('/crm');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
