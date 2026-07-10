import { motion } from "framer-motion"
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react"
import { AnimatedGear } from "./AnimatedGear"

const contactInfo = [
    {
        icon: Phone,
        label: "Teléfono",
        value: "+506 8888-8888",
    },
    {
        icon: Mail,
        label: "Correo",
        value: "contacto@tallergigante.com",
    },
    {
        icon: MapPin,
        label: "Ubicación",
        value: "San José, Costa Rica",
    },
    {
        icon: Clock,
        label: "Horario",
        value: "Lunes a viernes, 8:00 am – 5:00 pm",
    },
]

export function CTASection(){
    return (
        <section id="contact" className="relative py-32 overflow-hidden bg-background">
        <div
            className="absolute inset-0"
            style={{
            background:
                "linear-gradient(180deg, var(--color-background) 0%, var(--color-cream) 50%, var(--color-background) 100%)",
            }}
        />

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -left-20 opacity-25">
            <AnimatedGear size={250} variant="rust" />
            </div>

            <div className="absolute -bottom-20 -right-20 opacity-25">
            <AnimatedGear size={300} reverse variant="bronze" />
            </div>
        </div>

        <div
            className="absolute inset-0 pointer-events-none"
            style={{
            background: `
                radial-gradient(ellipse at 30% 50%, rgba(61, 90, 82, 0.08) 0%, transparent 50%),
                radial-gradient(ellipse at 70% 50%, rgba(168, 70, 15, 0.08) 0%, transparent 50%)
            `,
            }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-accent/10 border border-accent/30"
            >
                <Send className="w-4 h-4 text-accent" />
                <span className="text-sm font-mono text-accent tracking-wider uppercase">
                Contáctanos
                </span>
            </motion.div>

            <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
            >
                <span className="block">Hablemos de tu</span>
                <span className="block text-accent mt-2">Taller</span>
            </motion.h2>

            <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
                ¿Tienes dudas sobre el sistema o quieres implementarlo en tu taller?
                Escríbenos por cualquiera de estos medios.
            </motion.p>
            </div>

            <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
            {contactInfo.map((item) => (
                <div
                key={item.label}
                className="backdrop-blur-md bg-card/80 border border-foreground/10 rounded-2xl p-6 text-center hover:border-accent/40 transition-colors duration-300"
                >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/15 border border-accent/30 mb-4">
                    <item.icon className="w-5 h-5 text-accent" />
                </div>

                <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-1">
                    {item.label}
                </p>

                <p className="text-foreground font-semibold">
                    {item.value}
                </p>
                </div>
            ))}
            </motion.div>

            <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
            <a
                href="mailto:contacto@tallergigante.com"
                className="group relative overflow-hidden bg-accent hover:bg-accent/90 text-cream px-10 py-5 text-lg font-semibold rounded-xl transition-all duration-300 shadow-[0_8px_35px_rgba(168,70,15,0.25)] flex items-center gap-2"
            >
                Escríbenos
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>

            <a href="/register" className="border border-primary/40 hover:border-primary text-foreground px-10 py-5 text-lg font-semibold rounded-xl transition-all duration-300 hover:bg-primary/10">
                Crear Cuenta
            </a>
            </motion.div>
        </div>
        </section>
    )
}
