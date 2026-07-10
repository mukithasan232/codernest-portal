import { motion } from "framer-motion";
import {
    Laptop,
    Database,
    Cpu,
    Layout,
    CheckCircle2,
    Rocket,
    Zap,
    ShieldCheck
} from "lucide-react";
import Link from "next/link";

const services = [
    {
        title: "Web Development",
        description: "High-performance, modern websites built with Next.js, React, and Tailwind CSS. We focus on speed, SEO, and accessibility.",
        icon: Laptop,
        features: ["Next.js 15 Implementation", "Responsive Design", "Fast TTI", "SEO Optimized", "CMS Integration"],
        color: "blue",
    },
    {
        title: "SaaS Development",
        description: "Scalable software-as-a-service platforms with advanced authentication, subscription management, and multi-tenancy.",
        icon: Database,
        features: ["Stripe Subscriptions", "User Roles & Permissions", "Analytics Dashboard", "API Ready", "Cloud Scalability"],
        color: "purple",
    },
    {
        title: "AI Integration",
        description: "Custom AI solutions leveraging LLMs, vector databases, and machine learning to automate business processes.",
        icon: Cpu,
        features: ["OpenAI/Anthropic Integration", "Vector Search (Pinecone)", "AI Chatbots", "Smart Data Analysis", "Workflow Automation"],
        color: "pink",
    },
    {
        title: "UI/UX Design",
        description: "Strategic design systems that prioritize user experience and drive conversion through psychological design principles.",
        icon: Layout,
        features: ["Figma Prototyping", "Design Systems", "User Testing", "Conversion Optimization", "Micro-interactions"],
        color: "green",
    },
];

export default function ServicesPage() {
    return (
        <div className="pt-32 pb-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-24 space-y-6">
                    <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight">Our Expertise</h1>
                    <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">
                        We don't just write code; we solve business problems with engineering excellence. Explore our core service verticals.
                    </p>
                </div>

                <div className="space-y-32">
                    {services.map((service, index) => (
                        <div
                            key={service.title}
                            className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-16`}
                        >
                            <div className="flex-1 space-y-8">
                                <div className={`w-16 h-16 rounded-2xl bg-${service.color}-500/10 flex items-center justify-center`}>
                                    <service.icon className={`w-8 h-8 text-${service.color}-500`} />
                                </div>
                                <h2 className="text-4xl font-bold text-white">{service.title}</h2>
                                <p className="text-slate-400 text-lg leading-relaxed">
                                    {service.description}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {service.features.map((feature) => (
                                        <div key={feature} className="flex items-center gap-3 text-slate-300">
                                            <CheckCircle2 className={`w-5 h-5 text-${service.color}-500`} />
                                            <span className="text-sm font-semibold">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                                <Link
                                    href="/contact"
                                    className={`inline-block px-10 py-5 rounded-2xl bg-${service.color}-600 text-white font-bold hover:bg-${service.color}-700 transition-all shadow-xl shadow-${service.color}-600/20`}
                                >
                                    Discuss your project
                                </Link>
                            </div>

                            <div className="flex-1 w-full lg:w-auto">
                                <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 relative overflow-hidden flex items-center justify-center p-12">
                                    <div className={`absolute inset-0 bg-${service.color}-600/5 mix-blend-overlay`} />
                                    <service.icon className={`w-40 h-40 text-${service.color}-500/20 animate-pulse`} />

                                    {/* Abstract design elements */}
                                    <div className="absolute top-10 right-10 w-20 h-20 border border-white/10 rounded-full" />
                                    <div className="absolute bottom-20 left-10 w-32 h-32 border border-white/5 rounded-full" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Value Props Section */}
                <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-12 bg-white/5 rounded-[3rem] border border-white/5 p-16">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Rocket className="w-8 h-8 text-blue-500" />
                        </div>
                        <h4 className="text-xl font-bold">Speed to Market</h4>
                        <p className="text-slate-400 text-sm">Launch your MVP in weeks, not months, with our optimized dev cycles.</p>
                    </div>
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-green-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck className="w-8 h-8 text-green-500" />
                        </div>
                        <h4 className="text-xl font-bold">Secure by Design</h4>
                        <p className="text-slate-400 text-sm">Industrial-grade security protocols integrated from the very first line of code.</p>
                    </div>
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-purple-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Zap className="w-8 h-8 text-purple-500" />
                        </div>
                        <h4 className="text-xl font-bold">Peak Performance</h4>
                        <p className="text-slate-400 text-sm">Lighthouse scores of 90+ guaranteed for all our public-facing web products.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
