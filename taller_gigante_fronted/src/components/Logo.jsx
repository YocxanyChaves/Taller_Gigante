import { useTheme } from "../context/ThemeContext";
import logoClaro from "../assets/logo-claro.png";
import logoOscuro from "../assets/logo-oscuro.png";

export function Logo({ className = "h-8 w-auto" }) {
  const { theme } = useTheme();
  const src = theme === "dark" ? logoClaro : logoOscuro;

  return <img src={src} alt="Taller Gigante" className={className} />;
}
