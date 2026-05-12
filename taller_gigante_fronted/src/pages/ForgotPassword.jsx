import { motion } from "framer-motion"
import { useState } from "react"

import { ArrowLeft, Mail, KeyRound, CheckCircle } from "lucide-react"

export default function ForgotPassword() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [email, setEmail] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()

        setIsLoading(true)

        await new Promise((resolve) => setTimeout(resolve, 1500))

        setIsLoading(false)
        setIsSubmitted(true)
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black" />

        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-md"
        >
            <a
            href="/login"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-red-500 transition-colors mb-8 group"
            >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />

            <span className="font-mono text-sm">
                Volver al login
            </span>
            </a>

            <div className="backdrop-blur-md bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
            {!isSubmitted ? (
                <>
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/30 mb-4">
                    <KeyRound className="w-8 h-8 text-blue-400" />
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2">
                    Recuperar Contraseña
                    </h1>

                    <p className="text-zinc-400 text-sm">
                    Ingresa tu correo electrónico para enviarte las instrucciones de recuperación.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                    <label className="text-white font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-400" />
                        Correo Electrónico
                    </label>

                    <input
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-4 pr-4 py-4 bg-zinc-950 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-400"
                    />
                    </div>

                    <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300"
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

                <p className="text-center mt-6 text-zinc-400 text-sm">
                    ¿Recuerdas tu contraseña?{" "}
                    <a
                    href="/login"
                    className="text-red-500 hover:underline"
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

                <h2 className="text-2xl font-bold text-white mb-3">
                    Correo Enviado
                </h2>

                <p className="text-zinc-400 mb-2">
                    Hemos enviado instrucciones a:
                </p>

                <p className="text-red-500 font-semibold mb-6">
                    {email}
                </p>

                <a
                    href="/login"
                    className="block w-full py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
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