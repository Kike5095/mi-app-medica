import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container-app">
      <div className="card p-6">
        <h1 className="text-3xl font-bold mb-2">Hospitalización en Casa</h1>
        <p className="text-slate-600 mb-6">
          Portal del Programa de hospitalización en Domicilio para personal autorizado.
          Gestión segura y organizada del cuidado.
        </p>

        <div className="flex gap-3">
          {/* IMPORTANTE: usar Link */}
          <Link to="#programa" className="btn btn-outline">Conocer el programa</Link>
          <Link to="/acceso" className="btn btn-primary">Acceder al sistema</Link>
        </div>
      </div>
    </div>
  );
}
