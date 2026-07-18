import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Clock, Share2, Twitter, Linkedin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await prisma.blog.findFirst({
        where: { slug, status: 'published' }
    });

    if (!post) return { title: 'Post Not Found' };

    return {
        title: post.metaTitle || post.title,
        description: post.metaDesc || `Read ${post.title} on CoderNest`,
        keywords: post.keywords ? post.keywords.split(',').map(k => k.trim()) : undefined,
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    
    const post = await prisma.blog.findFirst({
        where: { slug, status: 'published' }
    });

    if (!post) {
        return notFound();
    }

    return (
        <article className="pt-40 pb-24">
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
                            src={post.cover_image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085"} 
                            alt={post.title} 
                            className="w-full h-full object-cover" 
                        />
                    </div>

                    <div 
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    <div className="pt-12 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold">CN</div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">CoderNest Team</p>
                                <p className="text-xs text-slate-500">Expert Insights</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all">
                                <Twitter className="w-5 h-5" />
                            </button>
                            <button className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all">
                                <Linkedin className="w-5 h-5" />
                            </button>
                            <button className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
