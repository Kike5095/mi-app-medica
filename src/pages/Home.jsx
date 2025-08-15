import { Link } from "react-router-dom";
import {
  Home as HomeIcon,
  ClipboardList,
  Stethoscope,
  Pill,
  Shield,
  Users,
} from "lucide-react";

/**
 * Landing minimalista sin imágenes locales.
 * Usa tokens y utilidades ya cargadas (tokens.css, lovable.css, tailwind).
 */
export default function Home() {
  return (
    <div>
      {/* Header simple */}
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--panel))]">
        <div className="container-app flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--primary))] text-white">
              <HomeIcon size={20} />
            </div>
            <div className="font-semibold tracking-tight">
              Programa de hospitalización en Domicilio
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-[hsl(var(--muted))]">
            <a href="#features" className="hover:underline">Inicio</a>
            <a href="#equipo" className="hover:underline">Para el equipo</a>
          </nav>
          <Link to="/ingreso" className="btn">
            Ingresar
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[hsl(var(--bg))]">
        <div className="container-app py-12 md:py-16">
          <div className="max-w-3xl">
            <h1 className="section-title">Hospitalización en Casa</h1>
            <p className="mt-3 text-[hsl(var(--muted))] leading-relaxed">
              Portal del Programa de hospitalización en Domicilio para personal autorizado.
              Gestión segura y organizada del cuidado.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a href="#programa" className="btn bg-white text-[hsl(var(--primary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--primary)/0.06)]">
                Conocer el programa
              </a>
              <Link to="/ingreso" className="btn">
                Acceder al sistema
              </Link>
            </div>

            <div className="mt-6 text-sm text-[hsl(var(--muted))]">
              Responsable institucional: Evelyn Grau, Jefe de Enfermeras.
            </div>
          </div>
        </div>
      </section>

      {/* Features principales */}
      <section id="programa" className="bg-[hsl(var(--bg))]">
        <div className="container-app py-10">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<ClipboardList size={28} />}
              title="Coordinación clínica"
              description="Interdisciplinaria para garantizar la continuidad del cuidado."
            />
            <FeatureCard
              icon={<Pill size={28} />}
              title="Gestión de insumos"
              description="Control de insumos/medicación con seguimiento riguroso."
            />
            <FeatureCard
              icon={<Stethoscope size={28} />}
              title="Seguimiento continuo"
              description="Evolución y continuidad del cuidado personalizado."
            />
            <FeatureCard
              icon={<Shield size={28} />}
              title="Seguridad del paciente"
              description="Buenas prácticas y seguridad en cada intervención."
            />
          </div>
        </div>
      </section>

      {/* Para el equipo */}
      <section id="equipo" className="bg-[hsl(var(--bg))]">
        <div className="container-app py-12">
          <h2 className="section-title">Para el equipo</h2>
          <p className="mt-2 text-[hsl(var(--muted))]">
            El acceso es únicamente para personal del programa.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <ModuleItem
              title="Gestión de pacientes"
              icon={<Users size={22} />}
            />
            <ModuleItem
              title="Pedidos y devolutivos"
              icon={<ClipboardList size={22} />}
            />
            <ModuleItem
              title="Control de inventario"
              icon={<Pill size={22} />}
            />
            <ModuleItem
              title="Reportes e indicadores"
              icon={<Shield size={22} />}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--panel))]">
        <div className="container-app py-6 text-sm text-[hsl(var(--muted))]">
          © {new Date().getFullYear()} Programa de Hospitalización en Domicilio
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]">
          {icon}
        </div>
        <div className="font-semibold">{title}</div>
      </div>
      <p className="mt-2 text-[hsl(var(--muted))] text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function ModuleItem({ icon, title }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]">
        {icon}
      </div>
      <div className="font-medium">{title}</div>
    </div>
  );
}
