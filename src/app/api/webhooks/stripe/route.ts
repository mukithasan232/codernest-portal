import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js"; // Use service role for webhooks
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy'
);

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
            const { data: newProject, error: projError } = await supabaseAdmin
                .from("projects")
                .insert([
                    {
                        client_id: userId,
                        title: `${planName} Package Project`,
                        status: "pending",
                        price: session.amount_total / 100,
                    },
                ])
                .select()
                .single();

            if (!projError) finalProjectId = newProject.id;
        }

        // 2. Save Payment record
        await supabaseAdmin.from("payments").insert([
            {
                project_id: finalProjectId,
                amount: session.amount_total / 100,
                status: "succeeded",
                stripe_session_id: session.id,
            },
        ]);

        // 3. Optional: Send onboarding email via Resend
        // ... logic for email
    }

    return NextResponse.json({ received: true });
}
