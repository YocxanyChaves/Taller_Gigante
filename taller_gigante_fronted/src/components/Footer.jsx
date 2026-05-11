import { motion } from "framer-motion"
import { Cog, Mail } from "lucide-react"

const footerLinks = {
    product: [
        { label: "Características", href: "#" },
        { label: "Precios", href: "#" },
        { label: "Integraciones", href: "#" },
        { label: "API", href: "#" },
    ],

    company: [
        { label: "Sobre Nosotros", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Carreras", href: "#" },
        { label: "Contacto", href: "#" },
    ],

    resources: [
        { label: "Documentación", href: "#" },
        { label: "Guías", href: "#" },
        { label: "Soporte", href: "#" },
        { label: "Status", href: "#" },
    ],

    legal: [
        { label: "Privacidad", href: "#" },
        { label: "Términos", href: "#" },
        { label: "Cookies", href: "#" },
    ],
    }

    const socialLinks = [
        { icon: Mail, href: "#", label: "Email" },
    ]

    export function Footer() {
    return (
        <footer className="relative pt-20 pb-10 overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-black" />

        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
            <div className="col-span-2">
                <motion.a
                href="#"
                className="inline-flex items-center gap-3 mb-6"
                whileHover={{ scale: 1.02 }}
                >
                <motion.div
                    className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                    }}
                >
                    <Cog className="w-6 h-6 text-blue-500" />
                </motion.div>

                <div>
                    <span className="text-xl font-bold text-white block">
                    Taller Mecánico Gigante
                    </span>

                    <span className="text-xs font-mono text-gray-400 tracking-widest uppercase">
                    Workshop Management
                    </span>
                </div>
                </motion.a>

                <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-6">
                Plataforma moderna para la gestión de talleres mecánicos con enfoque profesional.
                </p>

                <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                    <motion.a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.label}
                    >
                    <social.icon className="w-4 h-4" />
                    </motion.a>
                ))}
                </div>
            </div>

            <FooterColumn title="Producto" links={footerLinks.product} />
            <FooterColumn title="Compañía" links={footerLinks.company} />
            <FooterColumn title="Recursos" links={footerLinks.resources} />
            <FooterColumn title="Legal" links={footerLinks.legal} />
            </div>

            <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} Taller Mecánico Gigante.
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
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
        <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
            {title}
        </h4>

        <ul className="space-y-3">
            {links.map((link) => (
            <li key={link.label}>
                <a
                href={link.href}
                className="text-sm text-gray-400 hover:text-blue-500 transition-colors duration-300"
                >
                {link.label}
                </a>
            </li>
            ))}
        </ul>
        </div>
    )
}