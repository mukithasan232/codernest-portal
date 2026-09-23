import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const promo = await prisma.brandPromotion.findUnique({
      where: { slug }
    });

    // If not found or inactive, redirect to home
    if (!promo || !promo.isActive) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Increment click count (non-blocking)
    prisma.brandPromotion.update({
      where: { id: promo.id },
      data: { clicks: { increment: 1 } }
    }).catch(console.error);

    if (!promo.targetUrl) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Redirect to the target URL (which already has UTM parameters from creation)
    return NextResponse.redirect(new URL(promo.targetUrl));
  } catch (error) {
    console.error("Redirect error:", error);
    return NextResponse.redirect(new URL('/', req.url));
  }
}
