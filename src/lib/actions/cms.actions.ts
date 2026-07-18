'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function getCmsEntries(collectionName: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized' };

  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    return { success: false, error: 'Forbidden' };
  }

  try {
    let data;
    switch (collectionName) {
      case 'blogs':
        data = await prisma.blog.findMany({ orderBy: { createdAt: 'desc' } });
        break;
      case 'case_studies':
        data = await prisma.caseStudy.findMany({ orderBy: { createdAt: 'desc' } });
        break;
      case 'service_pricing':
        data = await prisma.servicePricing.findMany({ orderBy: { createdAt: 'desc' } });
        break;
      case 'testimonials':
        data = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
        break;
      default:
        return { success: false, error: 'Invalid collection' };
    }
    return { success: true, data };
  } catch (error: any) {
    console.error(`Fetch Error in ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
}

export async function createCmsEntry(collectionName: string, payload: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized' };
  
  // ensure admin
  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    return { success: false, error: 'Forbidden' };
  }

  try {
    let result;
    switch (collectionName) {
      case 'blogs':
        // Handle authorId for blogs
        const blogPayload = { ...payload, authorId: session.user.id };
        result = await prisma.blog.create({ data: blogPayload });
        break;
      case 'case_studies':
        result = await prisma.caseStudy.create({ data: payload });
        break;
      case 'service_pricing':
        result = await prisma.servicePricing.create({ data: payload });
        break;
      case 'testimonials':
        result = await prisma.testimonial.create({ data: payload });
        break;
      default:
        return { success: false, error: 'Invalid collection' };
    }
    revalidatePath('/admin/cms');
    return { success: true, data: result };
  } catch (error: any) {
    console.error(`Create Error in ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
}

export async function updateCmsEntry(collectionName: string, id: string, payload: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized' };

  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    return { success: false, error: 'Forbidden' };
  }

  try {
    // Remove properties that shouldn't be updated directly like id
    const { id: _, author, ...updateData } = payload;
    let result;
    switch (collectionName) {
      case 'blogs':
        result = await prisma.blog.update({ where: { id }, data: updateData });
        break;
      case 'case_studies':
        result = await prisma.caseStudy.update({ where: { id }, data: updateData });
        break;
      case 'service_pricing':
        result = await prisma.servicePricing.update({ where: { id }, data: updateData });
        break;
      case 'testimonials':
        result = await prisma.testimonial.update({ where: { id }, data: updateData });
        break;
      default:
        return { success: false, error: 'Invalid collection' };
    }
    revalidatePath('/admin/cms');
    return { success: true, data: result };
  } catch (error: any) {
    console.error(`Update Error in ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
}

export async function deleteCmsEntry(collectionName: string, id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized' };

  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    return { success: false, error: 'Forbidden' };
  }

  try {
    let result;
    switch (collectionName) {
      case 'blogs':
        result = await prisma.blog.delete({ where: { id } });
        break;
      case 'case_studies':
        result = await prisma.caseStudy.delete({ where: { id } });
        break;
      case 'service_pricing':
        result = await prisma.servicePricing.delete({ where: { id } });
        break;
      case 'testimonials':
        result = await prisma.testimonial.delete({ where: { id } });
        break;
      default:
        return { success: false, error: 'Invalid collection' };
    }
    revalidatePath('/admin/cms');
    return { success: true, data: result };
  } catch (error: any) {
    console.error(`Delete Error in ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
}

export async function updatePricingOrder(items: { id: string, displayOrder: number }[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized' };

  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    return { success: false, error: 'Forbidden' };
  }

  try {
    const transactions = items.map(item =>
      prisma.servicePricing.update({
        where: { id: item.id },
        data: { displayOrder: item.displayOrder },
      })
    );
    await prisma.$transaction(transactions);
    revalidatePath('/admin/cms');
    revalidatePath('/pricing');
    return { success: true };
  } catch (error: any) {
    console.error('Update Pricing Order Error:', error);
    return { success: false, error: error.message };
  }
}
