"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/components/providers/AuthProvider";
import toast from "react-hot-toast";

const navLinks = [
    { name: "Services", href: "/services" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { appUser, loading, logOut } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSignOut = async () => {
        await logOut();
        toast.success('Successfully logged out');
    };

    return (
        <nav
            className={cn(
                "sticky top-0 z-[100] w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-all duration-300",
                scrolled ? "py-3 shadow-sm" : "py-5"
            )}
        >
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="p-2 bg-blue-600 rounded-lg group-hover:rotate-12 transition-transform">
                            <Rocket className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tighter text-slate-900 dark:text-white">
                            Coder<span className="text-blue-500">Nest</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-blue-500",
                                    pathname === link.href ? "text-blue-500" : "text-slate-600 dark:text-slate-400"
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            
                            {!loading && (
                                appUser ? (
                                    <div className="flex items-center gap-3">
                                        <Link
                                            href={(appUser.role === 'SUPER_ADMIN' || appUser.role === 'EDITOR') ? '/admin' : '/dashboard'}
                                            className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={handleSignOut}
                                            className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                ) : (
                                    <Link
                                        href="/auth/login"
                                        className="px-5 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black text-sm font-semibold hover:opacity-90 transition-opacity"
                                    >
                                        Sign In
                                    </Link>
                                )
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button & Theme Toggle */}
                    <div className="md:hidden flex items-center gap-4">
                        <ThemeToggle />
                        <button
                            className="text-slate-600 dark:text-slate-300"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden glass absolute top-full left-0 w-full border-b border-slate-200 dark:border-white/10 py-6 px-4 space-y-4 shadow-xl dark:shadow-none"
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="block text-lg font-medium text-slate-700 dark:text-slate-300 hover:text-blue-500 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    {!loading && (
                        appUser ? (
                            <div className="space-y-3 pt-2">
                                <Link
                                    href={(appUser.role === 'SUPER_ADMIN' || appUser.role === 'EDITOR') ? '/admin' : '/dashboard'}
                                    className="block w-full py-3 rounded-xl bg-blue-600 text-white text-center font-bold"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => { handleSignOut(); setIsOpen(false); }}
                                    className="block w-full py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white text-center font-bold"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/auth/login"
                                className="block w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black text-center font-bold mt-2"
                                onClick={() => setIsOpen(false)}
                            >
                                Get Started
                            </Link>
                        )
                    )}
                </motion.div>
            )}
        </nav>
    );
}
