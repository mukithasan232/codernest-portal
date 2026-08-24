import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event;

    // Step 1: Verify webhook signature — return 400 on failure (Stripe expects this)
    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: unknown) {
        return NextResponse.json(
            { error: `Webhook signature verification failed: ${error instanceof Error ? error.message : "Unknown error"}` },
            { status: 400 }
        );
    }

    // Step 2: Process event — wrap ALL DB operations in try-catch
    // so a DB failure returns 500 (triggering Stripe retry) rather than crashing
    try {
        const session = event.data.object as any;

        if (event.type === "checkout.session.completed") {
            const { userId, projectId, planName } = session.metadata ?? {};

            // 1. Create or Update Project
            if (projectId === "new" && userId) {
                await prisma.project.create({
                    data: {
                        clientId: userId,
                        title: `${planName ?? 'Custom'} Package Project`,
                        type: "package",
                        status: "pending",
                    },
                });
            }

            // 2. Mark invoice as paid if tied to one
            if (session.metadata?.invoiceId) {
                await prisma.invoice.update({
                    where: { id: session.metadata.invoiceId },
                    data: {
                        status: 'paid',
                        paidAt: new Date(),
                    },
                });
            }

            // 3. Optional: Send onboarding email via Resend
            // TODO: implement post-payment email
        }

        return NextResponse.json({ received: true });
    } catch (error: unknown) {
        console.error("[Stripe Webhook] DB processing error:", error);
        // Return 500 so Stripe retries the webhook delivery
        return NextResponse.json(
            { error: "Webhook DB processing failed. Stripe will retry." },
            { status: 500 }
        );
    }
}
