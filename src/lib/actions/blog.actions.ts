'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function createBlog(formData: FormData) {
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const content = formData.get('content') as string;
  const status = formData.get('status') as 'draft' | 'published';
  const coverImage = formData.get('cover_image') as File | null;

  if (!title || !slug || !content || !status) {
    return { success: false, error: 'Missing required fields.' };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Check auth & admin status
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: 'Unauthorized.' };

  const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (!dbUser || (dbUser.role !== 'admin' && dbUser.role !== 'super_admin')) {
    return { success: false, error: 'Unauthorized.' };
  }

  let coverImageUrl = '';

  // Handle Cover Image Upload
  if (coverImage && coverImage.size > 0) {
    const fileExt = coverImage.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('blog-assets')
      .upload(filePath, coverImage, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload Error:', uploadError);
      return { success: false, error: 'Failed to upload cover image.' };
    }

    const { data: publicUrlData } = supabase.storage
      .from('blog-assets')
      .getPublicUrl(filePath);

    coverImageUrl = publicUrlData.publicUrl;
  }

  // Insert Blog
  const { data, error } = await supabase
    .from('blogs')
    .insert([
      {
        title,
        slug,
        content,
        status,
        author_id: user.id,
        ...(coverImageUrl && { cover_image: coverImageUrl }),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Insert Error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/cms');
  revalidatePath('/blog');
  return { success: true, data };
}

export async function updateBlog(id: string, formData: FormData) {
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const content = formData.get('content') as string;
  const status = formData.get('status') as 'draft' | 'published';
  const coverImage = formData.get('cover_image') as File | null;

  if (!title || !slug || !content || !status) {
    return { success: false, error: 'Missing required fields.' };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  let coverImageUrl = '';

  if (coverImage && coverImage.size > 0) {
    const fileExt = coverImage.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('blog-assets')
      .upload(filePath, coverImage, {
        cacheControl: '3600',
        upsert: false,
      });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage.from('blog-assets').getPublicUrl(filePath);
      coverImageUrl = publicUrlData.publicUrl;
    }
  }

  const updatePayload: any = {
    title,
    slug,
    content,
    status,
  };

  if (coverImageUrl) {
    updatePayload.cover_image = coverImageUrl;
  }

  const { data, error } = await supabase
    .from('blogs')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath('/cms');
  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  return { success: true, data };
}

export async function getBlogs() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch Error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function deleteBlog(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Delete Error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/cms');
  revalidatePath('/blog');
  return { success: true };
}

export async function uploadBlogImage(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) return { success: false, error: 'No file provided' };

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${user.id}/inline-images/${fileName}`;

  const { error } = await supabase.storage
    .from('blog-assets')
    .upload(filePath, file);

  if (error) {
    return { success: false, error: error.message };
  }

  const { data: publicUrlData } = supabase.storage
    .from('blog-assets')
    .getPublicUrl(filePath);

  return { success: true, url: publicUrlData.publicUrl };
}
