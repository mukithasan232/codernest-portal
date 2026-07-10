/**
 * API Route: POST /api/image/process-auto
 * Tier A — AI Automated Image Processing
 * Simulates instant processing, returns a result download URL.
 * (Replace simulation with real AI API like remove.bg / Cloudinary in production)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, fileName, userId, instructions, tier } = await req.json();

    if (!imageUrl || !userId) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify user exists
    const { data: userData, error: userError } = await supabase.from('users').select('id, email').eq('id', userId).single();
    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // ──────────────────────────────────────────────────────────────────────
    // SIMULATION: In production, call an AI API here.
    // Example APIs: remove.bg, Cloudinary AI, Adobe Photoshop API
    // For now, we return the original URL with a simulated "processed" flag.
    // ──────────────────────────────────────────────────────────────────────
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate 1.5s processing

    // In real implementation: processedUrl = await callRemoveBgApi(imageUrl)
    const processedUrl = imageUrl; // Placeholder — returns original

    // Create imageOrder document in Supabase
    const { data: orderData, error: orderError } = await supabase.from('imageOrders').insert({
      clientId: userId,
      clientEmail: userData.email ?? '',
      status: 'completed',
      tier: tier ?? 'A-automated',
      originalUrl: imageUrl,
      processedUrl,
      instructions: instructions ?? '',
      isPaid: false, // free trial
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    }).select('id').single();

    if (orderError) throw orderError;

    return NextResponse.json({
      success: true,
      orderId: orderData.id,
      processedUrl,
      message: `Your image "${fileName ?? 'image'}" has been processed successfully! Download is ready below.`,
    });

  } catch (err) {
    console.error('[process-auto]', err);
    return NextResponse.json({ error: 'Image processing failed.' }, { status: 500 });
  }
}
