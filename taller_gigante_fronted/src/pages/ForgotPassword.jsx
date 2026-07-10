import { motion } from "framer-motion"
import { useState } from "react"

import { ArrowLeft, Mail, KeyRound, CheckCircle, AlertCircle } from "lucide-react"
import { supabase } from "../lib/supabaseClient"

export default function ForgotPassword() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [email, setEmail] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
            email,
            { redirectTo: `${window.location.origin}/reset-password` }
        )

        setIsLoading(false)

        if (resetError) {
            setError(resetError.message)
            return
        }

        setIsSubmitted(true)
    }

    return (
        <div className="min-h-screen bg-background paper-texture flex items-center justify-center px-4 relative overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-br from-background via-cream to-muted" />

        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-md"
        >
            <a
            href="/login"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-8 group"
            >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />

            <span className="font-mono text-sm">
                Volver al login
            </span>
            </a>

            <div className="backdrop-blur-md bg-card/80 border border-foreground/10 rounded-2xl p-8 shadow-2xl">
            {!isSubmitted ? (
                <>
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/15 border border-primary/30 mb-4">
                    <KeyRound className="w-8 h-8 text-primary" />
                    </div>

                    <h1 className="text-2xl font-bold text-foreground mb-2">
                    Recuperar Contraseña
                    </h1>

                    <p className="text-muted-foreground text-sm">
                    Ingresa tu correo electrónico para enviarte las instrucciones de recuperación.
                    </p>
                </div>

                {error && (
                    <div className="mb-5 flex items-center gap-3 rounded-lg border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                    <label className="text-foreground font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4 text-primary" />
                        Correo Electrónico
                    </label>

                    <input
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-4 pr-4 py-4 bg-foreground/5 border border-foreground/15 text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:border-primary"
                    />
                    </div>

                    <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-accent to-primary hover:opacity-90 text-cream font-semibold rounded-lg transition-all duration-300 disabled:opacity-70"
                    >
                    {isLoading ? (
                        "Enviando..."
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                        <Mail className="w-5 h-5" />
                        Enviar Instrucciones
                        </span>
                    )}
                    </button>
                </form>

                <p className="text-center mt-6 text-muted-foreground text-sm">
                    ¿Recuerdas tu contraseña?{" "}
                    <a
                    href="/login"
                    className="text-accent hover:underline"
                    >
                    Inicia sesión aquí
                    </a>
                </p>
                </>
            ) : (
                <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 mb-6">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                </div>

                <h2 className="text-2xl font-bold text-foreground mb-3">
                    Correo Enviado
                </h2>

                <p className="text-muted-foreground mb-2">
                    Si existe una cuenta con ese correo, hemos enviado instrucciones a:
                </p>

                <p className="text-accent font-semibold mb-6">
                    {email}
                </p>

                <a
                    href="/login"
                    className="block w-full py-4 bg-gradient-to-r from-accent to-primary hover:opacity-90 text-cream font-semibold rounded-lg transition-all"
                >
                    Volver al Login
                </a>
                </div>
            )}
            </div>
        </motion.div>
        </div>
    )
}
