import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sendOfficialNotification } from '@/lib/email';
import { Role } from '@prisma/client';

const userSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['SUPER_ADMIN', 'EMPLOYEE']),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Super Admin only.' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Security check: Only SUPER_ADMIN can create new system users
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Super Admin only.' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = userSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Securely hash the password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user in DB
    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role as Role,
      },
    });

    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://codernest.com'}/auth/login`;

    await sendOfficialNotification({
      to: validatedData.email,
      subject: 'Welcome to CoderNest - Your System Access Credentials',
      title: 'Welcome Aboard!',
      message: `Hi ${validatedData.name},\n\nAn administrator has created a system account for you with the role: ${validatedData.role}.\n\nLogin URL: ${loginUrl}\nEmail: ${validatedData.email}\nTemporary Password: ${validatedData.password}\n\nCRITICAL: Please log in immediately and change your password from the Security Settings page.`,
    });

    return NextResponse.json({ 
      success: true, 
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } 
    });

  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
