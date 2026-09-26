import { motion } from "framer-motion";
import { Mail, CheckCircle2, Sparkles } from "lucide-react";

// Pantalla que se muestra después de crear la cuenta.
export function RegistroExitoso({ email }) {
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

        <h2 className="text-2xl font-bold text-foreground mb-3">Registro Exitoso</h2>

        <p className="text-muted-foreground mb-6">Tu cuenta ha sido creada correctamente.</p>

        <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/10 px-4 py-4 mb-8 text-left">
          <Mail className="w-6 h-6 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            Te enviamos un correo de verificación a{" "}
            <span className="font-semibold">{email}</span>. Revisa tu bandeja de
            entrada (y la carpeta de spam) y haz clic en el enlace para confirmar
            tu cuenta antes de iniciar sesión.
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
  );
}
