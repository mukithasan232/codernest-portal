import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;


    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
    }

    const session = event.data.object as any;

    if (event.type === "checkout.session.completed") {
        const { userId, projectId, planName } = session.metadata;

        // 1. Create or Update Project
        let finalProjectId = projectId;
        if (projectId === "new") {
            const newProject = await prisma.project.create({
                data: {
                    clientId: userId,
                    title: `${planName} Package Project`,
                    type: "package",
                    status: "pending",
                }
            });

            finalProjectId = newProject.id;
        }

        // We can update the invoice if this was tied to an invoice
        if (session.metadata?.invoiceId) {
            await prisma.invoice.update({
                where: { id: session.metadata.invoiceId },
                data: {
                    status: 'paid',
                    paidAt: new Date()
                }
            });
        }
        
        // 3. Optional: Send onboarding email via Resend
        // ... logic for email
    }

    return NextResponse.json({ received: true });
}

