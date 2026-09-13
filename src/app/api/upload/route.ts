import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EMPLOYEE')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `uploads/media/${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    
    const blob = await put(filename, file, { 
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    
    const url = blob.url;
    
    // Save to database
    const media = await prisma.media.create({
      data: {
        url,
        altText: file.name,
      }
    });

    return NextResponse.json({ success: true, url, media });
  } catch (error: unknown) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "An unknown error occurred" }, { status: 500 });
  }
}
