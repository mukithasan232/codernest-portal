import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/resend";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { name, email, message } = await req.json();

        if (!name || !email) {
            return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. Save to database
        const { error: dbError } = await supabase.from("leads").insert([
            { name, email, message, status: "new" },
        ]);

        if (dbError) throw dbError;

        // 2. Send auto-email to client
        await sendEmail({
            to: email,
            subject: "Thanks for reaching out to CoderNest!",
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #3b82f6;">Hi ${name},</h2>
          <p>Thanks for contacting CoderNest! We've received your message and our team is already reviewing it.</p>
          <p>We'll get back to you within 24 hours to discuss how we can help with your project.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">This is an automated confirmation. No need to reply to this email.</p>
        </div>
      `,
        });

        // 3. Notify admin
        await sendEmail({
            to: "admin@codernest.agency",
            subject: `New Lead: ${name}`,
            html: `
        <div style="font-family: sans-serif;">
          <h2>New Lead Captured</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong> ${message}</p>
          <br />
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View in Admin Panel</a>
        </div>
      `,
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Contact API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
