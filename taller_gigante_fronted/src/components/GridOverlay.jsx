import { motion } from "framer-motion"
import { useTheme } from "../context/ThemeContext"

export function GridOverlay() {
    const { theme } = useTheme()
    const isDark = theme === "dark"

    const lineColor = isDark ? "59, 130, 246" : "58, 43, 29"
    const cornerColor = isDark ? "rgba(59, 130, 246, 0.3)" : "rgba(168, 70, 15, 0.3)"
    const barTop = isDark ? "59, 130, 246" : "61, 90, 82"
    const barBottom = isDark ? "239, 68, 68" : "168, 70, 15"

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
            className="absolute inset-0 animate-grid-flow"
            style={{
            backgroundImage: `
                linear-gradient(rgba(${lineColor}, 0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(${lineColor}, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            }}
        />

        <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 rounded-tl-sm" style={{ borderColor: cornerColor }} />
        <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 rounded-tr-sm" style={{ borderColor: cornerColor }} />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 rounded-bl-sm" style={{ borderColor: cornerColor }} />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 rounded-br-sm" style={{ borderColor: cornerColor }} />

        <motion.div
            className="absolute top-1/4 left-0 w-full h-[1px]"
            style={{
            background: `linear-gradient(90deg, transparent, rgba(${barTop}, 0.3), transparent)`,
            }}
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            }}
        />

        <motion.div
            className="absolute top-3/4 left-0 w-full h-[1px]"
            style={{
            background: `linear-gradient(90deg, transparent, rgba(${barBottom}, 0.25), transparent)`,
            }}
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
            }}
        />
        </div>
    )
}
