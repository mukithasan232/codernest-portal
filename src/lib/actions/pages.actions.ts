'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function getDynamicPages() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized' };
  
  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    return { success: false, error: 'Forbidden' };
  }

  try {
    const pages = await prisma.dynamicPage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: pages };
  } catch (error: unknown) {
    console.error('Fetch Pages Error:', error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

export async function getDynamicPage(id: string) {
  try {
    const page = await prisma.dynamicPage.findUnique({ where: { id } });
    if (!page) return { success: false, error: 'Page not found' };
    return { success: true, data: page };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

export async function getDynamicPageBySlug(slug: string) {
  try {
    const page = await prisma.dynamicPage.findUnique({ where: { slug } });
    if (!page) return { success: false, error: 'Page not found' };
    return { success: true, data: page };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

export async function createDynamicPage(payload: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized' };

  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    return { success: false, error: 'Forbidden' };
  }

  try {
    const page = await prisma.dynamicPage.create({ data: payload });
    revalidatePath('/admin/pages');
    return { success: true, data: page };
  } catch (error: unknown) {
    console.error('Create Page Error:', error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

export async function updateDynamicPage(id: string, payload: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized' };

  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    return { success: false, error: 'Forbidden' };
  }

  try {
    const page = await prisma.dynamicPage.update({
      where: { id },
      data: payload,
    });
    
    revalidatePath('/admin/pages');
    if (page.slug) {
      revalidatePath(`/${page.slug}`);
    }
    
    return { success: true, data: page };
  } catch (error: unknown) {
    console.error('Update Page Error:', error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

export async function deleteDynamicPage(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized' };

  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    return { success: false, error: 'Forbidden' };
  }

  try {
    const deleted = await prisma.dynamicPage.delete({ where: { id } });
    revalidatePath('/admin/pages');
    if (deleted.slug) {
      revalidatePath(`/${deleted.slug}`);
    }
    return { success: true, data: deleted };
  } catch (error: unknown) {
    console.error('Delete Page Error:', error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}
