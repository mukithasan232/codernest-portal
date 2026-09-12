import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > 3) {
      return NextResponse.json({ error: 'Maximum 3 files allowed for free trial.' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      // Validate type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Only image files are allowed.' }, { status: 400 });
      }

      // Validate size (e.g. 10MB limit per file)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: `File ${file.name} exceeds 10MB limit.` }, { status: 400 });
      }

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `uploads/trial/${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      
      const blob = await put(filename, file, { access: 'public' });
      
      uploadedUrls.push(blob.url);
    }

    return NextResponse.json({ success: true, urls: uploadedUrls });
  } catch (error: unknown) {
    console.error('Trial Upload Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "An unknown error occurred" }, { status: 500 });
  }
}
