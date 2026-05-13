export function StatCard({
    title,
    value,
    change,
    icon: Icon,
    color = "blue",
    }) {
    const styles = {
        blue: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        text: "text-blue-400",
        glow: "shadow-[0_0_30px_rgba(59,130,246,0.18)]",
        },

        red: {
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        text: "text-red-400",
        glow: "shadow-[0_0_30px_rgba(239,68,68,0.18)]",
        },
    };

    const current = styles[color];

    return (
        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30 hover:bg-white/[0.06] transition-all duration-300">
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/5 blur-3xl opacity-0 group-hover:opacity-100 transition duration-500" />

        <div className="relative z-10 flex items-start justify-between">
            <div>
            <p className="text-sm text-white/45">{title}</p>

            <h3 className="mt-3 text-4xl font-black tracking-tight text-white">
                {value}
            </h3>

            <p className="mt-3 text-sm text-white/55">{change}</p>
            </div>

            <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${current.border} ${current.bg} ${current.glow}`}
            >
            <Icon className={`h-7 w-7 ${current.text}`} />
            </div>
        </div>
        </div>
    );
    }