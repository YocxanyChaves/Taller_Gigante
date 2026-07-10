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
                ? "linear-gradient(to right, rgba(168, 70, 15, 0.35), rgba(61, 90, 82, 0.18))"
                : "linear-gradient(to right, rgba(61, 90, 82, 0.35), rgba(168, 70, 15, 0.18))",
            }}
        />

        <div className="relative rounded-xl p-6 h-full transition-all duration-500 bg-card/90 border border-foreground/10 backdrop-blur-md">
            <div
            className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
                borderColor: isAccent
                ? "rgba(168, 70, 15, 0.6)"
                : "rgba(61, 90, 82, 0.6)",
            }}
            />

            <div
            className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
                borderColor: isAccent
                ? "rgba(168, 70, 15, 0.6)"
                : "rgba(61, 90, 82, 0.6)",
            }}
            />

            <motion.div
            className="relative w-14 h-14 rounded-lg flex items-center justify-center mb-5 transition-colors duration-300"
            style={{
                backgroundColor: isAccent
                ? "rgba(168, 70, 15, 0.15)"
                : "rgba(61, 90, 82, 0.15)",
            }}
            whileHover={{ rotate: 5 }}
            >
            <Icon
                className="w-7 h-7"
                style={{
                color: isAccent ? "rgb(168, 70, 15)" : "rgb(61, 90, 82)",
                }}
            />

            <div
                className="absolute inset-0 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                backgroundColor: isAccent
                    ? "rgba(168, 70, 15, 0.22)"
                    : "rgba(61, 90, 82, 0.22)",
                }}
            />
            </motion.div>

            <h3 className="text-xl font-bold text-foreground mb-3 transition-colors duration-300">
            <span className={isAccent ? "group-hover:text-accent" : "group-hover:text-primary"}>
                {title}
            </span>
            </h3>

            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>

            <motion.div
            className="absolute bottom-0 left-6 right-6 h-[2px]"
            style={{
                background: isAccent
                ? "linear-gradient(to right, transparent, rgba(168, 70, 15, 0.6), transparent)"
                : "linear-gradient(to right, transparent, rgba(61, 90, 82, 0.6), transparent)",
            }}
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
            />
        </div>
        </motion.div>
    )
}
