import { AnimatedGear } from "./AnimatedGear"

export function BackgroundGears() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-10 -left-16 opacity-50">
            <AnimatedGear size={200} variant="rust" />
        </div>

        <div className="absolute top-32 left-24 opacity-45">
            <AnimatedGear size={120} reverse delay={1} variant="gray" />
        </div>

        <div className="absolute -top-20 -right-24 opacity-50">
            <AnimatedGear size={280} reverse delay={0.5} variant="bronze" />
        </div>

        <div className="absolute top-52 right-12 opacity-43">
            <AnimatedGear size={110} delay={2} variant="rust" />
        </div>

        <div className="absolute top-[40%] -left-24 opacity-47">
            <AnimatedGear size={200} delay={1.5} variant="gray" />
        </div>

        <div className="absolute top-[35%] left-28 opacity-40">
            <AnimatedGear size={90} reverse delay={2.2} variant="bronze" />
        </div>

        <div className="absolute top-[50%] -right-20 opacity-47">
            <AnimatedGear size={240} reverse delay={0.8} variant="rust" />
        </div>

        <div className="absolute top-[55%] right-32 opacity-40">
            <AnimatedGear size={80} delay={1.8} variant="gray" />
        </div>

        <div className="absolute bottom-[30%] -left-12 opacity-43">
            <AnimatedGear size={150} reverse delay={2.5} variant="bronze" />
        </div>

        <div className="absolute -bottom-24 left-16 opacity-50">
            <AnimatedGear size={260} delay={1.2} variant="gray" />
        </div>

        <div className="absolute bottom-20 left-48 opacity-43">
            <AnimatedGear size={100} reverse delay={3.2} variant="rust" />
        </div>

        <div className="absolute bottom-[28%] right-8 opacity-40">
            <AnimatedGear size={110} delay={3} variant="rust" />
        </div>

        <div className="absolute -bottom-28 -right-24 opacity-50">
            <AnimatedGear size={300} reverse delay={0.3} variant="bronze" />
        </div>

        <div className="absolute bottom-32 right-40 opacity-40">
            <AnimatedGear size={130} delay={2.8} variant="gray" />
        </div>

        <div className="absolute top-[65%] left-[40%] opacity-30">
            <AnimatedGear size={400} delay={2} variant="gray" />
        </div>
        </div>
    )
}