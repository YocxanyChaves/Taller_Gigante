import { motion } from "framer-motion"
import { useState } from "react"

import { supabase } from "../lib/supabaseClient"
import { Logo } from "../components/Logo"
import { RegistroExitoso } from "../components/registro/RegistroExitoso"
import { CampoContrasena } from "../components/registro/CampoContrasena"

import {
    UserPlus,
    ArrowLeft,
    Mail,
    User,
    Phone,
    Building2,
    AlertCircle,
    } from "lucide-react"

    export default function Register() {
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

    if (isSuccess) return <RegistroExitoso email={email} />

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

                <CampoContrasena
                    etiqueta="Contraseña"
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={setPassword}
                    mostrarFortaleza
                />

                <CampoContrasena
                    etiqueta="Confirmar Contraseña"
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                />

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
