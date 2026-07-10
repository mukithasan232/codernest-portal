'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function getGlobalSettings() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('global_settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) {
    console.error('Fetch Settings Error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function updateAppearance(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Unauthorized.' };
  }

  const primaryColor = formData.get('primary_color') as string;
  const siteName = formData.get('site_name') as string;
  const logoFile = formData.get('logo_file') as File | null;
  const faviconFile = formData.get('favicon_file') as File | null;
  let logoUrl = formData.get('current_logo_url') as string;
  let faviconUrl = formData.get('current_favicon_url') as string;

  if (logoFile && logoFile.size > 0) {
    const fileExt = logoFile.name.split('.').pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('brand-assets')
      .upload(filePath, logoFile, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload Error:', uploadError);
      return { success: false, error: 'Failed to upload logo.' };
    }

    const { data: publicUrlData } = supabase.storage
      .from('brand-assets')
      .getPublicUrl(filePath);

    logoUrl = publicUrlData.publicUrl;
  }

  if (faviconFile && faviconFile.size > 0) {
    const fileExt = faviconFile.name.split('.').pop();
    const fileName = `favicon-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('brand-assets')
      .upload(filePath, faviconFile, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Favicon Upload Error:', uploadError);
      return { success: false, error: 'Failed to upload favicon.' };
    }

    const { data: publicUrlData } = supabase.storage
      .from('brand-assets')
      .getPublicUrl(filePath);

    faviconUrl = publicUrlData.publicUrl;
  }

  const { error } = await supabase
    .from('global_settings')
    .update({
      primary_color: primaryColor || '#3B82F6',
      site_name: siteName || 'CoderNest',
      logo_url: logoUrl || null,
      favicon_url: faviconUrl || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', 1);

  if (error) {
    console.error('Update Error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function updateSmtpConfig(smtpConfig: any) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Unauthorized.' };
  }

  const { error } = await supabase
    .from('global_settings')
    .update({
      smtp_config: smtpConfig,
      updated_at: new Date().toISOString()
    })
    .eq('id', 1);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/settings');
  return { success: true };
}

export async function getEmailTemplates() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function saveEmailTemplate(id: string | null, name: string, subject: string, htmlBody: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Unauthorized.' };
  }

  if (id) {
    // Update
    const { error } = await supabase
      .from('email_templates')
      .update({ name, subject, html_body: htmlBody })
      .eq('id', id);
    if (error) return { success: false, error: error.message };
  } else {
    // Insert
    const { error } = await supabase
      .from('email_templates')
      .insert([{ name, subject, html_body: htmlBody }]);
    if (error) return { success: false, error: error.message };
  }

  revalidatePath('/admin/settings');
  return { success: true };
}

export async function deleteEmailTemplate(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('email_templates')
    .delete()
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/admin/settings');
  return { success: true };
}

export async function testSmtpConnection(smtpConfig: any) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const nodemailer = (await import('nodemailer')).default;
    
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: parseInt(smtpConfig.port, 10),
      secure: parseInt(smtpConfig.port, 10) === 465,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.password,
      },
    });

    await transporter.verify();
    
    // Optionally, send a test email to the logged in user
    await transporter.sendMail({
      from: smtpConfig.user,
      to: user.email,
      subject: 'CoderNest SMTP Test Successful',
      text: 'If you are receiving this, your SMTP configuration is working perfectly!',
      html: '<p>If you are receiving this, your <strong>SMTP configuration</strong> is working perfectly!</p>',
    });

    return { success: true };
  } catch (err: any) {
    console.error('SMTP Error:', err);
    return { success: false, error: err.message || 'SMTP Verification failed' };
  }
}

