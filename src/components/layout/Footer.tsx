import Link from "next/link";
import { Rocket, Github, Twitter, Linkedin, Mail } from "lucide-react";

const footerLinks = {
    company: [
        { name: "About Us", href: "/about" },
        { name: "Portfolio", href: "/portfolio" },
        { name: "Blog", href: "/blog" },
        { name: "Contact", href: "/contact" },
    ],
    services: [
        { name: "Web Development", href: "/services" },
        { name: "SaaS Solutions", href: "/services" },
        { name: "AI Integration", href: "/services" },
        { name: "UI/UX Design", href: "/services" },
    ],
    legal: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Cookie Policy", href: "/cookies" },
    ],
};

export default function Footer() {
    return (
        <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-white/5 pt-20 pb-10 transition-colors duration-300">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <Rocket className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tighter text-slate-900 dark:text-white">
                                Coder<span className="text-blue-500">Nest</span>
                            </span>
                        </Link>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
                            We build modern, scalable digital products for forward-thinking companies. Transforming ideas into powerful realities.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="p-2 bg-slate-200 dark:bg-white/5 rounded-lg hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-600/20 dark:hover:text-blue-500 transition-all text-slate-600 dark:text-slate-400">
                                <Twitter className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="p-2 bg-slate-200 dark:bg-white/5 rounded-lg hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-600/20 dark:hover:text-blue-500 transition-all text-slate-600 dark:text-slate-400">
                                <Github className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="p-2 bg-slate-200 dark:bg-white/5 rounded-lg hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-600/20 dark:hover:text-blue-500 transition-all text-slate-600 dark:text-slate-400">
                                <Linkedin className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-slate-900 dark:text-white font-semibold mb-6">Company</h4>
                        <ul className="space-y-4">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-slate-900 dark:text-white font-semibold mb-6">Services</h4>
                        <ul className="space-y-4">
                            {footerLinks.services.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-slate-900 dark:text-white font-semibold mb-6">Newsletter</h4>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">Subscribe for the latest updates in tech and design.</p>
                        <form className="relative">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                            <button className="absolute right-2 top-2 p-1.5 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                                <Mail className="w-4 h-4 text-white" />
                            </button>
                        </form>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-xs text-center md:text-left">
                        © {new Date().getFullYear()} CoderNest Agency. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        {footerLinks.legal.map((link) => (
                            <Link key={link.name} href={link.href} className="text-slate-500 hover:text-slate-700 dark:hover:text-white text-xs transition-colors">
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
