"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Code, Shield, Zap } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium tracking-wide">
                            Voted #1 Agency in 2026
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                            We Build <span className="gradient-text">Modern, Scalable</span> <br />
                            Digital Products
                        </h1>
                        <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
                            Transform your business with cutting-edge web applications, AI-powered solutions, and stunning user experiences designed for growth.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link
                            href="/contact"
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group"
                        >
                            Get Quote
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/portfolio"
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        >
                            View Portfolio
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <Code className="w-6 h-6" />
                            <span className="text-sm font-medium">Clean Code</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Zap className="w-6 h-6" />
                            <span className="text-sm font-medium">Fast Performance</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Shield className="w-6 h-6" />
                            <span className="text-sm font-medium">Secure Systems</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Code className="w-6 h-6" />
                            <span className="text-sm font-medium">Scalable Apps</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Hero Illustration / Mockup could go here */}
            <div className="mt-20 px-4 md:px-0">
                <div className="max-w-6xl mx-auto glass rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-video relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 mix-blend-overlay" />
                    <div className="flex items-center justify-center h-full">
                        <span className="text-slate-500 font-mono">Modern SaaS Dashboard Preview</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
