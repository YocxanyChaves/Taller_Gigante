import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function Layout({ children }) {
    return (
        <div className="min-h-screen bg-[#05070b] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(220,38,38,0.16),transparent_35%)]" />

        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="relative z-10 flex">
            <Sidebar />

            <main className="flex-1 min-h-screen ml-72">
            <Topbar />
            <section className="p-8">{children}</section>
            </main>
        </div>
        </div>
    );
}