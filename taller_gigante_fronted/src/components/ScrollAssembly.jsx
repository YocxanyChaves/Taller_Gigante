import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { Cog, Cpu, Database, Shield, Zap, Network } from "lucide-react"

const assemblyParts = [
    { icon: Cog, label: "Motor de Gestión", color: "primary" },
    { icon: Database, label: "Base de Datos", color: "primary" },
    { icon: Shield, label: "Seguridad", color: "accent" },
    { icon: Cpu, label: "Procesamiento", color: "primary" },
    { icon: Network, label: "Conectividad", color: "primary" },
    { icon: Zap, label: "Rendimiento", color: "accent" },
    ]

    export function ScrollAssembly() {
    const containerRef = useRef(null)

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    })

    return (
        <section ref={containerRef} id="system" className="relative py-32 overflow-hidden bg-muted">
        <div
            className="absolute inset-0"
            style={{
            background:
                "linear-gradient(180deg, var(--color-cream) 0%, var(--color-background) 50%, var(--color-cream) 100%)",
            }}
        />

        <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
            backgroundImage: `
                linear-gradient(rgba(61, 90, 82, 0.45) 1px, transparent 1px),
                linear-gradient(90deg, rgba(61, 90, 82, 0.45) 1px, transparent 1px)
            `,
            backgroundSize: "30px 30px",
            }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
            >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                <span className="block">Sistema</span>
                <span className="block text-primary mt-2">Modular</span>
            </h2>

            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Componentes que se ensamblan perfectamente para crear la solución ideal para tu taller.
            </p>
            </motion.div>

            <div className="relative flex items-center justify-center min-h-[500px]">
            <motion.div
                className="absolute w-32 h-32 rounded-full bg-card border-2 border-primary/40 flex items-center justify-center z-20"
                animate={{
                scale: [1, 1.03, 1],
                boxShadow: [
                    "0 8px 40px rgba(61, 90, 82, 0.2)",
                    "0 8px 50px rgba(61, 90, 82, 0.35)",
                    "0 8px 40px rgba(61, 90, 82, 0.2)",
                ],
                }}
                transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                }}
            >
                <span className="text-3xl font-bold text-primary">TMG</span>
            </motion.div>

            {assemblyParts.map((part, index) => {
                const angle = (index * 360) / assemblyParts.length
                const radius = 180

                return (
                <AssemblyPart
                    key={index}
                    icon={part.icon}
                    label={part.label}
                    color={part.color}
                    angle={angle}
                    radius={radius}
                    index={index}
                    scrollProgress={scrollYProgress}
                />
                )
            })}

            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: 500 }}>
                <defs>
                <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(61, 90, 82, 0)" />
                    <stop offset="50%" stopColor="rgba(61, 90, 82, 0.4)" />
                    <stop offset="100%" stopColor="rgba(61, 90, 82, 0)" />
                </linearGradient>
                </defs>

                {assemblyParts.map((_, index) => {
                const angle = ((index * 360) / assemblyParts.length) * (Math.PI / 180)
                const x2 = 50 + Math.cos(angle) * 30
                const y2 = 50 + Math.sin(angle) * 36

                return (
                    <motion.line
                    key={index}
                    x1="50%"
                    y1="50%"
                    x2={`${x2}%`}
                    y2={`${y2}%`}
                    stroke="url(#line-gradient)"
                    strokeWidth="1"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    />
                )
                })}
            </svg>
            </div>
        </div>
        </section>
    )
    }

    function AssemblyPart({ icon: Icon, label, color, angle, radius, index, scrollProgress }) {
    const x = Math.cos((angle * Math.PI) / 180) * radius
    const y = Math.sin((angle * Math.PI) / 180) * radius

    const partProgress = useTransform(
        scrollProgress,
        [0.1 + index * 0.05, 0.3 + index * 0.05],
        [0, 1]
    )

    const partX = useTransform(partProgress, [0, 1], [x * 2, x])
    const partY = useTransform(partProgress, [0, 1], [y * 2, y])
    const partOpacity = useTransform(partProgress, [0, 0.5, 1], [0, 0.5, 1])
    const partScale = useTransform(partProgress, [0, 1], [0.5, 1])

    const isAccent = color === "accent"

    return (
        <motion.div
        className="absolute flex flex-col items-center gap-2"
        style={{
            x: partX,
            y: partY,
            opacity: partOpacity,
            scale: partScale,
        }}
        >
        <motion.div
            className={`w-16 h-16 rounded-xl bg-card flex items-center justify-center border ${
            isAccent ? "border-accent/40" : "border-primary/40"
            }`}
            whileHover={{
            scale: 1.1,
            boxShadow: isAccent
                ? "0 8px 30px rgba(168, 70, 15, 0.3)"
                : "0 8px 30px rgba(61, 90, 82, 0.3)",
            }}
            transition={{ duration: 0.3 }}
        >
            <Icon className={`w-7 h-7 ${isAccent ? "text-accent" : "text-primary"}`} />
        </motion.div>

        <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">{label}</span>
        </motion.div>
    )
}
