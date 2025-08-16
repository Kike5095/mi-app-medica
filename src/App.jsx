import { Routes, Route, Navigate, Link } from "react-router-dom";

// Páginas
import Home from "./pages/Home.jsx";
import AccessByEmail from "./pages/AccessByEmail.jsx";
import NotFound from "./pages/NotFound.jsx";

function Header() {
  return (
    <header className="w-full border-b bg-white/70 backdrop-blur">
      <div className="container-app flex items-center justify-between py-3">
        <div className="text-sm text-slate-600">
          Programa de hospitalización en Domicilio
        </div>
        {/* IMPORTANTE: Link, NO <a href> */}
        <Link to="/acceso" className="btn btn-primary">Ingresar</Link>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/acceso" element={<AccessByEmail />} />
        <Route path="/login" element={<Navigate to="/acceso" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
