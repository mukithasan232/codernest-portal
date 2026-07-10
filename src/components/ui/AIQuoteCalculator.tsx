"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, DollarSign, Clock, ListChecks, ArrowRight } from "lucide-react";

export default function AIQuoteCalculator() {
    const [loading, setLoading] = useState(false);
    const [quote, setQuote] = useState<any>(null);
    const [input, setInput] = useState("");

    const handleCalculate = async () => {
        if (!input.trim()) return;
        setLoading(true);
        try {
            const response = await fetch("/api/ai/quote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectDetails: input }),
            });
            const data = await response.json();
            setQuote(data);
        } catch (error) {
            console.error("AI Quote error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {!quote ? (
                <div className="glass p-8 md:p-12 rounded-[2rem] border border-blue-500/20 shadow-2xl shadow-blue-500/5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold">AI Quote Calculator</h3>
                    </div>
                    <p className="text-slate-400 mb-8">
                        Tell us about your project in a few sentences. Our AI will analyze your requirements and provide an instant estimate.
                    </p>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="e.g., I want a modern SaaS platform for fitness tracking with real-time analytics and Stripe integration..."
                        className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all mb-8 resize-none"
                    />
                    <button
                        disabled={loading || !input.trim()}
                        onClick={handleCalculate}
                        className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                Generate Estimate
                                <Sparkles className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass p-8 md:p-12 rounded-[2rem] border border-blue-500/50 space-y-10 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4">
                        <button onClick={() => setQuote(null)} className="text-slate-500 hover:text-white text-sm font-medium">Reset</button>
                    </div>

                    <div className="text-center space-y-2">
                        <h3 className="text-3xl font-bold">Your Project Estimate</h3>
                        <p className="text-slate-400">Based on your requirements</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center gap-4">
                            <div className="p-3 bg-blue-600 rounded-xl">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Estimated Price</p>
                                <p className="text-2xl font-extrabold text-white">{quote.estimatedPrice}</p>
                            </div>
                        </div>
                        <div className="p-6 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center gap-4">
                            <div className="p-3 bg-purple-600 rounded-xl">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Timeline</p>
                                <p className="text-2xl font-extrabold text-white">{quote.estimatedTimeline}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 font-bold mb-4">
                            <ListChecks className="w-5 h-5 text-blue-500" />
                            Recommended Features
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            {quote.recommendedFeatures.map((f: string) => (
                                <div key={f} className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    <span className="text-slate-300">{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-900 border border-white/5">
                        <p className="text-slate-300 italic text-sm text-center leading-relaxed">
                            "{quote.message}"
                        </p>
                    </div>

                    <button className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all flex items-center justify-center gap-2">
                        Proceed with this Plan
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </motion.div>
            )}
        </div>
    );
}
