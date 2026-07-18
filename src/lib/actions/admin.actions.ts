'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';



export async function getEmailTemplates() {
  try {
    const data = await prisma.emailTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveEmailTemplate(id: string | null, name: string, subject: string, htmlBody: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized.' };
  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    return { success: false, error: 'Forbidden.' };
  }

  try {
    if (id) {
      await prisma.emailTemplate.update({
        where: { id },
        data: { name, subject, html_body: htmlBody }
      });
    } else {
      await prisma.emailTemplate.create({
        data: { name, subject, html_body: htmlBody }
      });
    }

    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteEmailTemplate(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized.' };
  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    return { success: false, error: 'Forbidden.' };
  }

  try {
    await prisma.emailTemplate.delete({
      where: { id }
    });
    
    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function testSmtpConnection(smtpConfig: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized.' };
  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    return { success: false, error: 'Forbidden.' };
  }

  try {
    const nodemailer = (await import('nodemailer')).default;
    
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: parseInt(smtpConfig.port, 10),
      secure: parseInt(smtpConfig.port, 10) === 465,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.password,
      },
    });

    await transporter.verify();
    
    // Optionally, send a test email to the logged in user
    await transporter.sendMail({
      from: smtpConfig.user,
      to: session.user.email as string,
      subject: 'CoderNest SMTP Test Successful',
      text: 'If you are receiving this, your SMTP configuration is working perfectly!',
      html: '<p>If you are receiving this, your <strong>SMTP configuration</strong> is working perfectly!</p>',
    });

    return { success: true };
  } catch (err: any) {
    console.error('SMTP Error:', err);
    return { success: false, error: err.message || 'SMTP Verification failed' };
  }
}

export async function uploadProcessedImage(orderId: string, clientId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized.' };
  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    return { success: false, error: 'Forbidden.' };
  }

  const file = formData.get('file') as File;
  if (!file || file.size === 0) return { success: false, error: 'No file provided' };

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop();
    const fileName = `${orderId}_${Date.now()}.${fileExt}`;
    const uploadDir = path.join(process.cwd(), 'public/uploads/processed', clientId);
    
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), buffer);
    
    const processedUrl = `/uploads/processed/${clientId}/${fileName}`;

    await prisma.imageOrder.update({
      where: { id: orderId },
      data: {
        status: 'completed',
        processedUrl,
        completedAt: new Date(),
      }
    });

    revalidatePath('/admin/image-orders');
    return { success: true, processedUrl };
  } catch (err: any) {
    console.error('Upload Error:', err);
    return { success: false, error: err.message };
  }
}

export async function createInvoice(data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR')) return { success: false, error: 'Unauthorized.' };

  try {
    const inv = await prisma.invoice.create({
      data: {
        clientId: data.clientId || data.clientEmail,
        clientEmail: data.clientEmail,
        amount: parseFloat(data.amount),
        currency: data.currency,
        status: 'pending',
        paymentMethod: data.paymentMethod,
        stripePaymentLink: data.stripePaymentLink || null,
        paypalLink: data.paypalLink || null,
      }
    });

    revalidatePath('/admin/invoices');
    return { success: true, invoice: inv };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function markInvoicePaid(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR')) return { success: false, error: 'Unauthorized.' };

  try {
    await prisma.invoice.update({
      where: { id },
      data: { status: 'paid', paidAt: new Date() }
    });

    revalidatePath('/admin/invoices');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function saveBlogPost(data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR')) return { success: false, error: 'Unauthorized.' };

  try {
    await prisma.blog.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        authorId: session.user.id,
        status: 'draft',
      }
    });

    revalidatePath('/admin/blogs');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}


export async function updateProjectStatus(id: string, status: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR')) return { success: false, error: 'Unauthorized.' };

  try {
    await prisma.project.update({
      where: { id },
      data: { status }
    });

    revalidatePath('/admin/projects');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateProjectMilestones(id: string, milestones: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR')) return { success: false, error: 'Unauthorized.' };

  try {
    await prisma.project.update({
      where: { id },
      data: { milestones }
    });

    revalidatePath('/admin/projects');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

