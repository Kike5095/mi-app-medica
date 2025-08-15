import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AccessByEmail from "./pages/AccessByEmail.jsx";
import NotFound from "./pages/NotFound.jsx";
import Home from "./pages/Home.jsx";

// Importa tus resolvers si existen; de lo contrario, comenta esas rutas.
// import AdminResolved from "./pages/AdminResolved.jsx";
// import MedicoResolved from "./pages/MedicoResolved.jsx";
// import AuxiliarResolved from "./pages/AuxiliarResolved.jsx";

export default function App() {
  return (
    <Suspense fallback={<div className="p-6">Cargando…</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/acceso" element={<AccessByEmail />} />

        {/**
        <Route path="/admin/*" element={<AdminResolved />} />
        <Route path="/medico/*" element={<MedicoResolved />} />
        <Route path="/auxiliar/*" element={<AuxiliarResolved />} />
        */}

        {/* alias comunes (opcional) */}
        <Route path="/login" element={<Navigate to="/acceso" replace />} />
        <Route path="/ingresar" element={<Navigate to="/acceso" replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
