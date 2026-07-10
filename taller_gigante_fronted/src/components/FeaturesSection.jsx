import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { FeatureCard } from "./FeatureCard"
import { Users, Car, ClipboardList, Wrench, LayoutDashboard, History } from "lucide-react"

const features = [
    {
        icon: Users,
        title: "Gestión de Clientes",
        description:
        "Base de datos completa de clientes con historial de servicios, información de contacto y preferencias personalizadas.",
    },
    {
        icon: Car,
        title: "Control de Vehículos",
        description:
        "Registro detallado de cada vehículo con especificaciones técnicas, kilometraje y recordatorios de mantenimiento.",
    },
    {
        icon: ClipboardList,
        title: "Órdenes de Trabajo",
        description:
        "Sistema inteligente de órdenes de trabajo con seguimiento en tiempo real y estados del proceso.",
    },
    {
        icon: Wrench,
        title: "Seguimiento de Reparaciones",
        description:
        "Monitoreo completo del progreso de reparaciones con actualizaciones y observaciones técnicas.",
    },
    {
        icon: LayoutDashboard,
        title: "Dashboard del Taller",
        description:
        "Panel de control con métricas, trabajos pendientes, vehículos registrados y actividad reciente.",
    },
    {
        icon: History,
        title: "Historial de Mantenimiento",
        description:
        "Registro histórico de servicios realizados, búsqueda por placa y seguimiento de cada vehículo.",
    },
    ]

    export function FeaturesSection() {
    const ref = useRef(null)

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    })

    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])

    return (
        <section ref={ref} id="features" className="relative py-32 overflow-hidden bg-cream">
        <motion.div style={{ y: backgroundY }} className="absolute inset-0 pointer-events-none">
            <div
            className="absolute inset-0"
            style={{
                background: `
                radial-gradient(ellipse at 20% 30%, rgba(168, 70, 15, 0.10) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 70%, rgba(61, 90, 82, 0.08) 0%, transparent 50%)
                `,
            }}
            />

            <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
                backgroundImage: `
                linear-gradient(rgba(168, 70, 15, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(61, 90, 82, 0.3) 1px, transparent 1px)
                `,
                backgroundSize: "100px 100px",
            }}
            />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
            >
            <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-accent/15 border border-accent/35"
            >
                <Wrench className="w-4 h-4 text-accent" />
                <span className="text-sm font-mono text-accent tracking-wider uppercase font-semibold">
                Características
                </span>
            </motion.div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                <span className="block">Herramientas</span>
                <span className="block text-primary mt-2">Profesionales</span>
            </h2>

            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                Todo lo que necesitas para gestionar tu taller mecánico de forma eficiente y profesional.
            </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
                <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index}
                />
            ))}
            </div>

            <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-20 h-[2px] bg-gradient-to-r from-transparent via-accent/40 to-transparent"
            />
        </div>
        </section>
    )
}
