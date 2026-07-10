'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Testimonial } from '@/types';
import { revalidatePath } from 'next/cache';

/**
 * Fetch all testimonials (Admins only)
 */
export async function getAllReviews() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all testimonials:', error);
      return { success: false, data: null, error: error.message };
    }

    return { success: true, data: data as Testimonial[] };
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
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const client_name = formData.get('client_name') as string;
    const designation_company = formData.get('designation_company') as string;
    const review_text = formData.get('review_text') as string;
    const rating = parseInt(formData.get('rating') as string) || 5;
    const is_published = formData.get('is_published') === 'true';

    const { data, error } = await supabase
      .from('testimonials')
      .insert({
        client_name,
        designation_company,
        review_text,
        rating,
        is_published,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating testimonial:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/(marketing)', 'layout');
    revalidatePath('/cms/reviews');

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
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const updates: any = {};
    if (formData.has('client_name')) updates.client_name = formData.get('client_name');
    if (formData.has('designation_company')) updates.designation_company = formData.get('designation_company');
    if (formData.has('review_text')) updates.review_text = formData.get('review_text');
    if (formData.has('rating')) updates.rating = parseInt(formData.get('rating') as string);
    if (formData.has('is_published')) updates.is_published = formData.get('is_published') === 'true';

    const { data, error } = await supabase
      .from('testimonials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating testimonial:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/(marketing)', 'layout');
    revalidatePath('/cms/reviews');

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
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting testimonial:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/(marketing)', 'layout');
    revalidatePath('/cms/reviews');

    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteReview:', error);
    return { success: false, error: error.message };
  }
}
