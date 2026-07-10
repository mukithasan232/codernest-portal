/**
 * API Route: POST /api/image/request-manual
 * Tier B — Human Pro Image Order
 * Routes uploaded image to admin dashboard (Pending Manual Edit).
 * Sends admin notification email via Resend.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import resend from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, fileName, userId, instructions } = await req.json();

    if (!imageUrl || !userId) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch user info for notification email
    const { data: userData, error: userError } = await supabase.from('users').select('id, email').eq('id', userId).single();
    
    // Create image order with "pending" status → appears in admin dashboard
    const { data: orderData, error: orderError } = await supabase.from('imageOrders').insert({
      clientId: userId,
      clientEmail: userData?.email ?? '',
      status: 'pending',
      tier: 'B-human',
      originalUrl: imageUrl,
      processedUrl: null,
      instructions: instructions ?? '',
      isPaid: false, // Admin can mark as paid after confirmation
      createdAt: new Date().toISOString(),
      completedAt: null,
    }).select('id').single();

    if (orderError) throw orderError;

    // Notify admin via email (fire and forget)
    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      resend.emails.send({
        from: 'noreply@codernest.agency',
        to: process.env.ADMIN_EMAIL,
        subject: `🖼️ New Tier B Image Order — ${orderData.id}`,
        html: `
          <h2>New Human Pro Image Order</h2>
          <p><strong>Order ID:</strong> ${orderData.id}</p>
          <p><strong>Client:</strong> ${userData?.email ?? userId}</p>
          <p><strong>File:</strong> ${fileName ?? 'N/A'}</p>
          <p><strong>Instructions:</strong> ${instructions ?? 'None provided'}</p>
          <p><strong>Original Image:</strong> <a href="${imageUrl}">${imageUrl}</a></p>
          <hr>
          <p>Log into the <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/image-orders">Admin Dashboard</a> to process this order.</p>
        `,
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      orderId: orderData.id,
      message: 'Your order has been submitted to our expert editing team! You\'ll receive the processed image within 24 hours. Check your dashboard for status updates.',
    });

  } catch (err) {
    console.error('[request-manual]', err);
    return NextResponse.json({ error: 'Failed to submit order.' }, { status: 500 });
  }
}
