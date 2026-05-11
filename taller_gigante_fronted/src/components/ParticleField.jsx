import { motion } from "framer-motion"
import { useMemo } from "react"

export function ParticleField() {
    const particles = useMemo(() => {
        return Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 10 + 15,
        delay: Math.random() * 5,
        moveX: Math.random() * 15 - 7.5,
        }))
    }, [])

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
            <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: particle.size,
                height: particle.size,
                background: "rgba(59, 130, 246, 0.35)",
                boxShadow: `0 0 ${particle.size * 3}px rgba(59, 130, 246, 0.45)`,
            }}
            animate={{
                y: [0, -20, 0],
                x: [0, particle.moveX, 0],
                opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: "easeInOut",
            }}
            />
        ))}
        </div>
    )
}