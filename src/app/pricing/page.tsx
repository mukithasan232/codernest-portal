"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const plans = [
    {
        name: "Starter",
        price: 199,
        description: "Launch your presence with a premium landing page.",
        features: ["Single Page Site", "Custom UI Design", "Responsive Layout", "Contact Form", "Basic SEO", "Google Analytics"],
    },
    {
        name: "Business",
        price: 499,
        description: "Full-feature website for growing brands.",
        features: ["5 Custom Pages", "CMS Integration", "Advanced SEO", "Custom Backend", "Email Automation", "Monthly Maintenance"],
        recommended: true,
    },
    {
        name: "Pro",
        price: 999,
        description: "Complex SaaS and AI-integrated platforms.",
        features: ["Custom SaaS App", "AI API Integration", "Stripe Payments", "Admin Dashboard", "User Auth", "Priority Support"],
    },
];

export default function PricingPage() {
    const handleCheckout = async (plan: any) => {
        const loadingToast = toast.loading("Preparing checkout...");
        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: plan.price,
                    planName: plan.name,
                }),
            });
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || "Failed to create session");
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            toast.dismiss(loadingToast);
        }
    };

    return (
        <div className="pt-32 pb-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Investment for Growth</h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Scale your business with our expertise. Choose a plan that fits your current needs and upgrade anytime.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative p-10 rounded-[2.5rem] border flex flex-col ${plan.recommended
                                    ? "bg-blue-600/5 border-blue-500 shadow-2xl shadow-blue-500/10 z-10"
                                    : "bg-white/5 border-white/10"
                                }`}
                        >
                            {plan.recommended && (
                                <div className="absolute top-0 right-10 -translate-y-1/2 px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-widest shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-10">
                                <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-extrabold text-white">${plan.price}</span>
                                    <span className="text-slate-500">USD</span>
                                </div>
                                <p className="text-slate-400 text-sm mt-6 leading-relaxed">
                                    {plan.description}
                                </p>
                            </div>

                            <div className="space-y-4 mb-12 flex-grow">
                                {plan.features.map((feature) => (
                                    <div key={feature} className="flex items-center gap-4 text-slate-300">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                            <Check className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <span className="text-sm font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleCheckout(plan)}
                                className={`w-full py-5 rounded-2xl font-bold transition-all ${plan.recommended
                                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/20"
                                        : "bg-white text-black hover:bg-slate-200"
                                    }`}
                            >
                                Get Started Now
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
