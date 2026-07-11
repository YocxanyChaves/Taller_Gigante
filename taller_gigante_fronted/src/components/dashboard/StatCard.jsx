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
        text: "text-primary",
        glow: "shadow-[0_0_30px_rgba(59,130,246,0.18)]",
        },

        red: {
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        text: "text-accent",
        glow: "shadow-[0_0_30px_rgba(239,68,68,0.18)]",
        },
    };

    const current = styles[color];

    return (
        <div className="group relative overflow-hidden rounded-3xl border border-foreground/10 bg-card/60 p-5 shadow-2xl shadow-black/5 hover:bg-foreground/5 transition-all duration-300">
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-foreground/5 blur-3xl opacity-0 group-hover:opacity-100 transition duration-500" />

        <div className="relative z-10 flex items-start justify-between">
            <div>
            <p className="text-sm text-muted-foreground">{title}</p>

            <h3 className="mt-3 text-4xl font-black tracking-tight text-foreground">
                {value}
            </h3>

            <p className="mt-3 text-sm text-muted-foreground">{change}</p>
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
