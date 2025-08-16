export default function Home() {
  return (
    <main className="container-app">
      <div className="card">
        <h1 className="section-title mb-2">Hospitalización en Casa</h1>
        <p className="text-muted-foreground mb-4">
          Portal del Programa de hospitalización en Domicilio para personal autorizado.
          Gestión segura y organizada del cuidado.
        </p>
        <div className="flex gap-3">
          <a href="#programa" className="btn btn-outline">Conocer el programa</a>
          <a href="/acceso" className="btn">Acceder al sistema</a>
        </div>
      </div>

      {/* Tarjetas ejemplo (opcional) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="card"><h3 className="font-semibold mb-1">Coordinación clínica</h3><p className="text-sm text-slate-500">Interdisciplinaria para garantizar continuidad.</p></div>
        <div className="card"><h3 className="font-semibold mb-1">Gestión de insumos</h3><p className="text-sm text-slate-500">Control de insumos/medicación.</p></div>
        <div className="card"><h3 className="font-semibold mb-1">Seguimiento continuo</h3><p className="text-sm text-slate-500">Evolución y continuidad del cuidado.</p></div>
        <div className="card"><h3 className="font-semibold mb-1">Seguridad del paciente</h3><p className="text-sm text-slate-500">Buenas prácticas y seguridad.</p></div>
      </div>
    </main>
  );
}

