'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@prisma/client';

export async function getTeamMembers() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });
    
    return { success: true, data: users };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function inviteTeamMember(data: { email: string, name: string, role: UserRole, password?: string }) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return { success: false, error: 'User with this email already exists' };
    }

    const hashedPassword = await bcrypt.hash(data.password || 'TemporaryPassword123!', 10);

    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
        password: hashedPassword,
      },
      select: { id: true, email: true, name: true, role: true }
    });

    return { success: true, data: newUser };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUserFreeCredits() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, error: 'Unauthorized' };
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { freeCredits: true }
    });
    
    return { success: true, creditsUsed: user?.freeCredits || 0 };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function incrementUserFreeCredits() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, error: 'Unauthorized' };
    
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { freeCredits: { increment: 1 } },
      select: { freeCredits: true }
    });
    
    return { success: true, creditsUsed: user.freeCredits };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
