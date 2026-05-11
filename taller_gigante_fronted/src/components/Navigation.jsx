import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { useState } from "react"
import { Menu, X, Cog } from "lucide-react"

const navLinks = [
    { label: "Características", href: "#features" },
    { label: "Sistema", href: "#system" },
    { label: "Precios", href: "#pricing" },
    { label: "Contacto", href: "#contact" },
    ]

    export function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { scrollY } = useScroll()

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50)
    })

    return (
        <>
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            isScrolled ? "glass py-3 shadow-sm" : "bg-transparent py-5"
            }`}
        >
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
                <motion.a
                href="#"
                className="flex items-center gap-3 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                >
                <motion.div
                    className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                    <Cog className="w-5 h-5 text-red-500" />
                </motion.div>

                <div className="flex flex-col">
                    <span className="text-lg font-bold text-white leading-tight">TMG</span>
                    <span className="text-[10px] font-mono text-gray-400 tracking-widest uppercase">
                    Workshop
                    </span>
                </div>
                </motion.a>

                <div className="hidden md:flex items-center gap-8">
                {navLinks.map((link, index) => (
                    <motion.a
                    key={link.href}
                    href={link.href}
                    className="relative text-sm font-medium text-gray-400 hover:text-white transition-colors duration-300 group"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-red-500 group-hover:w-full transition-all duration-300" />
                    </motion.a>
                ))}
                </div>

                <div className="hidden md:flex items-center gap-4">
                <button className="text-gray-400 hover:text-white px-4 py-2 rounded-lg transition">
                    Iniciar Sesión
                </button>
                <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition">
                    Comenzar
                </button>
                </div>

                <button
                className="md:hidden text-white p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>
            </nav>
        </motion.header>

        <motion.div
            initial={false}
            animate={{
            height: isMobileMenuOpen ? "auto" : 0,
            opacity: isMobileMenuOpen ? 1 : 0,
            }}
            className="fixed top-16 left-0 right-0 z-40 glass overflow-hidden md:hidden"
        >
            <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
                <a
                key={link.href}
                href={link.href}
                className="block text-lg font-medium text-gray-400 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
                >
                {link.label}
                </a>
            ))}

            <div className="pt-4 space-y-3">
                <button className="w-full border border-gray-600 text-white px-4 py-2 rounded-lg">
                Iniciar Sesión
                </button>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                Comenzar
                </button>
            </div>
            </div>
        </motion.div>
        </>
    )
}