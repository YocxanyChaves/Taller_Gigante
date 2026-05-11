import { motion } from "framer-motion"

export function GridOverlay() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
            className="absolute inset-0 animate-grid-flow"
            style={{
            backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            }}
        />

        <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-blue-500/25 rounded-tl-sm" />
        <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-blue-500/25 rounded-tr-sm" />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-blue-500/25 rounded-bl-sm" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-blue-500/25 rounded-br-sm" />

        <motion.div
            className="absolute top-1/4 left-0 w-full h-[1px]"
            style={{
            background:
                "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent)",
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
            background:
                "linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.18), transparent)",
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