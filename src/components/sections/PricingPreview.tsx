"use client";

import { motion } from "framer-motion";
import { Check, Rocket } from "lucide-react";
import Link from "next/link";

const plans = [
    {
        name: "Starter",
        price: "199",
        description: "Perfect for small projects and MVPs.",
        features: ["Single Landing Page", "UI/UX Design", "Responsive Layout", "Contact Form", "3 Revisions"],
        buttonText: "Start Project",
        recommended: false,
    },
    {
        name: "Business",
        price: "499",
        description: "Most popular for growing startups.",
        features: ["Up to 5 Pages", "Custom Backend", "Supabase Integration", "SEO Optimization", "Unlimited Revisions"],
        buttonText: "Choose Business",
        recommended: true,
    },
    {
        name: "Pro",
        price: "999",
        description: "Full-scale enterprise solutions.",
        features: ["Custom SaaS App", "AI Integration", "Stripe Workflow", "Admin Dashboard", "Premium Support"],
        buttonText: "Go Weekly/Custom",
        recommended: false,
    },
];

export default function PricingPreview() {
    return (
        <section className="py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold">Simple, Transparent Pricing</h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Choose the package that fits your needs. No hidden fees, just high-quality results.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`relative p-8 rounded-3xl border flex flex-col ${plan.recommended
                                    ? "bg-blue-600/5 border-blue-500 shadow-2xl shadow-blue-500/10 scale-105 z-10"
                                    : "bg-white/5 border-white/10"
                                }`}
                        >
                            {plan.recommended && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-widest">
                                    Recommended
                                </div>
                            )}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-white">${plan.price}</span>
                                    <span className="text-slate-500 text-sm">/starting</span>
                                </div>
                                <p className="text-slate-400 text-sm mt-4">{plan.description}</p>
                            </div>

                            <ul className="space-y-4 mb-10 flex-grow">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm text-slate-300">
                                        <Check className="w-5 h-5 text-blue-500 shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/contact"
                                className={`w-full py-4 rounded-xl font-bold text-center transition-all ${plan.recommended
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : "bg-white/10 text-white hover:bg-white/20"
                                    }`}
                            >
                                {plan.buttonText}
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
