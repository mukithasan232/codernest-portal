import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { z } from 'zod';

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updatePasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.password) {
      return NextResponse.json({ error: 'Your account uses an external provider and does not have a password' }, { status: 400 });
    }

    // Compare current password
    const isPasswordValid = await bcrypt.compare(validatedData.currentPassword, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid current password' }, { status: 400 });
    }

    // Hash new password and update
    const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, 10);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error updating password:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
