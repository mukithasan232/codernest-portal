import openai from "@/lib/openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();

        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                {
                    role: "system",
                    content: "You are 'CoderNest AI', a helpful and professional assistant for CoderNest Digital Agency. You can answer questions about our services (Web Dev, SaaS, AI, UI/UX), pricing (Starter $199, Business $499, Pro $999), and general tech questions. Be concise and friendly.",
                },
                ...history,
                { role: "user", content: message },
            ],
        });

        return NextResponse.json({ reply: response.choices[0].message.content });
    } catch (error: any) {
        console.error("AI Chat API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
