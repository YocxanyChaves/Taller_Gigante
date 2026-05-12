import { motion } from "framer-motion"
import { useState } from "react"

import {
    Eye,
    EyeOff,
    UserPlus,
    ArrowLeft,
    Wrench,
    Mail,
    Lock,
    User,
    Phone,
    Building2,
    CheckCircle2,
    Sparkles,
    } from "lucide-react"

    export default function Register() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [password, setPassword] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        await new Promise((resolve) => setTimeout(resolve, 1500))

        setIsLoading(false)
        setIsSuccess(true)
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
        <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black" />

            <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 backdrop-blur-md bg-zinc-900/60 border border-zinc-800 rounded-2xl p-10 text-center max-w-md w-full shadow-2xl"
            >
            <div className="flex justify-center gap-2 mb-4 text-blue-400">
                <Sparkles className="w-5 h-5" />
                <CheckCircle2 className="w-14 h-14 text-green-500" />
                <Sparkles className="w-5 h-5" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
                Registro Exitoso
            </h2>

            <p className="text-zinc-400 mb-8">
                Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión en el sistema.
            </p>

            <a
                href="/login"
                className="block w-full py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
            >
                Ir a Iniciar Sesión
            </a>
            </motion.div>
        </div>
        )
    }

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-br from-black via-zinc-900 to-black" />

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
            <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg"
            >
            <a
                href="/"
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-red-500 transition-colors mb-6 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-mono text-sm">Volver al inicio</span>
            </a>

            <div className="backdrop-blur-md bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 mb-4">
                    <Wrench className="w-8 h-8 text-red-500" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">
                    Crea tu cuenta
                </h1>

                <p className="text-zinc-400 text-sm">
                    Únete a{" "}
                    <span className="text-red-500 font-semibold">
                    Taller Mecánico
                    </span>{" "}
                    <span className="text-blue-400 font-semibold">
                    Gigante
                    </span>
                </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <label className="text-white font-medium flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-red-500" />
                        Nombre
                    </label>
                    <input
                        type="text"
                        placeholder="Juan"
                        required
                        className="w-full px-4 py-4 bg-zinc-950 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-red-500"
                    />
                    </div>

                    <div className="space-y-2">
                    <label className="text-white font-medium text-sm">
                        Apellido
                    </label>
                    <input
                        type="text"
                        placeholder="Pérez"
                        required
                        className="w-full px-4 py-4 bg-zinc-950 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-red-500"
                    />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-white font-medium flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-red-500" />
                    Correo Electrónico
                    </label>
                    <input
                    type="email"
                    placeholder="tu@email.com"
                    required
                    className="w-full px-4 py-4 bg-zinc-950 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-red-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-white font-medium flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-blue-400" />
                    Teléfono
                    </label>
                    <input
                    type="tel"
                    placeholder="+506 8888-8888"
                    className="w-full px-4 py-4 bg-zinc-950 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-400"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-white font-medium flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-zinc-400" />
                    Empresa{" "}
                    <span className="text-zinc-500 font-normal">
                        (opcional)
                    </span>
                    </label>
                    <input
                    type="text"
                    placeholder="Tu empresa o taller"
                    className="w-full px-4 py-4 bg-zinc-950 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-zinc-400"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-white font-medium flex items-center gap-2 text-sm">
                    <Lock className="w-4 h-4 text-blue-400" />
                    Contraseña
                    </label>

                    <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 8 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-4 pr-12 bg-zinc-950 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-400"
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-blue-400"
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
                                    : "bg-red-500"
                                : "bg-zinc-700"
                            }`}
                            />
                        ))}
                        </div>

                        <p className="text-xs text-zinc-400">
                        Fortaleza:{" "}
                        <span className="font-medium text-blue-400">
                            {strengthLabels[passwordStrength]}
                        </span>
                        </p>
                    </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-white font-medium flex items-center gap-2 text-sm">
                    <Lock className="w-4 h-4 text-blue-400" />
                    Confirmar Contraseña
                    </label>

                    <div className="relative">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repite tu contraseña"
                        required
                        className="w-full px-4 py-4 pr-12 bg-zinc-950 border border-zinc-700 text-white rounded-lg focus:outline-none focus:border-blue-400"
                    />

                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-blue-400"
                    >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    </div>
                </div>

                <label className="flex items-start gap-3 text-sm text-zinc-400 pt-2">
                    <input type="checkbox" required className="mt-1" />
                    <span>
                    Acepto los{" "}
                    <a href="#" className="text-red-500 hover:underline">
                        Términos y Condiciones
                    </a>{" "}
                    y la{" "}
                    <a href="#" className="text-red-500 hover:underline">
                        Política de Privacidad
                    </a>
                    </span>
                </label>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-semibold text-lg rounded-lg transition-all duration-300 disabled:opacity-70"
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
                    <div className="w-full border-t border-zinc-700" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-zinc-900 px-4 text-sm text-zinc-400">
                    o registrate con
                    </span>
                </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    className="py-4 border border-zinc-700 hover:border-red-500 text-white rounded-lg transition-all"
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

                <p className="text-center mt-6 text-zinc-400 text-sm">
                ¿Ya tienes una cuenta?{" "}
                <a
                    href="/login"
                    className="text-red-500 hover:underline font-semibold"
                >
                    Inicia sesión aquí
                </a>
                </p>
            </div>

            <p className="text-center mt-6 text-zinc-500 text-xs font-mono">
                Taller Mecánico Gigante - Sistema de Gestión Profesional
            </p>
            </motion.div>
        </div>
        </div>
    )
}