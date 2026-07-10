"use client";

import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const projects = [
    {
        title: "FinTech Dashboard",
        category: "Web Development",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
        slug: "fintech-dashboard",
    },
    {
        title: "AI Wellness App",
        category: "AI Integration",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
        slug: "ai-wellness-app",
    },
    {
        title: "E-Commerce OS",
        category: "SaaS Development",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
        slug: "ecommerce-os",
    },
];

export default function PortfolioPreview() {
    return (
        <section className="py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold">Featured Projects</h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        A selection of our most recent and impactful work for clients worldwide.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.title}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group relative rounded-3xl overflow-hidden aspect-[4/5] bg-slate-900 border border-white/5"
                        >
                            <img
                                src={project.image}
                                alt={project.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                            />
                            <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pt-20">
                                <span className="text-blue-500 text-xs font-bold tracking-widest uppercase mb-2 block">
                                    {project.category}
                                </span>
                                <h3 className="text-2xl font-bold text-white mb-4">{project.title}</h3>
                                <Link
                                    href={`/portfolio/${project.slug}`}
                                    className="inline-flex items-center gap-2 text-white text-sm font-semibold opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                                >
                                    View Case Study <ExternalLink className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center">
                    <Link
                        href="/portfolio"
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-white/10 hover:bg-white/5 transition-all font-semibold"
                    >
                        View All Projects <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
