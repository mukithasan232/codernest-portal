import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { sendOfficialNotification } from '@/lib/email';
import { z } from 'zod';

const addEmployeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().optional(),
});

function generateSecurePassword(length = 10) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = addEmployeeSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Generate password if not provided
    const plainPassword = validatedData.password || generateSecurePassword(10);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Create user in DB
    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: 'EMPLOYEE',
      },
    });

    // Send onboarding email
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://codernest.agency';
    
    await sendOfficialNotification({
      to: newUser.email!,
      subject: 'Welcome to CoderNest Team!',
      title: 'Welcome Aboard!',
      message: `Hi ${newUser.name},\n\nYou have been successfully added to the CoderNest team. You can use the credentials below to log in to your dashboard.\n\nLogin URL: ${siteUrl}/auth/login\nEmail: ${newUser.email}\nPassword: ${plainPassword}\n\nWe highly recommend changing your password after your first login.`,
    });

    return NextResponse.json({
      message: 'Employee added successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding team member:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
