import { motion } from "framer-motion"
import { Cog, Mail } from "lucide-react"

const footerLinks = {
    navegacion: [
        { label: "Características", href: "#features" },
        { label: "Sistema", href: "#system" },
        { label: "Contacto", href: "#contact" },
    ],

    cuenta: [
        { label: "Iniciar sesión", href: "/login" },
        { label: "Crear cuenta", href: "/register" },
    ],
    }

    const socialLinks = [
        { icon: Mail, href: "mailto:tallergigante@gmail.com", label: "Email" },
    ]

    export function Footer() {
    return (
        <footer className="relative pt-20 pb-10 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-gradient-to-t from-muted to-background" />

        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="col-span-2">
                <motion.a
                href="#"
                className="inline-flex items-center gap-3 mb-6"
                whileHover={{ scale: 1.02 }}
                >
                <motion.div
                    className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                    }}
                >
                    <Cog className="w-6 h-6 text-accent" />
                </motion.div>

                <div>
                    <span className="text-xl font-bold text-foreground block">
                    Taller Mecánico Gigante
                    </span>

                    <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
                    Workshop Management
                    </span>
                </div>
                </motion.a>

                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">
                Plataforma moderna para la gestión de talleres mecánicos con enfoque profesional.
                </p>

                <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                    <motion.a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.label}
                    >
                    <social.icon className="w-4 h-4" />
                    </motion.a>
                ))}
                </div>
            </div>

            <FooterColumn title="Navegación" links={footerLinks.navegacion} />
            <FooterColumn title="Cuenta" links={footerLinks.cuenta} />
            </div>

            <div className="pt-8 border-t border-foreground/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Taller Mecánico Gigante.
                </p>

                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>Sistema operativo</span>
                </div>
            </div>
            </div>
        </div>
        </footer>
    )
    }

    function FooterColumn({ title, links }) {
    return (
        <div>
        <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
            {title}
        </h4>

        <ul className="space-y-3">
            {links.map((link) => (
            <li key={link.label}>
                <a
                href={link.href}
                className="text-sm text-muted-foreground hover:text-accent transition-colors duration-300"
                >
                {link.label}
                </a>
            </li>
            ))}
        </ul>
        </div>
    )
}
