"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Save, Send } from "lucide-react";
import toast from "react-hot-toast";
import { saveBlogPost } from "@/lib/actions/admin.actions";

export default function AdminBlogPage() {
    const [loading, setLoading] = useState(false);
    const [topic, setTopic] = useState("");
    const [post, setPost] = useState<any>(null);

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        try {
            const response = await fetch("/api/ai/blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic }),
            });
            const data = await response.json();
            setPost(data);
        } catch (error) {
            toast.error("Generation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!post) return;
        setLoading(true);
        try {
            const res = await saveBlogPost({
                title: post.title,
                slug: post.slug,
                content: post.content,
            });

            if (!res.success) throw new Error(res.error);
            
            toast.success("Blog post saved!");
            setPost(null);
            setTopic("");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">AI Blog Generator</h1>
                <p className="text-slate-400">Scale your SEO by generating high-quality blog posts with AI.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Topic or Keywords</label>
                            <input
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g. Benefits of Next.js 15 for SaaS"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                        <button
                            disabled={loading || !topic.trim()}
                            onClick={handleGenerate}
                            className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    Generate Blog Post
                                    <Sparkles className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {post ? (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass p-8 rounded-3xl border border-blue-500/20 space-y-6 max-h-[70vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between sticky top-0 bg-slate-900 py-2 -mx-2 px-2 rounded-lg">
                                <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Post Preview</span>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-blue-600 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                                >
                                    <Save className="w-3 h-3" /> Save to DB
                                </button>
                            </div>

                            <h2 className="text-2xl font-bold text-white">{post.title}</h2>
                            <p className="text-xs text-slate-500">Slug: {post.slug}</p>
                            <div className="prose prose-invert prose-sm">
                                <p className="whitespace-pre-wrap text-slate-400 leading-relaxed">
                                    {post.content}
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-[400px] rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center p-10 space-y-4">
                            <Send className="w-10 h-10 text-slate-700" />
                            <p className="text-slate-500 text-sm italic">Generated content will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
