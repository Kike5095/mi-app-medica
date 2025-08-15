import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import AccessByEmail from "./pages/AccessByEmail.jsx";
// Si tienes estas páginas, déjalas; si no, ignóralas.
const NotFound = () => <div style={{padding:24}}>Página no encontrada.</div>;

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* Ruta oficial de acceso */}
      <Route path="/acceso" element={<AccessByEmail />} />
      {/* Alias opcionales por si se enlaza diferente */}
      <Route path="/login" element={<Navigate to="/acceso" replace />} />
      <Route path="/ingresar" element={<Navigate to="/acceso" replace />} />
      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
