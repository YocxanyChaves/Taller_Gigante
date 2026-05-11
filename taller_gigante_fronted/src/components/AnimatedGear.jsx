import { motion } from "framer-motion"

export function AnimatedGear({
    size = 100,
    className = "",
    reverse = false,
    delay = 0,
    variant = "metallic",
    }) {
    const teeth = 12
    const toothWidth = size * 0.08
    const toothHeight = size * 0.12
    const innerRadius = size * 0.3
    const outerRadius = size * 0.45

    const colors = {
        blue: {
        gradient1: "rgb(59, 130, 246)",
        gradient2: "rgb(37, 99, 235)",
        gradient3: "rgb(30, 64, 175)",
        stroke: "rgba(59, 130, 246, 0.6)",
        tooth: "rgb(37, 99, 235)",
        inner: "rgb(30, 64, 175)",
        center: "rgb(15, 23, 42)",
        line: "rgba(147, 197, 253, 0.6)",
        },
        red: {
        gradient1: "rgb(239, 68, 68)",
        gradient2: "rgb(220, 38, 38)",
        gradient3: "rgb(127, 29, 29)",
        stroke: "rgba(239, 68, 68, 0.6)",
        tooth: "rgb(220, 38, 38)",
        inner: "rgb(153, 27, 27)",
        center: "rgb(69, 10, 10)",
        line: "rgba(252, 165, 165, 0.6)",
        },
        metallic: {
        gradient1: "rgb(161, 161, 170)",
        gradient2: "rgb(113, 113, 122)",
        gradient3: "rgb(63, 63, 70)",
        stroke: "rgba(148, 163, 184, 0.5)",
        tooth: "rgb(113, 113, 122)",
        inner: "rgb(82, 82, 91)",
        center: "rgb(39, 39, 42)",
        line: "rgba(203, 213, 225, 0.45)",
        },
        rust: {
        gradient1: "rgb(146, 64, 14)",
        gradient2: "rgb(120, 53, 15)",
        gradient3: "rgb(67, 20, 7)",
        stroke: "rgba(146, 64, 14, 0.6)",
        tooth: "rgb(120, 53, 15)",
        inner: "rgb(92, 38, 12)",
        center: "rgb(43, 18, 7)",
        line: "rgba(251, 191, 36, 0.35)",
        },
        bronze: {
        gradient1: "rgb(180, 83, 9)",
        gradient2: "rgb(146, 64, 14)",
        gradient3: "rgb(92, 38, 12)",
        stroke: "rgba(180, 83, 9, 0.6)",
        tooth: "rgb(146, 64, 14)",
        inner: "rgb(120, 53, 15)",
        center: "rgb(69, 26, 3)",
        line: "rgba(253, 186, 116, 0.45)",
        },
        gray: {
        gradient1: "rgb(156, 163, 175)",
        gradient2: "rgb(107, 114, 128)",
        gradient3: "rgb(75, 85, 99)",
        stroke: "rgba(156, 163, 175, 0.5)",
        tooth: "rgb(107, 114, 128)",
        inner: "rgb(75, 85, 99)",
        center: "rgb(31, 41, 55)",
        line: "rgba(209, 213, 219, 0.45)",
        },
    }

    const c = colors[variant] || colors.metallic
    const uniqueId = `${size}-${reverse}-${variant}`

    return (
        <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={className}
        animate={{ rotate: reverse ? -360 : 360 }}
        transition={{
            duration: reverse ? 25 : 20,
            repeat: Infinity,
            ease: "linear",
            delay,
        }}
        >
        <defs>
            <linearGradient id={`gear-gradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c.gradient1} />
            <stop offset="50%" stopColor={c.gradient2} />
            <stop offset="100%" stopColor={c.gradient3} />
            </linearGradient>

            <filter id={`gear-shadow-${uniqueId}`}>
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={c.stroke} floodOpacity="0.3" />
            </filter>
        </defs>

        <circle
            cx={size / 2}
            cy={size / 2}
            r={outerRadius}
            fill={`url(#gear-gradient-${uniqueId})`}
            stroke={c.stroke}
            strokeWidth="1.5"
            filter={`url(#gear-shadow-${uniqueId})`}
        />

        {Array.from({ length: teeth }).map((_, i) => {
            const angle = (i * 360) / teeth
            const rad = (angle * Math.PI) / 180
            const x = size / 2 + Math.cos(rad) * outerRadius
            const y = size / 2 + Math.sin(rad) * outerRadius

            return (
            <rect
                key={i}
                x={x - toothWidth / 2}
                y={y - toothHeight / 2}
                width={toothWidth}
                height={toothHeight}
                fill={c.tooth}
                stroke={c.stroke}
                strokeWidth="0.5"
                transform={`rotate(${angle}, ${x}, ${y})`}
                rx="1"
            />
            )
        })}

        <circle
            cx={size / 2}
            cy={size / 2}
            r={innerRadius}
            fill={c.inner}
            stroke={c.stroke}
            strokeWidth="1.5"
        />

        <circle
            cx={size / 2}
            cy={size / 2}
            r={size * 0.08}
            fill={c.center}
            stroke={c.stroke}
            strokeWidth="1"
        />

        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
            const rad = (angle * Math.PI) / 180
            const x1 = size / 2 + Math.cos(rad) * (innerRadius * 0.4)
            const y1 = size / 2 + Math.sin(rad) * (innerRadius * 0.4)
            const x2 = size / 2 + Math.cos(rad) * (innerRadius * 0.85)
            const y2 = size / 2 + Math.sin(rad) * (innerRadius * 0.85)

            return (
            <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={c.line}
                strokeWidth="2.5"
                strokeLinecap="round"
            />
            )
        })}
        </motion.svg>
    )
}