import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 text-zinc-900 dark:bg-[#05070b] dark:text-white relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.10),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(220,38,38,0.08),transparent_35%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(220,38,38,0.16),transparent_35%)]" />

        <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.04] bg-[linear-gradient(to_right,#00000010_1px,transparent_1px),linear-gradient(to_bottom,#00000010_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="relative z-10 flex">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="flex-1 min-h-screen lg:ml-72">
            <Topbar onMenuClick={() => setSidebarOpen(true)} />
            <section className="p-4 sm:p-6 lg:p-8">{children}</section>
            </main>
        </div>
        </div>
    );
}
