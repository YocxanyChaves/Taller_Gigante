import { motion } from "framer-motion"

export function FeatureCard({ icon: Icon, title, description, index }) {
    const isAccent = index % 2 === 0

    return (
        <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        whileHover={{ y: -8, scale: 1.02 }}
        className="group relative"
        >
        <div
            className="absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"
            style={{
            background: isAccent
                ? "linear-gradient(to right, rgba(239, 68, 68, 0.4), rgba(59, 130, 246, 0.2))"
                : "linear-gradient(to right, rgba(59, 130, 246, 0.4), rgba(239, 68, 68, 0.2))",
            }}
        />

        <div className="relative rounded-xl p-6 h-full transition-all duration-500 bg-zinc-950/80 border border-white/10 backdrop-blur-md">
            <div
            className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
                borderColor: isAccent
                ? "rgba(239, 68, 68, 0.7)"
                : "rgba(59, 130, 246, 0.7)",
            }}
            />

            <div
            className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
                borderColor: isAccent
                ? "rgba(239, 68, 68, 0.7)"
                : "rgba(59, 130, 246, 0.7)",
            }}
            />

            <motion.div
            className="relative w-14 h-14 rounded-lg flex items-center justify-center mb-5 transition-colors duration-300"
            style={{
                backgroundColor: isAccent
                ? "rgba(239, 68, 68, 0.15)"
                : "rgba(59, 130, 246, 0.15)",
            }}
            whileHover={{ rotate: 5 }}
            >
            <Icon
                className="w-7 h-7"
                style={{
                color: isAccent ? "rgb(239, 68, 68)" : "rgb(59, 130, 246)",
                }}
            />

            <div
                className="absolute inset-0 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                backgroundColor: isAccent
                    ? "rgba(239, 68, 68, 0.25)"
                    : "rgba(59, 130, 246, 0.25)",
                }}
            />
            </motion.div>

            <h3 className="text-xl font-bold text-white mb-3 transition-colors duration-300">
            <span className={isAccent ? "group-hover:text-red-500" : "group-hover:text-blue-500"}>
                {title}
            </span>
            </h3>

            <p className="text-gray-400 text-sm leading-relaxed">{description}</p>

            <motion.div
            className="absolute bottom-0 left-6 right-6 h-[2px]"
            style={{
                background: isAccent
                ? "linear-gradient(to right, transparent, rgba(239, 68, 68, 0.7), transparent)"
                : "linear-gradient(to right, transparent, rgba(59, 130, 246, 0.7), transparent)",
            }}
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
            />
        </div>
        </motion.div>
    )
}