'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import sharp from 'sharp';

export async function getPortfolioImages() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('portfolio_images')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch Portfolio Error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function deletePortfolioImage(id: string, originalUrl: string, processedUrl: string | null) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Unauthorized.' };
  }

  // Extract filenames from URLs
  const originalPath = originalUrl.split('/').pop();
  const processedPath = processedUrl ? processedUrl.split('/').pop() : null;

  const filesToRemove = [];
  if (originalPath) filesToRemove.push(originalPath);
  if (processedPath) filesToRemove.push(processedPath);

  if (filesToRemove.length > 0) {
    await supabase.storage.from('portfolio-assets').remove(filesToRemove);
  }

  const { error } = await supabase
    .from('portfolio_images')
    .delete()
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/portfolio');
  revalidatePath('/portfolio');
  return { success: true };
}

export async function uploadAndProcessImage(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Unauthorized.' };
  }

  const title = formData.get('title') as string;
  const imageFile = formData.get('image') as File;

  if (!title || !imageFile) {
    return { success: false, error: 'Title and image are required.' };
  }

  try {
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const timestamp = Date.now();
    const originalFileName = `raw-${timestamp}.webp`;
    const processedFileName = `pro-${timestamp}.webp`;

    // 1. Convert original to WebP (optimized)
    const originalBuffer = await sharp(buffer)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    // 2. Process image (Pro Retouch: boost contrast, saturation, and sharpen)
    const processedBuffer = await sharp(buffer)
      .resize({ width: 1920, withoutEnlargement: true })
      .modulate({
        saturation: 1.2, // Boost saturation by 20%
      })
      .linear(1.1, -10) // Boost contrast (multiplier, offset)
      .sharpen({ sigma: 1, m1: 1, m2: 1 }) // Sharpen
      .webp({ quality: 90 })
      .toBuffer();

    // 3. Upload Original to Supabase
    const { error: uploadOrigError } = await supabase.storage
      .from('portfolio-assets')
      .upload(originalFileName, originalBuffer, {
        contentType: 'image/webp',
        cacheControl: '3600',
      });

    if (uploadOrigError) throw new Error(`Upload original failed: ${uploadOrigError.message}`);

    // 4. Upload Processed to Supabase
    const { error: uploadProcError } = await supabase.storage
      .from('portfolio-assets')
      .upload(processedFileName, processedBuffer, {
        contentType: 'image/webp',
        cacheControl: '3600',
      });

    if (uploadProcError) throw new Error(`Upload processed failed: ${uploadProcError.message}`);

    // 5. Get Public URLs
    const { data: origUrlData } = supabase.storage.from('portfolio-assets').getPublicUrl(originalFileName);
    const { data: procUrlData } = supabase.storage.from('portfolio-assets').getPublicUrl(processedFileName);

    // 6. Save to Database
    const { error: dbError } = await supabase
      .from('portfolio_images')
      .insert([{
        title,
        original_image_url: origUrlData.publicUrl,
        processed_image_url: procUrlData.publicUrl,
        status: 'completed'
      }]);

    if (dbError) throw new Error(`Database insert failed: ${dbError.message}`);

    revalidatePath('/admin/portfolio');
    revalidatePath('/portfolio');
    
    return { success: true };
  } catch (err: any) {
    console.error('Image Processing Error:', err);
    return { success: false, error: err.message || 'Image processing pipeline failed.' };
  }
}
