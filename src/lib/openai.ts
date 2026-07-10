import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});


export async function generateQuote(projectDetails: string) {
    const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
            {
                role: "system",
                content: "You are an expert agency consultant for 'CoderNest'. Based on the user's project description, provide a estimated price range (starting from $200), estimated timeline, and a brief list of recommended features. Keep it professional and concise. Return the response as JSON with keys: estimatedPrice, estimatedTimeline, recommendedFeatures (array), and message.",
            },
            {
                role: "user",
                content: `Project Details: ${projectDetails}`,
            },
        ],
        response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || '{}');
}

export async function generateBlogPost(topic: string) {
    const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
            {
                role: "system",
                content: "You are a tech blog writer for 'CoderNest'. Generate a professional, SEO-optimized blog post based on the given topic. Include a title, primary keywords, and the content in markdown format. Return as JSON with keys: title, slug, content, keywords.",
            },
            {
                role: "user",
                content: `Topic: ${topic}`,
            },
        ],
        response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || '{}');
}

export default openai;
