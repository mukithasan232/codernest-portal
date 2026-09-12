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
      case 'photo_services':
        data = await prisma.photoService.findMany({ orderBy: { order: 'asc' } });
        break;
      case 'pricing_plans':
        data = await prisma.pricingPlan.findMany({ orderBy: { order: 'asc' } });
        break;
      case 'before_after_showcase':
        data = await prisma.beforeAfterShowcase.findMany({ orderBy: { order: 'asc' } });
        break;
      default:
        return { success: false, error: 'Invalid collection' };
    }
    return { success: true, data };
  } catch (error: unknown) {
    console.error(`Fetch Error in ${collectionName}:`, error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
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
      case 'photo_services':
        result = await prisma.photoService.create({ data: payload });
        break;
      case 'pricing_plans':
        result = await prisma.pricingPlan.create({ data: payload });
        break;
      case 'before_after_showcase':
        result = await prisma.beforeAfterShowcase.create({ data: payload });
        break;
      default:
        return { success: false, error: 'Invalid collection' };
    }
    revalidatePath('/', 'layout');
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error(`Create Error in ${collectionName}:`, error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
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
      case 'photo_services':
        result = await prisma.photoService.update({ where: { id }, data: updateData });
        break;
      case 'pricing_plans':
        result = await prisma.pricingPlan.update({ where: { id }, data: updateData });
        break;
      case 'before_after_showcase':
        result = await prisma.beforeAfterShowcase.update({ where: { id }, data: updateData });
        break;
      default:
        return { success: false, error: 'Invalid collection' };
    }
    revalidatePath('/', 'layout');
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error(`Update Error in ${collectionName}:`, error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
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
      case 'photo_services':
        result = await prisma.photoService.delete({ where: { id } });
        break;
      case 'pricing_plans':
        result = await prisma.pricingPlan.delete({ where: { id } });
        break;
      case 'before_after_showcase':
        result = await prisma.beforeAfterShowcase.delete({ where: { id } });
        break;
      default:
        return { success: false, error: 'Invalid collection' };
    }
    revalidatePath('/', 'layout');
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error(`Delete Error in ${collectionName}:`, error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
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
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: unknown) {
    console.error('Update Pricing Order Error:', error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

export async function updatePricingPlansOrder(items: { id: string, order: number }[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized' };

  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    return { success: false, error: 'Forbidden' };
  }

  try {
    const transactions = items.map(item =>
      prisma.pricingPlan.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    );
    await prisma.$transaction(transactions);
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: unknown) {
    console.error('Update Pricing Plans Order Error:', error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

export async function updatePhotoServicesOrder(items: { id: string, order: number }[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized' };

  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    return { success: false, error: 'Forbidden' };
  }

  try {
    const transactions = items.map(item =>
      prisma.photoService.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    );
    await prisma.$transaction(transactions);
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: unknown) {
    console.error('Update Photo Services Order Error:', error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

