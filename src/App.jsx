import { Routes, Route, Navigate, Link } from "react-router-dom";
import "./index.css";
import "./styles/lovables.css";

// Páginas
import Home from "./pages/Home.jsx";
import AccessByEmail from "./pages/AccessByEmail.jsx";
import NotFound from "./pages/NotFound.jsx";

// Header sencillo con botón "Ingresar" -> /acceso
function Header() {
  return (
    <header className="w-full border-b bg-white/70 backdrop-blur">
      <div className="container-app flex items-center justify-between py-3">
        <div className="text-sm text-slate-600">Programa de hospitalización en Domicilio</div>
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
        {/* Asegurar Home en "/" */}
        <Route path="/" element={<Home />} />

        {/* Acceso por correo */}
        <Route path="/acceso" element={<AccessByEmail />} />

        {/* Alias por si antes usabas /login */}
        <Route path="/login" element={<Navigate to="/acceso" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

