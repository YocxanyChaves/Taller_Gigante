import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, AlertCircle, KeyRound } from "lucide-react"
import { supabase } from "../lib/supabaseClient"

export default function ResetPassword() {
    const [checking, setChecking] = useState(true)
    const [sessionValida, setSessionValida] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSessionValida(!!data.session)
            setChecking(false)
        })

        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "PASSWORD_RECOVERY" || session) {
                setSessionValida(true)
            }
        })

        return () => listener.subscription.unsubscribe()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.")
            return
        }

        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.")
            return
        }

        setIsLoading(true)

        const { error: updateError } = await supabase.auth.updateUser({ password })

        setIsLoading(false)

        if (updateError) {
            setError(updateError.message)
            return
        }

        setIsSuccess(true)
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
            <span className="font-mono text-sm">Volver al login</span>
            </a>

            <div className="backdrop-blur-md bg-card/80 border border-foreground/10 rounded-2xl p-8 shadow-2xl">
            {checking ? (
                <p className="text-center text-muted-foreground text-sm">Verificando enlace...</p>
            ) : isSuccess ? (
                <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 mb-6">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                </div>

                <h2 className="text-2xl font-bold text-foreground mb-3">
                    Contraseña actualizada
                </h2>

                <p className="text-muted-foreground mb-6">
                    Ya puedes iniciar sesión con tu nueva contraseña.
                </p>

                <a
                    href="/login"
                    className="block w-full py-4 bg-gradient-to-r from-accent to-primary hover:opacity-90 text-cream font-semibold rounded-lg transition-all"
                >
                    Ir a Iniciar Sesión
                </a>
                </div>
            ) : !sessionValida ? (
                <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/15 border border-accent/30 mb-4">
                    <AlertCircle className="w-8 h-8 text-accent" />
                </div>

                <h2 className="text-xl font-bold text-foreground mb-3">
                    Enlace inválido o expirado
                </h2>

                <p className="text-muted-foreground mb-6 text-sm">
                    Solicita un nuevo enlace de recuperación desde la pantalla de "¿Olvidaste tu contraseña?".
                </p>

                <a
                    href="/forgot-password"
                    className="block w-full py-4 bg-gradient-to-r from-accent to-primary hover:opacity-90 text-cream font-semibold rounded-lg transition-all"
                >
                    Solicitar nuevo enlace
                </a>
                </div>
            ) : (
                <>
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/15 border border-primary/30 mb-4">
                    <KeyRound className="w-8 h-8 text-primary" />
                    </div>

                    <h1 className="text-2xl font-bold text-foreground mb-2">
                    Define tu nueva contraseña
                    </h1>

                    <p className="text-muted-foreground text-sm">
                    Escribe una nueva contraseña para tu cuenta.
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
                        <Lock className="w-4 h-4 text-primary" />
                        Nueva contraseña
                    </label>

                    <div className="relative">
                        <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-4 pr-12 py-4 bg-foreground/5 border border-foreground/15 text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:border-primary"
                        />

                        <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                        >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    </div>

                    <div className="space-y-2">
                    <label className="text-foreground font-medium flex items-center gap-2">
                        <Lock className="w-4 h-4 text-primary" />
                        Confirmar contraseña
                    </label>

                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Repite tu contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full pl-4 pr-4 py-4 bg-foreground/5 border border-foreground/15 text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:border-primary"
                    />
                    </div>

                    <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-accent to-primary hover:opacity-90 text-cream font-semibold rounded-lg transition-all duration-300 disabled:opacity-70"
                    >
                    {isLoading ? "Guardando..." : "Guardar nueva contraseña"}
                    </button>
                </form>
                </>
            )}
            </div>
        </motion.div>
        </div>
    )
}
