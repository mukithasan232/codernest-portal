import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Clock, Share2, Twitter, Linkedin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data: post } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

    if (!post) {
        return notFound();
    }

    return (
        <article className="pt-40 pb-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-3xl mx-auto space-y-12">
                    <Link href="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" /> Back to Blog
                    </Link>

                    <div className="space-y-6">
                        <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
                            <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> 5 min read</span>
                            <span>{formatDate(post.created_at)}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
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
                        className="prose prose-invert prose-lg max-w-none prose-p:text-slate-400 prose-headings:text-white prose-strong:text-white prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-img:rounded-xl"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    <div className="pt-12 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold">CN</div>
                            <div>
                                <p className="font-bold text-white">CoderNest Team</p>
                                <p className="text-xs text-slate-500">Expert Insights</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                                <Twitter className="w-5 h-5" />
                            </button>
                            <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                                <Linkedin className="w-5 h-5" />
                            </button>
                            <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
