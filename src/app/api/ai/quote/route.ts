import { generateQuote } from "@/lib/openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { projectDetails } = await req.json();

        if (!projectDetails) {
            return NextResponse.json({ error: "Project details are required" }, { status: 400 });
        }

        const quote = await generateQuote(projectDetails);

        return NextResponse.json(quote);
    } catch (error: any) {
        console.error("AI Quote API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
