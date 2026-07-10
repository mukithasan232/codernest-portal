"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
    {
        content: "CoderNest took our vision and turned it into a reality faster than we ever expected. Their AI integration saved us 40+ hours a week.",
        author: "Sarah Jenkins",
        role: "CEO, TechFlow",
        avatar: "https://i.pravatar.cc/150?u=sarah",
    },
    {
        content: "The most professional agency we've worked with. Their code is clean, and the design is world-class. Highly recommended!",
        author: "David Chen",
        role: "Founder, Bloomly",
        avatar: "https://i.pravatar.cc/150?u=david",
    },
    {
        content: "Our conversion rate tripled after the redesign. The team at CoderNest truly understands user experience and modern web tech.",
        author: "Elena Rodriguez",
        role: "Marketing Director, SwiftPay",
        avatar: "https://i.pravatar.cc/150?u=elena",
    },
];

export default function Testimonials() {
    return (
        <section className="py-24 bg-slate-950/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] -ml-48 -mb-48" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold">Trusted by Visionaries</h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Don't just take our word for it. Here's what our partners say about us.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, index) => (
                        <motion.div
                            key={t.author}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-between"
                        >
                            <div>
                                <Quote className="w-10 h-10 text-blue-500/20 mb-6" />
                                <p className="text-slate-300 italic mb-8 leading-relaxed">
                                    "{t.content}"
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <img src={t.avatar} alt={t.author} className="w-12 h-12 rounded-full grayscale hover:grayscale-0 transition-all cursor-pointer" />
                                <div>
                                    <h4 className="font-bold text-white">{t.author}</h4>
                                    <p className="text-xs text-slate-500 font-medium">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
