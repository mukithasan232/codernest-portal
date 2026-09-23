import { prisma } from "@/lib/prisma";
import { getCachedBlogBySlug } from "@/lib/cache/cached-queries";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import BlogRenderer from "@/components/blog/BlogRenderer";
import ShareButtons from "@/components/blog/ShareButtons";
import { PromotionAd } from "@/components/marketing/PromotionAd";

// Incremental Static Regeneration (ISR) - Cache on global Edge CDN for 24h (stale-while-revalidate)
export const revalidate = 86400;

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://codernest.cloud";

export async function generateStaticParams() {
    try {
        const posts = await prisma.blog.findMany({
            where: { status: 'published' },
            select: { slug: true },
            take: 50,
        });
        return posts.map((p) => ({ slug: p.slug }));
    } catch {
        return [];
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await getCachedBlogBySlug(slug);

    if (!post) return { title: 'Post Not Found' };

    const postUrl = `${SITE_URL}/blog/${slug}`;
    const imageUrl = post.cover_image || post.imageUrl || `${SITE_URL}/default-og.png`;
    const description = post.excerpt || post.metaDesc || `Read ${post.title} on CoderNest`;

    return {
        title: `${post.title} | CoderNest`,
        description: description,
        openGraph: {
            title: post.title,
            description: description,
            url: postUrl,
            type: 'article',
            publishedTime: new Date(post.createdAt).toISOString(),
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: description,
            images: [imageUrl],
        },
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    
    const post = await getCachedBlogBySlug(slug);

    if (!post) {
        return notFound();
    }

    // Increment view organically (fire and forget)
    // Note: Due to ISR caching, this will mainly increment on cache revalidations,
    // which acts as a lightweight heuristic rather than a strict 1:1 view counter.
    prisma.blog.update({
        where: { slug: post.slug },
        data: { views: { increment: 1 } }
    }).catch(console.error);


    const canonicalUrl = `${SITE_URL}/blog/${slug}`;
    const coverImage = post.cover_image || `${SITE_URL}/opengraph-image.jpg`;

    // Article JSON-LD structured data for Google organic indexing
    const articleJsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.metaTitle || post.title,
        description: post.metaDesc || post.title,
        image: coverImage,
        url: canonicalUrl,
        datePublished: new Date(post.createdAt).toISOString(),
        dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date(post.createdAt).toISOString(),
        author: {
            "@type": "Organization",
            name: "CoderNest",
            url: SITE_URL,
        },
        publisher: {
            "@type": "Organization",
            name: "CoderNest",
            url: SITE_URL,
            logo: {
                "@type": "ImageObject",
                url: `${SITE_URL}/opengraph-image.jpg`,
            },
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": canonicalUrl,
        },
    };

    return (
        <article className="pt-40 pb-24">
            {/* Article JSON-LD: enables Google rich results and organic article indexing */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
            />

            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-3xl mx-auto space-y-12">
                    <Link href="/blog" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" /> Back to Blog
                    </Link>

                    <div className="space-y-6">
                        <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
                            <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> 5 min read</span>
                            <span>{formatDate(post.createdAt)}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                            {post.title}
                        </h1>
                    </div>

                    <div className="aspect-[21/9] rounded-[2.5rem] overflow-hidden border border-white/5 relative">
                        <img 
                            src={coverImage} 
                            alt={post.title} 
                            className="w-full h-full object-cover" 
                        />
                    </div>


                    <BlogRenderer html={post.content} />


                    <div className="pt-12 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold">CN</div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">CoderNest Team</p>
                                <p className="text-xs text-slate-500">Expert Insights</p>
                            </div>
                        </div>
                        <ShareButtons title={post.title} />
                    </div>
                    
                    <div className="mt-16">
                        <PromotionAd />
                    </div>
                </div>
            </div>
        </article>
    );
}

