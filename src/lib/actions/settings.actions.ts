'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function getGlobalSettings() {
  try {
    let settings = await prisma.systemSettings.findUnique({
      where: { id: 'global_settings' },
    });
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: 'global_settings',
          siteName: 'CoderNest',
          brandColor: '#3B82F6',
        }
      });
    }
    return { success: true, data: settings };
  } catch (error: any) {
    console.error('Fetch Settings Error:', error);
    return { success: false, error: error.message };
  }
}

export async function updateGlobalSettings(payload: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized' };

  if (session.user.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Forbidden. Only Super Admins can modify global settings.' };
  }

  try {
    const { id, createdAt, updatedAt, ...updateData } = payload;
    const settings = await prisma.systemSettings.upsert({
      where: { id: 'global_settings' },
      update: updateData,
      create: {
        id: 'global_settings',
        ...updateData,
      }
    });
    
    // Revalidate everything that depends on global settings
    revalidatePath('/', 'layout');
    
    return { success: true, data: settings };
  } catch (error: any) {
    console.error('Update Settings Error:', error);
    return { success: false, error: error.message };
  }
}
