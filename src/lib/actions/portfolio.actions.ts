'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import sharp from 'sharp';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

export async function getPortfolioImages() {
  try {
    const data = await prisma.portfolioImage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data };
  } catch (error: any) {
    console.error('Fetch Portfolio Error:', error);
    return { success: false, error: error.message };
  }
}

export async function deletePortfolioImage(id: string, originalUrl: string, processedUrl: string | null) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized.' };
  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    return { success: false, error: 'Forbidden.' };
  }

  // Extract filenames from URLs
  const originalPath = originalUrl.split('/').pop();
  const processedPath = processedUrl ? processedUrl.split('/').pop() : null;

  const uploadDir = path.join(process.cwd(), 'public/uploads/portfolio');
  
  if (originalPath) {
    try {
      await unlink(path.join(uploadDir, originalPath));
    } catch (e) {
      console.warn('Failed to delete original image file', e);
    }
  }
  if (processedPath) {
    try {
      await unlink(path.join(uploadDir, processedPath));
    } catch (e) {
      console.warn('Failed to delete processed image file', e);
    }
  }

  try {
    await prisma.portfolioImage.delete({
      where: { id }
    });
    
    revalidatePath('/admin/portfolio');
    revalidatePath('/portfolio');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
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
    const originalFileName = `raw-${timestamp}.webp`;
    const processedFileName = `pro-${timestamp}.webp`;
    const uploadDir = path.join(process.cwd(), 'public/uploads/portfolio');
    
    await mkdir(uploadDir, { recursive: true });

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

    // 3. Write Original to Disk
    await writeFile(path.join(uploadDir, originalFileName), originalBuffer);

    // 4. Write Processed to Disk
    await writeFile(path.join(uploadDir, processedFileName), processedBuffer);

    // 5. Save to Database
    await prisma.portfolioImage.create({
      data: {
        title,
        original_image_url: `/uploads/portfolio/${originalFileName}`,
        processed_image_url: `/uploads/portfolio/${processedFileName}`,
        status: 'completed'
      }
    });

    revalidatePath('/admin/portfolio');
    revalidatePath('/portfolio');
    
    return { success: true };
  } catch (err: any) {
    console.error('Image Processing Error:', err);
    return { success: false, error: err.message || 'Image processing pipeline failed.' };
  }
}
