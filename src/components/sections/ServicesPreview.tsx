"use client";

import { motion } from "framer-motion";
import { Laptop, Database, Cpu, Layout, ArrowRight } from "lucide-react";
import Link from "next/link";

const services = [
    {
        title: "Web Development",
        description: "Build fast, SEO-optimized websites using Next.js and React. Tailored for performance and scalability.",
        icon: Laptop,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
    },
    {
        title: "SaaS Development",
        description: "End-to-end SaaS solutions with multi-tenancy, authentication, and subscription management.",
        icon: Database,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
    },
    {
        title: "AI Integration",
        description: "Leverage LLMs and custom AI models to automate workflows and enhance user interactions.",
        icon: Cpu,
        color: "text-pink-500",
        bg: "bg-pink-500/10",
    },
    {
        title: "UI/UX Design",
        description: "Modern, intuitive designs focused on user engagement and conversion rate optimization.",
        icon: Layout,
        color: "text-green-500",
        bg: "bg-green-500/10",
    },
];

export default function ServicesPreview() {
    return (
        <section className="py-24 bg-slate-950/50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Explore Our Core Services</h2>
                        <p className="text-slate-400 text-lg">
                            We provide comprehensive digital solutions to help your business thrive in the modern era.
                        </p>
                    </div>
                    <Link href="/services" className="flex items-center gap-2 text-blue-500 font-semibold hover:gap-4 transition-all">
                        View All Services <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all cursor-default"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${service.bg} flex items-center justify-center mb-6`}>
                                <service.icon className={`w-7 h-7 ${service.color}`} />
                            </div>
                            <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                {service.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
