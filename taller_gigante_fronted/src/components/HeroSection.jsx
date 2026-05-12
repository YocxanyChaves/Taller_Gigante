import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ParticleField } from "./ParticleField"
import { GridOverlay } from "./GridOverlay"
import { ChevronDown, Wrench, LogIn } from "lucide-react"

export function HeroSection() {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    })

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

    return (
        <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background - aged paper look */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-cream to-muted paper-texture" />

        {/* Animated background elements */}
        <motion.div style={{ y }} className="absolute inset-0">
            <ParticleField />
            <GridOverlay />
        </motion.div>

        {/* Subtle radial overlay */}
        <div
            className="absolute inset-0 pointer-events-none"
            style={{
            background: "radial-gradient(ellipse at center, transparent 0%, oklch(0.96 0.01 80 / 0.6) 70%)",
            }}
        />

        {/* Main content */}
        <motion.div style={{ opacity, scale }} className="relative z-10 text-center px-4 max-w-6xl mx-auto">
            {/* Badge */}
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex justify-center px-4 py-2 mb-6 rounded-full bg-accent/15 border border-accent/40"
            >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-mono text-accent tracking-wider uppercase font-semibold">
                Taller Mecánico Gigante
            </span>
            </motion.div>

            {/* Main title */}
            <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
            >
            <span className="block text-foreground">Insertar Logo</span>
            <span className="block text-accent text-shadow-red mt-2">del Taller</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
            >
            La plataforma de gestión de talleres más completa del mercado. 
            Control total sobre clientes, vehículos, órdenes de trabajo y reparaciones.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
            <a href="/login"
                className="group relative overflow-hidden bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg font-semibold rounded-lg transition-all duration-300"
                >
                <span className="relative z-10 flex items-center gap-2">
                    <LogIn className="w-5 h-5" />
                    Iniciar Sesión
                </span>
                </a>

                <a href="/register"
                className="group relative overflow-hidden border border-blue-500/50 hover:border-blue-500 text-white px-8 py-6 text-lg font-semibold rounded-lg transition-all duration-300 hover:bg-blue-500/10"
                >
                <span className="relative z-10 flex items-center gap-2">
                    <Wrench className="w-5 h-5" />
                    Registrarse
                </span>
                </a>
            </motion.div>

            {/* Stats */}
            <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto"
            >
            {[
                { value: "10K+", label: "Vehículos", color: "text-accent" },
                { value: "500+", label: "Talleres", color: "text-primary" },
                { value: "99.9%", label: "Uptime", color: "text-accent" },
            ].map((stat, i) => (
                <div key={i} className="text-center">
                <div className={`text-3xl md:text-4xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1 font-mono uppercase tracking-wider">
                    {stat.label}
                </div>
                </div>
            ))}
            </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
            <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
            >
            <span className="text-xs font-mono uppercase tracking-widest">Scroll</span>
            <ChevronDown className="w-5 h-5 text-accent" />
            </motion.div>
        </motion.div>
        </section>
    )
}
