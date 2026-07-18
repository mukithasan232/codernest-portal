'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function getMedia() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized' };
  
  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    return { success: false, error: 'Forbidden' };
  }

  try {
    const media = await prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: media };
  } catch (error: any) {
    console.error('Fetch Media Error:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteMedia(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized' };

  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR') {
    return { success: false, error: 'Forbidden' };
  }

  try {
    const deleted = await prisma.media.delete({ where: { id } });
    revalidatePath('/admin/media');
    return { success: true, data: deleted };
  } catch (error: any) {
    console.error('Delete Media Error:', error);
    return { success: false, error: error.message };
  }
}
