'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function uploadUserImage(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: 'Unauthorized.' };

  const file = formData.get('file') as File;
  if (!file) return { success: false, error: 'No file provided.' };

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const uploadDir = path.join(process.cwd(), 'public/uploads/user-images', session.user.id);
    
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), buffer);
    
    const publicUrl = `/uploads/user-images/${session.user.id}/${fileName}`;
    return { success: true, publicUrl };
  } catch (error: any) {
    console.error('Upload Error:', error);
    return { success: false, error: error.message };
  }
}

import { prisma } from "@/lib/prisma";

export async function createImageOrder(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: 'Unauthorized.' };

  const tier = formData.get('tier') as string;
  const originalUrl = formData.get('originalUrl') as string;
  const instructions = formData.get('instructions') as string;

  if (!tier || !originalUrl) {
    return { success: false, error: 'Missing required fields.' };
  }

  try {
    const order = await prisma.imageOrder.create({
      data: {
        clientId: session.user.id,
        clientEmail: session.user.email,
        tier,
        originalUrl,
        instructions
      }
    });
    return { success: true, orderId: order.id };
  } catch (error: any) {
    console.error('Create Order Error:', error);
    return { success: false, error: error.message };
  }
}
