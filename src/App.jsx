import { Suspense } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import AccessByEmail from './pages/AccessByEmail.jsx';
import NotFound from './pages/NotFound.jsx';

// Placeholders de rutas por rol (mantener simple por ahora)
function AdminResolved() {
  return (
    <div className="container-app">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold mb-1">Panel Admin</h1>
        <p className="text-slate-500">Ruta: /admin</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      {/* Header minimal con botón que navega a /acceso */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
        <div className="container-app py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold text-slate-900">
            Programa de hospitalización en Domicilio
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              to="/acceso"
              className="btn btn-primary"
              aria-label="Ingresar"
            >
              Ingresar
            </Link>
          </nav>
        </div>
      </header>

      <main className="py-6">
        <Suspense fallback={<div className="container-app">Cargando…</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/acceso" element={<AccessByEmail />} />
            {/* rutas por rol (placeholder simple) */}
            <Route path="/admin/*" element={<AdminResolved />} />
            {/* alias comunes o compatibilidad si tenías /login */}
            <Route path="/login" element={<Navigate to="/acceso" replace />} />
            {/* fallback 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
    </>
  );
}

