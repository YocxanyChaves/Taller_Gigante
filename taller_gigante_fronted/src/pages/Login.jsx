import { motion } from "framer-motion";
import { useState } from "react";

import { BackgroundGears } from "../components/BackgroundGears";
import { AnimatedGear } from "../components/AnimatedGear";
import { Logo } from "../components/Logo";
import { supabase } from "../lib/supabaseClient";

import {
    Eye,
    EyeOff,
    LogIn,
    ArrowLeft,
    Lock,
    User,
    AlertCircle,
    } from "lucide-react";

    export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setIsLoading(true);

        const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
        });

        if (authError) {
        setError(
            authError.message === "Invalid login credentials"
            ? "Correo o contraseña incorrectos."
            : authError.message
        );
        setIsLoading(false);
        return;
        }

        window.location.href = "/dashboard";
    };

    const handleOAuthLogin = async (provider) => {
        setError("");

        const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/dashboard` },
        });

        if (oauthError) setError(oauthError.message);
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-background paper-texture">
        <div className="fixed inset-0 bg-gradient-to-br from-background via-cream to-muted" />

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
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors group"
                >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-mono text-sm">Volver al inicio</span>
                </a>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="backdrop-blur-md bg-card/80 border border-foreground/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute -top-6 -right-6 opacity-10">
                <AnimatedGear size={80} variant="bronze" />
                </div>

                <div className="text-center mb-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="inline-flex items-center justify-center mb-4"
                >
                    <Logo className="h-[100px] w-auto" />
                </motion.div>

                <h1 className="text-2xl font-bold text-foreground mb-2">
                    Bienvenido de vuelta
                </h1>

                <p className="text-muted-foreground text-sm">
                    Ingresa a tu cuenta de{" "}
                    <span className="text-accent font-semibold">
                    Taller Mecánico
                    </span>{" "}
                    <span className="text-primary font-semibold">Gigante</span>
                </p>
                </div>

                {error && (
                <div className="mb-5 flex items-center gap-3 rounded-lg border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-foreground font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-accent" />
                    Usuario o Correo
                    </label>

                    <input
                    type="text"
                    placeholder="admin@tallergigante.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-4 pr-4 py-4 bg-foreground/5 border border-foreground/15 text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:border-accent"
                    required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-foreground font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    Contraseña
                    </label>

                    <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-4 pr-12 py-4 bg-foreground/5 border border-foreground/15 text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:border-primary"
                        required
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
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
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input type="checkbox" />
                    Recordarme
                    </label>

                    <a
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                    >
                    ¿Olvidaste tu contraseña?
                    </a>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative overflow-hidden bg-gradient-to-r from-accent to-primary hover:opacity-90 text-cream w-full py-4 text-lg font-semibold rounded-lg transition-all duration-300 disabled:opacity-70"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                    <LogIn className="w-5 h-5" />
                    {isLoading ? "Validando..." : "Iniciar sesión"}
                    </span>
                </button>
                </form>

                <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-foreground/10" />
                </div>

                <div className="relative flex justify-center">
                    <span className="bg-card px-4 text-sm text-muted-foreground">
                    o continuar con
                    </span>
                </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => handleOAuthLogin("google")}
                    className="py-4 border border-foreground/15 hover:border-accent text-foreground rounded-lg transition-all flex items-center justify-center gap-2"
                >
                    Google
                </button>

                <button
                    type="button"
                    onClick={() => handleOAuthLogin("facebook")}
                    className="py-4 border border-foreground/15 hover:border-primary text-foreground rounded-lg transition-all flex items-center justify-center gap-2"
                >
                    Facebook
                </button>
                </div>

                <p className="text-center mt-8 text-muted-foreground text-sm">
                ¿No tienes una cuenta?{" "}
                <a
                    href="/register"
                    className="text-accent hover:underline font-semibold"
                >
                    Regístrate aquí
                </a>
                </p>
            </motion.div>

            <p className="text-center mt-8 text-muted-foreground text-xs font-mono">
                Taller Mecánico Gigante © 2026
            </p>
            </motion.div>
        </div>
        </div>
    );
    }
