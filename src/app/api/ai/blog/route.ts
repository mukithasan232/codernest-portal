import { generateBlogPost } from "@/lib/openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { topic } = await req.json();

        if (!topic) {
            return NextResponse.json({ error: "Topic is required" }, { status: 400 });
        }

        const blog = await generateBlogPost(topic);

        return NextResponse.json(blog);
    } catch (error: unknown) {
        console.error("AI Blog API error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "An unknown error occurred" }, { status: 500 });
    }
}
