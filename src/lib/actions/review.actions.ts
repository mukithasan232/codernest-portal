'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Testimonial } from '@/types';
import { revalidatePath } from 'next/cache';

/**
 * Fetch all testimonials (Admins only)
 */
export async function getAllReviews() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, data: null, error: 'Unauthorized.' };
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
      return { success: false, data: null, error: 'Forbidden.' };
    }

    const data = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: data as unknown as Testimonial[] };
  } catch (error: any) {
    console.error('Error in getAllReviews:', error);
    return { success: false, data: null, error: error.message };
  }
}

/**
 * Create a new testimonial
 */
export async function createReview(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized.' };
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
      return { success: false, error: 'Forbidden.' };
    }

    const client_name = formData.get('client_name') as string;
    const designation_company = formData.get('designation_company') as string;
    const review_text = formData.get('review_text') as string;
    const rating = parseInt(formData.get('rating') as string) || 5;
    const is_published = formData.get('is_published') === 'true';

    const data = await prisma.testimonial.create({
      data: {
        client_name,
        designation_company,
        review_text,
        rating,
        is_published,
      }
    });

    revalidatePath('/(marketing)', 'layout');
    revalidatePath('/admin/cms/reviews');

    return { success: true, data };
  } catch (error: any) {
    console.error('Error in createReview:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing testimonial (e.g. toggle publish status)
 */
export async function updateReview(id: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized.' };
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
      return { success: false, error: 'Forbidden.' };
    }

    const updates: any = {};
    if (formData.has('client_name')) updates.client_name = formData.get('client_name');
    if (formData.has('designation_company')) updates.designation_company = formData.get('designation_company');
    if (formData.has('review_text')) updates.review_text = formData.get('review_text');
    if (formData.has('rating')) updates.rating = parseInt(formData.get('rating') as string);
    if (formData.has('is_published')) updates.is_published = formData.get('is_published') === 'true';

    const data = await prisma.testimonial.update({
      where: { id },
      data: updates
    });

    revalidatePath('/(marketing)', 'layout');
    revalidatePath('/admin/cms/reviews');

    return { success: true, data };
  } catch (error: any) {
    console.error('Error in updateReview:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a testimonial
 */
export async function deleteReview(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized.' };
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
      return { success: false, error: 'Forbidden.' };
    }

    await prisma.testimonial.delete({
      where: { id }
    });

    revalidatePath('/(marketing)', 'layout');
    revalidatePath('/admin/cms/reviews');

    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteReview:', error);
    return { success: false, error: error.message };
  }
}
