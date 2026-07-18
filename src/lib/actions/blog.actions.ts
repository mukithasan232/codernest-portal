'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function createBlog(formData: FormData) {
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const content = formData.get('content') as string;
  const status = formData.get('status') as 'draft' | 'published';
  const coverImage = formData.get('cover_image') as File | null;
  const metaTitle = formData.get('metaTitle') as string | null;
  const metaDesc = formData.get('metaDesc') as string | null;
  const keywords = formData.get('keywords') as string | null;

  if (!title || !slug || !content || !status) {
    return { success: false, error: 'Missing required fields.' };
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized.' };

  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    return { success: false, error: 'Forbidden.' };
  }

  let coverImageUrl = '';

  // Local Image Upload Fallback
  if (coverImage && coverImage.size > 0) {
    try {
      const buffer = Buffer.from(await coverImage.arrayBuffer());
      const fileExt = coverImage.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const uploadDir = path.join(process.cwd(), 'public/uploads', session.user.id);
      
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, fileName), buffer);
      
      coverImageUrl = `/uploads/${session.user.id}/${fileName}`;
    } catch (uploadError) {
      console.error('Upload Error:', uploadError);
      return { success: false, error: 'Failed to upload cover image.' };
    }
  }

  try {
    const data = await prisma.blog.create({
      data: {
        title,
        slug,
        content,
        status,
        authorId: session.user.id,
        metaTitle: metaTitle || null,
        metaDesc: metaDesc || null,
        keywords: keywords || null,
        ...(coverImageUrl && { cover_image: coverImageUrl }),
      }
    });

    revalidatePath('/admin/cms');
    revalidatePath('/blog');
    return { success: true, data };
  } catch (error: any) {
    console.error('Insert Error:', error);
    return { success: false, error: error.message };
  }
}

export async function updateBlog(id: string, formData: FormData) {
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const content = formData.get('content') as string;
  const status = formData.get('status') as 'draft' | 'published';
  const coverImage = formData.get('cover_image') as File | null;
  const metaTitle = formData.get('metaTitle') as string | null;
  const metaDesc = formData.get('metaDesc') as string | null;
  const keywords = formData.get('keywords') as string | null;

  if (!title || !slug || !content || !status) {
    return { success: false, error: 'Missing required fields.' };
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized' };

  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    return { success: false, error: 'Forbidden.' };
  }

  let coverImageUrl = '';

  if (coverImage && coverImage.size > 0) {
    try {
      const buffer = Buffer.from(await coverImage.arrayBuffer());
      const fileExt = coverImage.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const uploadDir = path.join(process.cwd(), 'public/uploads', session.user.id);
      
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, fileName), buffer);
      
      coverImageUrl = `/uploads/${session.user.id}/${fileName}`;
    } catch (uploadError) {
      console.error('Upload Error:', uploadError);
    }
  }

  const updatePayload: any = {
    title,
    slug,
    content,
    status,
    metaTitle: metaTitle || null,
    metaDesc: metaDesc || null,
    keywords: keywords || null,
  };

  if (coverImageUrl) {
    updatePayload.cover_image = coverImageUrl;
  }

  try {
    const data = await prisma.blog.update({
      where: { id },
      data: updatePayload
    });

    revalidatePath('/admin/cms');
    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getBlogs() {
  try {
    const data = await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data };
  } catch (error: any) {
    console.error('Fetch Error:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteBlog(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized' };
  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    return { success: false, error: 'Forbidden.' };
  }

  try {
    await prisma.blog.delete({ where: { id } });
    revalidatePath('/admin/cms');
    revalidatePath('/blog');
    return { success: true };
  } catch (error: any) {
    console.error('Delete Error:', error);
    return { success: false, error: error.message };
  }
}

export async function uploadBlogImage(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) return { success: false, error: 'No file provided' };

  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized' };

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const uploadDir = path.join(process.cwd(), 'public/uploads', session.user.id, 'inline-images');
    
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), buffer);
    
    return { success: true, url: `/uploads/${session.user.id}/inline-images/${fileName}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
