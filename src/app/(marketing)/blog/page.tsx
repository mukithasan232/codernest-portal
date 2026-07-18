import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Blog | CoderNest",
    description: "Insights on web development, SaaS, and AI from the CoderNest team.",
};

export default async function BlogPage() {
    const posts = await prisma.blog.findMany({
        where: { status: 'published' },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="pt-32 pb-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16 space-y-6">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Tech & Design Insights</h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Stay updated with the latest trends in development, AI, and digital transformation.
                    </p>

                    <div className="relative max-w-xl mx-auto mt-10">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                    {posts && posts.length > 0 ? (
                        posts.map((post: any, index) => (
                            <Link
                                href={`/blog/${post.slug}`}
                                key={index}
                                className="group space-y-6"
                            >
                                <div className="aspect-video rounded-[2.5rem] overflow-hidden relative glass border border-white/5">
                                    <img
                                        src={post.cover_image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085"}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                    />
                                    <div className="absolute top-6 left-6 px-4 py-1.5 bg-blue-600 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                                        Article
                                    </div>
                                </div>
                                <div className="space-y-4 px-2">
                                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium uppercase tracking-tighter">
                                        <span>{formatDate(post.createdAt)}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                        <span>5 min read</span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors leading-tight">
                                        {post.title}
                                    </h2>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                                        {/* Since content is HTML, we might need a utility to strip tags, but line-clamp will handle text overflow visually */}
                                        <span dangerouslySetInnerHTML={{ __html: post.content.substring(0, 200) }} />...
                                    </p>
                                    <div className="flex items-center gap-2 text-blue-500 font-bold group-hover:gap-4 transition-all pt-2">
                                        Read Article <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-1 md:col-span-2 text-center py-20 text-slate-500">
                            No published articles found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
