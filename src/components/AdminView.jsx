// src/components/AdminView.jsx
import { useLocation, Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";

export default function AdminView() {
  const { state } = useLocation();
  const user = state?.user || JSON.parse(localStorage.getItem("user") || "null");

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Panel del Administrador</h2>
        <p>No hay datos de usuario. Vuelve al <Link to="/">inicio de sesión</Link>.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Panel del Administrador</h2>
        <LogoutButton />
      </header>

      <section style={{ marginTop: 12 }}>
        <p><strong>Nombre:</strong> {user.nombre}</p>
        <p><strong>Cédula:</strong> {user.cedula}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Rol:</strong> {user.rol}</p>
      </section>

      {/* TODO: Sprint 1
          - Form para crear paciente (nombre, apellido, cédula, estado=pending)
          - Lista por estado (pendiente/activo/finalizado) con acciones Activar/Finalizar
      */}
    </div>
  );
}
