import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import { AnimatedGear } from "./AnimatedGear"

export function CTASection(){
    return (
        <section className="relative py-32 overflow-hidden bg-black">
        <div
            className="absolute inset-0"
            style={{
            background:
                "linear-gradient(180deg, #050505 0%, #111827 50%, #050505 100%)",
            }}
        />

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -left-20 opacity-10">
            <AnimatedGear size={250} />
            </div>

            <div className="absolute -bottom-20 -right-20 opacity-10">
            <AnimatedGear size={300} reverse />
            </div>
        </div>

        <div
            className="absolute inset-0 pointer-events-none"
            style={{
            background: `
                radial-gradient(ellipse at 30% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
                radial-gradient(ellipse at 70% 50%, rgba(239, 68, 68, 0.07) 0%, transparent 50%)
            `,
            }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-red-500/10 border border-red-500/30"
            >
            <Sparkles className="w-4 h-4 text-red-500" />
            <span className="text-sm font-mono text-red-400 tracking-wider uppercase">
                Comienza Ahora
            </span>
            </motion.div>

            <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            >
            <span className="block">Transforma Tu Taller</span>
            <span className="block text-red-500 mt-2">Hoy Mismo</span>
            </motion.h2>

            <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
            Organiza clientes, vehículos, órdenes de trabajo e historial de reparaciones
            desde una plataforma moderna creada para talleres mecánicos.
            </motion.p>

            <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
            <button className="group relative overflow-hidden bg-red-600 hover:bg-red-700 text-white px-10 py-5 text-lg font-semibold rounded-xl transition-all duration-300 shadow-[0_8px_35px_rgba(239,68,68,0.25)]">
                <span className="relative z-10 flex items-center gap-2">
                Comenzar Gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
            </button>

            <button className="border border-blue-500/40 hover:border-blue-500 text-white px-10 py-5 text-lg font-semibold rounded-xl transition-all duration-300 hover:bg-blue-500/10">
                Solicitar Demo
            </button>
            </motion.div>

            <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400"
            >
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Sin tarjeta de crédito</span>
            </div>

            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Configuración rápida</span>
            </div>

            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Sistema web responsive</span>
            </div>
            </motion.div>
        </div>
        </section>
    )
}