import { motion } from "framer-motion"
import { useState } from "react"

import { supabase } from "../lib/supabaseClient"
import { Logo } from "../components/Logo"

import {
    Eye,
    EyeOff,
    UserPlus,
    ArrowLeft,
    Mail,
    Lock,
    User,
    Phone,
    Building2,
    CheckCircle2,
    Sparkles,
    AlertCircle,
    } from "lucide-react"

    export default function Register() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState("")

    const [nombre, setNombre] = useState("")
    const [apellido, setApellido] = useState("")
    const [email, setEmail] = useState("")
    const [telefono, setTelefono] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden.")
        return
        }

        setIsLoading(true)

        const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
            nombre: `${nombre} ${apellido}`.trim(),
            telefono,
            },
        },
        })

        setIsLoading(false)

        if (authError) {
        setError(
            authError.message === "User already registered"
            ? "Ya existe una cuenta con ese correo."
            : authError.message
        )
        return
        }

        setIsSuccess(true)
    }

    const handleOAuthRegister = async (provider) => {
        setError("")

        const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/dashboard` },
        })

        if (oauthError) setError(oauthError.message)
    }

    const getPasswordStrength = (pass) => {
        let strength = 0
        if (pass.length >= 8) strength++
        if (/[A-Z]/.test(pass)) strength++
        if (/[0-9]/.test(pass)) strength++
        if (/[^A-Za-z0-9]/.test(pass)) strength++
        return strength
    }

    const passwordStrength = getPasswordStrength(password)
    const strengthLabels = ["Muy débil", "Débil", "Media", "Fuerte", "Muy fuerte"]

    if (isSuccess) {
        return (
        <div className="min-h-screen bg-background paper-texture flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-background via-cream to-muted" />

            <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 backdrop-blur-md bg-card/80 border border-foreground/10 rounded-2xl p-10 text-center max-w-md w-full shadow-2xl"
            >
            <div className="flex justify-center gap-2 mb-4 text-primary">
                <Sparkles className="w-5 h-5" />
                <CheckCircle2 className="w-14 h-14 text-green-500" />
                <Sparkles className="w-5 h-5" />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-3">
                Registro Exitoso
            </h2>

            <p className="text-muted-foreground mb-6">
                Tu cuenta ha sido creada correctamente.
            </p>

            <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/10 px-4 py-4 mb-8 text-left">
                <Mail className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">
                    Te enviamos un correo de verificación a{" "}
                    <span className="font-semibold">{email}</span>. Revisa tu
                    bandeja de entrada (y la carpeta de spam) y haz clic en el
                    enlace para confirmar tu cuenta antes de iniciar sesión.
                </p>
            </div>

            <a
                href="/login"
                className="block w-full py-4 bg-gradient-to-r from-accent to-primary hover:opacity-90 text-cream font-semibold rounded-lg transition-all"
            >
                Ir a Iniciar Sesión
            </a>
            </motion.div>
        </div>
        )
    }

    return (
        <div className="min-h-screen bg-background paper-texture relative overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-br from-background via-cream to-muted" />

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
            <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg"
            >
            <a
                href="/"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-6 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-mono text-sm">Volver al inicio</span>
            </a>

            <div className="backdrop-blur-md bg-card/80 border border-foreground/10 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center mb-4">
                    <Logo className="h-[100px] w-auto" />
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-2">
                    Crea tu cuenta
                </h1>

                <p className="text-muted-foreground text-sm">
                    Únete a{" "}
                    <span className="text-accent font-semibold">
                    Taller Mecánico
                    </span>{" "}
                    <span className="text-primary font-semibold">
                    Gigante
                    </span>
                </p>
                </div>

                {error && (
                <div className="mb-5 flex items-center gap-3 rounded-lg border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <label className="text-foreground font-medium flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-accent" />
                        Nombre
                    </label>
                    <input
                        type="text"
                        placeholder="Juan"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                        className="w-full px-4 py-4 bg-foreground/5 border border-foreground/15 text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:border-accent"
                    />
                    </div>

                    <div className="space-y-2">
                    <label className="text-foreground font-medium text-sm">
                        Apellido
                    </label>
                    <input
                        type="text"
                        placeholder="Pérez"
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        required
                        className="w-full px-4 py-4 bg-foreground/5 border border-foreground/15 text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:border-accent"
                    />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-foreground font-medium flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-accent" />
                    Correo Electrónico
                    </label>
                    <input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-4 bg-foreground/5 border border-foreground/15 text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:border-accent"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-foreground font-medium flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-primary" />
                    Teléfono
                    </label>
                    <input
                    type="tel"
                    placeholder="+506 8888-8888"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full px-4 py-4 bg-foreground/5 border border-foreground/15 text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:border-primary"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-foreground font-medium flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    Empresa{" "}
                    <span className="text-muted-foreground font-normal">
                        (opcional)
                    </span>
                    </label>
                    <input
                    type="text"
                    placeholder="Tu empresa o taller"
                    className="w-full px-4 py-4 bg-foreground/5 border border-foreground/15 text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:border-muted-foreground"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-foreground font-medium flex items-center gap-2 text-sm">
                    <Lock className="w-4 h-4 text-primary" />
                    Contraseña
                    </label>

                    <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 8 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-4 pr-12 bg-foreground/5 border border-foreground/15 text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:border-primary"
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    </div>

                    {password.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex gap-1">
                        {[...Array(4)].map((_, i) => (
                            <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full ${
                                i < passwordStrength
                                ? passwordStrength >= 3
                                    ? "bg-green-500"
                                    : passwordStrength >= 2
                                    ? "bg-yellow-500"
                                    : "bg-accent"
                                : "bg-foreground/10"
                            }`}
                            />
                        ))}
                        </div>

                        <p className="text-xs text-muted-foreground">
                        Fortaleza:{" "}
                        <span className="font-medium text-primary">
                            {strengthLabels[passwordStrength]}
                        </span>
                        </p>
                    </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-foreground font-medium flex items-center gap-2 text-sm">
                    <Lock className="w-4 h-4 text-primary" />
                    Confirmar Contraseña
                    </label>

                    <div className="relative">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repite tu contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-4 py-4 pr-12 bg-foreground/5 border border-foreground/15 text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:border-primary"
                    />

                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                    >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    </div>
                </div>

                <label className="flex items-start gap-3 text-sm text-muted-foreground pt-2">
                    <input type="checkbox" required className="mt-1" />
                    <span>
                    Acepto los{" "}
                    <a href="#" className="text-accent hover:underline">
                        Términos y Condiciones
                    </a>{" "}
                    y la{" "}
                    <a href="#" className="text-accent hover:underline">
                        Política de Privacidad
                    </a>
                    </span>
                </label>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-accent to-primary hover:opacity-90 text-cream font-semibold text-lg rounded-lg transition-all duration-300 disabled:opacity-70"
                >
                    {isLoading ? (
                    "Creando cuenta..."
                    ) : (
                    <span className="flex items-center justify-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        Crear Cuenta
                    </span>
                    )}
                </button>
                </form>

                <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-foreground/10" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-card px-4 text-sm text-muted-foreground">
                    o registrate con
                    </span>
                </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => handleOAuthRegister("google")}
                    className="py-4 border border-foreground/15 hover:border-accent text-foreground rounded-lg transition-all"
                >
                    Google
                </button>

                <button
                    type="button"
                    onClick={() => handleOAuthRegister("facebook")}
                    className="py-4 border border-foreground/15 hover:border-primary text-foreground rounded-lg transition-all"
                >
                    Facebook
                </button>
                </div>

                <p className="text-center mt-6 text-muted-foreground text-sm">
                ¿Ya tienes una cuenta?{" "}
                <a
                    href="/login"
                    className="text-accent hover:underline font-semibold"
                >
                    Inicia sesión aquí
                </a>
                </p>
            </div>

            <p className="text-center mt-6 text-muted-foreground text-xs font-mono">
                Taller Mecánico Gigante - Sistema de Gestión Profesional
            </p>
            </motion.div>
        </div>
        </div>
    )
    }
