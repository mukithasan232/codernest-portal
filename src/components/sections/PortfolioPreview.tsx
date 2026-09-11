"use client";

import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const projects = [
    {
        title: "MD Mukit Hasan Portfolio",
        category: "Full Stack & AI Specialist",
        image: "/uploads/media/1788382787841-202593526-Screenshot2026-09-03at2.59.43AM.png",
        slug: "mukit-codernest-cloud",
        liveUrl: "https://mukit.codernest.cloud/",
    },
    {
        title: "MedOS",
        category: "Hospital Management SaaS",
        image: "/dummy-laptop.png",
        slug: "medos-hospital-management",
        liveUrl: "https://hospital-management-portal-nu.vercel.app/",
    },
    {
        title: "SMM Elite",
        category: "Automated Marketplace",
        image: "/dummy-laptop.png",
        slug: "smm-elite-marketplace",
        liveUrl: "https://smm-panel-liart.vercel.app/",
    },
    {
        title: "CoderNest Cinema",
        category: "Premium Movie Database",
        image: "/uploads/media/1788382441956-422497682-Screenshot2026-09-03at2.53.54AM.png",
        slug: "cine-nest-movie-site-vercel-app",
        liveUrl: "https://cine-nest-movie-site.vercel.app/",
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.title}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group relative rounded-3xl overflow-hidden aspect-[4/5] bg-slate-900 border border-white/5 shadow-xl"
                        >
                            <img
                                src={project.image}
                                alt={project.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                            />
                            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pt-20">
                                <span className="text-blue-400 text-xs font-bold tracking-widest uppercase mb-1.5 block">
                                    {project.category}
                                </span>
                                <h3 className="text-xl font-bold text-white mb-3">{project.title}</h3>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Link
                                        href={`/portfolio/${project.slug}`}
                                        className="inline-flex items-center gap-1.5 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                                    >
                                        Case Study <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                    {project.liveUrl && (
                                        <a
                                            href={project.liveUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs font-semibold opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                                        >
                                            Live Demo <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                </div>
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
