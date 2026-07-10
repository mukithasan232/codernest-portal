import Link from "next/link";
import { LayoutDashboard, FolderKanban, MessageSquare, CreditCard, Settings, LogOut } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden pt-[73px]">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-slate-950/50 hidden md:flex flex-col">
                <div className="p-6">
                    <nav className="space-y-2">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-xl"
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            Overview
                        </Link>
                        <Link
                            href="/dashboard/projects"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                            <FolderKanban className="w-5 h-5" />
                            Projects
                        </Link>
                        <Link
                            href="/dashboard/messages"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                            <MessageSquare className="w-5 h-5" />
                            Messages
                        </Link>
                        <Link
                            href="/dashboard/payments"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                            <CreditCard className="w-5 h-5" />
                            Payments
                        </Link>
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-white/5">
                    <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                        <Settings className="w-5 h-5" />
                        Settings
                    </Link>
                    <button
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-xl transition-all mt-2"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
