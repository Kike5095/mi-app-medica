import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AccessByEmail from "./pages/AccessByEmail";
import NotFound from "./pages/NotFound";

// Placeholders mínimos para que las rutas existan
function Home() {
  return (
    <div className="container-app">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold mb-2">Hospitalización en Casa</h1>
        <p className="text-gray-600 mb-4">
          Portal del Programa de hospitalización en Domicilio para personal autorizado.
        </p>
        <div className="flex gap-3">
          <a href="#programa" className="btn btn-outline">Conocer el programa</a>
          <a href="/acceso" className="btn">Acceder al sistema</a>
        </div>
      </div>
    </div>
  );
}
function AdminResolved() {
  return (
    <div className="container-app">
      <div className="card p-6">
        <h2 className="text-xl font-semibold">Panel Admin</h2>
        <p className="text-gray-600">Ruta: /admin</p>
      </div>
    </div>
  );
}
function MedicoResolved() {
  return (
    <div className="container-app">
      <div className="card p-6">
        <h2 className="text-xl font-semibold">Panel Médico</h2>
        <p className="text-gray-600">Ruta: /medico</p>
      </div>
    </div>
  );
}
function AuxiliarResolved() {
  return (
    <div className="container-app">
      <div className="card p-6">
        <h2 className="text-xl font-semibold">Panel Auxiliar</h2>
        <p className="text-gray-600">Ruta: /auxiliar</p>
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

        {/* Rutas por rol (mínimas para evitar 404 tras login) */}
        <Route path="/admin/*" element={<AdminResolved />} />
        <Route path="/medico/*" element={<MedicoResolved />} />
        <Route path="/auxiliar/*" element={<AuxiliarResolved />} />
        <Route path="/superadmin/*" element={<AdminResolved />} />

        {/* Alias comunes */}
        <Route path="/login" element={<Navigate to="/acceso" replace />} />
        <Route path="/ingresar" element={<Navigate to="/acceso" replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
