/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-bg)", color: "var(--color-foreground, #0f172a)" }}
    >
      {/* Top bar */}
      <header className="w-full border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{ background: "rgba(26,106,255,0.12)", color: "var(--color-primary)" }}
            >
              <span className="text-sm font-semibold">H</span>
            </div>
            <span className="font-medium">Programa de hospitalización en Domicilio</span>
          </div>
          <Link
            to="/acceso"
            className="inline-flex items-center gap-2 px-4 h-9 rounded-md font-medium"
            style={{ background: "var(--color-primary)", color: "#fff" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-primary-600)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-primary)")}
          >
            Ingresar
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div
          className="rounded-lg p-8 shadow"
          style={{ background: "var(--color-panel)", boxShadow: "var(--shadow-md, 0 4px 12px rgba(16,24,40,0.08))", border: "1px solid var(--color-border)" }}
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Hospitalización en Casa
              </h1>
              <p className="text-sm md:text-base opacity-80 mb-6">
                Portal del Programa de hospitalización en Domicilio para personal autorizado.
                Gestión segura y organizada del cuidado.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#programa"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-md font-semibold border"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-panel)" }}
                >
                  Conocer el programa
                </a>
                <Link
                  to="/acceso"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-md font-semibold"
                  style={{ background: "var(--color-primary)", color: "#fff" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-primary-600)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-primary)")}
                >
                  Acceder al sistema
                </Link>
              </div>
              <p className="mt-6 text-xs opacity-60">
                Responsable institucional: Evelyn Grau, Jefe de Enfermeras.
              </p>
            </div>

            {/* Placeholder visual (sin imagen real) */}
            <div className="hidden md:flex items-center justify-center">
              <div
                className="w-full h-56 rounded-xl border"
                style={{
                  borderColor: "var(--color-border)",
                  background:
                    "linear-gradient(135deg, rgba(26,106,255,0.08), rgba(26,106,255,0.02))",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pilares */}
      <section id="programa" className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { title: "Coordinación clínica", desc: "Interdisciplinaria para garantizar continuidad.", icon: "🗂️" },
            { title: "Gestión de insumos", desc: "Control de insumos/medicación con seguimiento.", icon: "📦" },
            { title: "Seguimiento continuo", desc: "Evolución y continuidad del cuidado.", icon: "📈" },
            { title: "Seguridad del paciente", desc: "Buenas prácticas en cada intervención.", icon: "🛡️" },
          ].map((card, i) => (
            <div
              key={i}
              className="rounded-xl p-5 shadow-sm"
              style={{
                background: "var(--color-panel)",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-sm, 0 1px 2px rgba(16,24,40,0.04))",
              }}
            >
              <div
                className="w-10 h-10 rounded-md mb-3 flex items-center justify-center text-lg"
                style={{ background: "rgba(26,106,255,0.12)", color: "var(--color-primary)" }}
              >
                {card.icon}
              </div>
              <h3 className="font-semibold mb-1">{card.title}</h3>
              <p className="text-sm opacity-70">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Módulos para el equipo */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold mb-4">Para el equipo</h2>
        <p className="text-sm opacity-70 mb-6">
          El acceso es únicamente para personal del programa.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: "Gestión de pacientes", icon: "👥" },
            { title: "Pedidos y devolutivos", icon: "🧾" },
          ].map((m, i) => (
            <div
              key={i}
              className="rounded-xl p-5 flex items-center gap-4"
              style={{
                background: "var(--color-panel)",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-sm, 0 1px 2px rgba(16,24,40,0.04))",
              }}
            >
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center text-lg"
                style={{ background: "rgba(26,106,255,0.12)", color: "var(--color-primary)" }}
              >
                {m.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{m.title}</p>
                <p className="text-xs opacity-70">Disponible después del ingreso.</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
