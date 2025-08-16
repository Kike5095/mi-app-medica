import { Suspense } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import AccessByEmail from "./pages/AccessByEmail.jsx";

// Vistas dummy por rol (puedes reemplazar luego)
function Home() {
  return (
    <div className="container-app">
      <div className="card p-6">
        <h1 className="section-title mb-2">Hospitalización en Casa</h1>
        <p className="text-muted-foreground mb-6">
          Portal del Programa de hospitalización en Domicilio para personal autorizado.
        </p>
        <div className="flex gap-3">
          <a href="#programa" className="btn btn-outline">Conocer el programa</a>
          <Link to="/acceso" className="btn">Acceder al sistema</Link>
        </div>
      </div>
    </div>
  );
}

function Admin() { return <div className="container-app"><div className="card p-6">Panel Admin<br/>Ruta: /admin</div></div>; }
function Medico() { return <div className="container-app"><div className="card p-6">Panel Médico<br/>Ruta: /medico</div></div>; }
function Auxiliar(){ return <div className="container-app"><div className="card p-6">Panel Auxiliar<br/>Ruta: /auxiliar</div></div>; }

function NotFound() {
  return (
    <div className="container-app">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold mb-2">Página no encontrada.</h1>
        <p className="text-muted-foreground">La ruta que intentas abrir no existe. Usa el menú para regresar.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/acceso" element={<AccessByEmail />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/medico/*" element={<Medico />} />
        <Route path="/auxiliar/*" element={<Auxiliar />} />
        <Route path="/ingresar" element={<Navigate to="/acceso" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
