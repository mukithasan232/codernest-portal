/**
 * API Route: POST /api/admin/update-order
 * Admin uploads manually edited image and marks Tier B order as completed.
 * Sends completion notification to client.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import resend from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify admin session via cookies
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { orderId, processedUrl } = await req.json();
    if (!orderId || !processedUrl) {
      return NextResponse.json({ error: 'Missing orderId or processedUrl' }, { status: 400 });
    }

    // Check if order exists
    const { data: orderSnap, error: orderCheckError } = await supabase.from('imageOrders').select('*').eq('id', orderId).single();
    if (orderCheckError || !orderSnap) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update the order in Supabase
    const { error: updateError } = await supabase.from('imageOrders').update({
      status: 'completed',
      processedUrl,
      completedAt: new Date().toISOString(),
    }).eq('id', orderId);

    if (updateError) throw updateError;

    // Notify the client
    if (orderSnap.clientEmail && process.env.RESEND_API_KEY) {
      resend.emails.send({
        from: 'noreply@codernest.agency',
        to: orderSnap.clientEmail,
        subject: '✅ Your CoderNest Image Order is Ready!',
        html: `
          <h2>Your image is ready for download!</h2>
          <p>Order ID: <strong>${orderId}</strong></p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/image-orders">View your order and download</a></p>
          <p>Thank you for choosing CoderNest Image Studio!</p>
        `,
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, orderId, processedUrl });

  } catch (err) {
    console.error('[update-order]', err);
    return NextResponse.json({ error: 'Failed to update order.' }, { status: 500 });
  }
}
