import { stripe } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { amount, planName, projectId, type = "project" } = await req.json();

        const authSession = await getServerSession(authOptions);
        const user = authSession?.user;

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let productName = `CoderNest - ${planName} Plan`;
        let productDescription = `Payment for project: ${projectId || 'Universal Project'}`;

        if (type === 'image_credits') {
            productName = `CoderNest - ${planName}`;
            productDescription = `Purchase of Image Editing Credits`;
        }

        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: productName,
                            description: productDescription,
                        },
                        unit_amount: amount * 100, // amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/success?session_id={CHECKOUT_SESSION_ID}&project_id=${projectId}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
            customer_email: user.email || undefined,
            metadata: {
                userId: user.id,
                projectId: projectId || "new",
                planName,
            },
        });

        return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
    } catch (error: any) {
        console.error("Stripe error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
