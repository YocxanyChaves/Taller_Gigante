import { motion } from "framer-motion";
import { useState } from "react";

import { BackgroundGears } from "../components/BackgroundGears";
import { AnimatedGear } from "../components/AnimatedGear";

import {
    Eye,
    EyeOff,
    LogIn,
    ArrowLeft,
    Wrench,
    Mail,
    Lock,
    User,
    AlertCircle,
    } from "lucide-react";

    const fakeUser = {
    email: "admin@tallergigante.com",
    password: "admin123",
    };

    export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState("admin@tallergigante.com");
    const [password, setPassword] = useState("admin123");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setIsLoading(true);

        await new Promise((resolve) => setTimeout(resolve, 1200));

        if (email === fakeUser.email && password === fakeUser.password) {
        localStorage.setItem("isLoggedIn", "true");
        window.location.href = "/dashboard";
        } else {
        setError("Correo o contraseña incorrectos.");
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-br from-black via-zinc-900 to-black" />

        <BackgroundGears />

        <div className="fixed top-20 left-10 opacity-20">
            <AnimatedGear size={120} variant="rust" />
        </div>

        <div className="fixed bottom-20 right-10 opacity-20">
            <AnimatedGear size={150} variant="bronze" reverse />
        </div>

        <div className="fixed top-1/3 right-20 opacity-15">
            <AnimatedGear size={80} variant="gray" delay={0.5} />
        </div>

        <div className="fixed bottom-1/3 left-20 opacity-15">
            <AnimatedGear size={100} variant="rust" reverse delay={0.3} />
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
            <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
            >
            <div className="mb-8">
                <a
                href="/"
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-red-500 transition-colors group"
                >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-mono text-sm">Volver al inicio</span>
                </a>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="backdrop-blur-md bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute -top-6 -right-6 opacity-10">
                <AnimatedGear size={80} variant="bronze" />
                </div>

                <div className="text-center mb-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 mb-4"
                >
                    <Wrench className="w-8 h-8 text-red-500" />
                </motion.div>

                <h1 className="text-2xl font-bold text-white mb-2">
                    Bienvenido de vuelta
                </h1>

                <p className="text-zinc-400 text-sm">
                    Ingresa a tu cuenta de{" "}
                    <span className="text-red-500 font-semibold">
                    Taller Mecánico
                    </span>{" "}
                    <span className="text-blue-400 font-semibold">Gigante</span>
                </p>
                </div>

                {error && (
                <div className="mb-5 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-white font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-red-500" />
                    Usuario o Correo
                    </label>

                    <input
                    type="text"
                    placeholder="admin@tallergigante.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-4 pr-4 py-4 bg-zinc-950 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-red-500"
                    required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-white font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-400" />
                    Contraseña
                    </label>

                    <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-4 pr-12 py-4 bg-zinc-950 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-400"
                        required
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-blue-400 transition-colors"
                    >
                        {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                        ) : (
                        <Eye className="w-5 h-5" />
                        )}
                    </button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-zinc-400">
                    <input type="checkbox" />
                    Recordarme
                    </label>

                    <a
                    href="/forgot-password"
                    className="text-sm text-blue-400 hover:underline"
                    >
                    ¿Olvidaste tu contraseña?
                    </a>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative overflow-hidden bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white w-full py-4 text-lg font-semibold rounded-lg transition-all duration-300 shadow-[0_0_30px_rgba(59,130,246,0.25)] disabled:opacity-70"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                    <LogIn className="w-5 h-5" />
                    {isLoading ? "Validando..." : "Iniciar sesión"}
                    </span>
                </button>

                <div className="rounded-xl border border-zinc-700 bg-black/20 p-4 text-sm text-zinc-400">
                    <p className="font-semibold text-white mb-2">
                    Acceso temporal:
                    </p>

                    <p>
                    Usuario:
                    <span className="text-blue-400 ml-2">
                        admin@tallergigante.com
                    </span>
                    </p>

                    <p>
                    Contraseña:
                    <span className="text-red-400 ml-2">admin123</span>
                    </p>
                </div>
                </form>

                <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-700" />
                </div>

                <div className="relative flex justify-center">
                    <span className="bg-zinc-900 px-4 text-sm text-zinc-400">
                    o continuar con
                    </span>
                </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    className="py-4 border border-zinc-700 hover:border-red-500 text-white rounded-lg transition-all flex items-center justify-center gap-2"
                >
                    Google
                </button>

                <button
                    type="button"
                    className="py-4 border border-zinc-700 hover:border-blue-400 text-white rounded-lg transition-all flex items-center justify-center gap-2"
                >
                    <Mail className="w-5 h-5" />
                    Email
                </button>
                </div>

                <p className="text-center mt-8 text-zinc-400 text-sm">
                ¿No tienes una cuenta?{" "}
                <a
                    href="/register"
                    className="text-red-500 hover:underline font-semibold"
                >
                    Regístrate aquí
                </a>
                </p>
            </motion.div>

            <p className="text-center mt-8 text-zinc-500 text-xs font-mono">
                Taller Mecánico Gigante © 2026
            </p>
            </motion.div>
        </div>
        </div>
    );
}