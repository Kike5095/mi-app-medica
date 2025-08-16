import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container-app">
      {/* Héroe */}
      <div className="card p-6 md:p-8 mb-8">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Hospitalización en Casa
            </h1>
            <p className="text-slate-600 mb-6">
              Portal del Programa de hospitalización en Domicilio para personal
              autorizado. Gestión segura y organizada del cuidado.
            </p>
            <div className="flex gap-3">
              <a href="#programa" className="btn btn-outline">Conocer el programa</a>
              <Link to="/acceso" className="btn btn-primary">Acceder al sistema</Link>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Responsable institucional: Evelyn Grau, Jefe de Enfermeras.
            </p>
          </div>
          {/* panel visual sin imagen remota */}
          <div className="h-40 md:h-52 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border" />
        </div>
      </div>

      {/* Módulos principales */}
      <section id="programa" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Coordinación clínica', desc: 'Interdisciplinaria para garantizar continuidad.' },
          { title: 'Gestión de insumos', desc: 'Control de insumos/medicación con seguimiento.' },
        { title: 'Seguimiento continuo', desc: 'Evolución y continuidad del cuidado.' },
          { title: 'Seguridad del paciente', desc: 'Buenas prácticas y seguridad en cada intervención.' },
        ].map((m) => (
          <div key={m.title} className="card p-5">
            <div className="mb-3 h-9 w-9 rounded-lg bg-slate-100 border flex items-center justify-center">
              <span className="text-slate-400 text-lg">◆</span>
            </div>
            <h3 className="font-semibold mb-1">{m.title}</h3>
            <p className="text-sm text-slate-500">{m.desc}</p>
          </div>
        ))}
      </section>

      {/* Para el equipo */}
      <h2 className="text-2xl font-bold mt-10 mb-4">Para el equipo</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-slate-100 border flex items-center justify-center">
              <span className="text-slate-400 text-lg">👤</span>
            </div>
            <span className="font-medium">Gestión de pacientes</span>
          </div>
          <span className="text-slate-400">›</span>
        </div>
        <div className="card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-slate-100 border flex items-center justify-center">
              <span className="text-slate-400 text-lg">📦</span>
            </div>
            <span className="font-medium">Pedidos y devolutivos</span>
          </div>
          <span className="text-slate-400">›</span>
        </div>
      </div>
    </div>
  );
}

