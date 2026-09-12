'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import sharp from 'sharp';
import { put, del } from '@vercel/blob';

export async function getPortfolioImages() {
  try {
    const data = await prisma.portfolioImage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data };
  } catch (error: unknown) {
    console.error('Fetch Portfolio Error:', error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

export async function deletePortfolioImage(id: string, originalUrl: string, processedUrl: string | null) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized.' };
  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    return { success: false, error: 'Forbidden.' };
  }

  if (originalUrl && originalUrl.includes('.vercel-storage.com')) {
    try {
      await del(originalUrl);
    } catch (e) {
      console.warn('Failed to delete original image blob', e);
    }
  }
  if (processedUrl && processedUrl.includes('.vercel-storage.com')) {
    try {
      await del(processedUrl);
    } catch (e) {
      console.warn('Failed to delete processed image blob', e);
    }
  }

  try {
    await prisma.portfolioImage.delete({
      where: { id }
    });
    
    revalidatePath('/admin/portfolio');
    revalidatePath('/portfolio');
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

export async function uploadAndProcessImage(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized.' };
  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    return { success: false, error: 'Forbidden.' };
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
    const originalFileName = `uploads/portfolio/raw-${timestamp}.webp`;
    const processedFileName = `uploads/portfolio/pro-${timestamp}.webp`;

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

    // 3. Write Original to Blob
    const originalBlob = await put(originalFileName, originalBuffer, { 
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    // 4. Write Processed to Blob
    const processedBlob = await put(processedFileName, processedBuffer, { 
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    // 5. Save to Database
    await prisma.portfolioImage.create({
      data: {
        title,
        original_image_url: originalBlob.url,
        processed_image_url: processedBlob.url,
        status: 'completed'
      }
    });

    revalidatePath('/admin/portfolio');
    revalidatePath('/portfolio');
    
    return { success: true };
  } catch (err: unknown) {
    console.error('Image Processing Error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Image processing pipeline failed.' };
  }
}
