'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { revalidatePath } from 'next/cache';
import { TeamMember } from '@/types';

async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR')) {
    throw new Error('Unauthorized');
  }
}

export async function getTeamMembers() {
  try {
    const members = await prisma.teamMember.findMany({
      orderBy: { order: 'asc' }
    });
    return { success: true, data: members as unknown as TeamMember[] };
  } catch (error: any) {
    console.error('Error fetching team members:', error);
    return { success: false, data: [] as TeamMember[], error: error.message };
  }
}

export async function createTeamMember(data: {
  name: string;
  designation: string;
  department: string;
  bio?: string;
  imageUrl: string;
  order?: number;
  isActive?: boolean;
}) {
  try {
    await verifyAdmin();
    const newMember = await prisma.teamMember.create({
      data: {
        name: data.name,
        designation: data.designation,
        department: data.department,
        bio: data.bio || null,
        imageUrl: data.imageUrl,
        order: data.order || 0,
        isActive: data.isActive ?? true,
      }
    });
    revalidatePath('/about');
    revalidatePath('/admin/team');
    return { success: true, data: newMember };
  } catch (error: any) {
    console.error('Error creating team member:', error);
    return { success: false, error: error.message };
  }
}

export async function updateTeamMember(id: string, data: Partial<{
  name: string;
  designation: string;
  department: string;
  bio: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
}>) {
  try {
    await verifyAdmin();
    const updatedMember = await prisma.teamMember.update({
      where: { id },
      data,
    });
    revalidatePath('/about');
    revalidatePath('/admin/team');
    return { success: true, data: updatedMember };
  } catch (error: any) {
    console.error('Error updating team member:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteTeamMember(id: string) {
  try {
    await verifyAdmin();
    await prisma.teamMember.delete({
      where: { id }
    });
    revalidatePath('/about');
    revalidatePath('/admin/team');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting team member:', error);
    return { success: false, error: error.message };
  }
}

export async function updateCompanyStats(data: {
  foundedYear: string;
  totalClients: number;
  totalProjects: number;
}) {
  try {
    await verifyAdmin();
    await prisma.systemSettings.upsert({
      where: { id: 'global_settings' },
      update: {
        foundedYear: data.foundedYear,
        totalClients: data.totalClients,
        totalProjects: data.totalProjects,
      },
      create: {
        id: 'global_settings',
        foundedYear: data.foundedYear,
        totalClients: data.totalClients,
        totalProjects: data.totalProjects,
      }
    });
    revalidatePath('/about');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating company stats:', error);
    return { success: false, error: error.message };
  }
}
