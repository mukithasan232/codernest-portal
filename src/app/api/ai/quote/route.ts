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
    } catch (error: unknown) {
        console.error("AI Quote API error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "An unknown error occurred" }, { status: 500 });
    }
}
