import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container-app">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold mb-2">Página no encontrada.</h1>
        <p className="text-slate-600 mb-4">
          La ruta que intentas abrir no existe. Usa el menú o vuelve al inicio.
        </p>
        <Link to="/" className="btn btn-primary">Volver al inicio</Link>
      </div>
    </div>
  );
}
