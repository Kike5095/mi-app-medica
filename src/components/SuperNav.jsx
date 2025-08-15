// src/components/SuperNav.jsx
import { useNavigate, useLocation } from "react-router-dom";

const SUPER_ADMINS = (import.meta.env.VITE_SUPER_ADMINS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export default function SuperNav() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const name =
    localStorage.getItem("userName") || storedUser.nombreCompleto || "";
  const email =
    (storedUser.email || localStorage.getItem("userEmail") || "").toLowerCase();
  const roleReal = localStorage.getItem("role") || "";

  function getDisplayRole(rolReal, email) {
    if (SUPER_ADMINS.includes((email || "").toLowerCase())) return "Médico";
    const map = {
      superadmin: "Super Admin",
      admin: "Admin",
      medico: "Médico",
      auxiliar: "Auxiliar",
    };
    return map[rolReal] || "—";
  }

  const Btn = ({ to, children }) => (
    <button
      onClick={() => nav(to)}
      style={{
        padding: "6px 10px",
        marginRight: 8,
        borderRadius: 6,
        border: "1px solid #ccc",
        background: pathname.startsWith(to) ? "#e6f0ff" : "white",
        cursor: "pointer"
      }}
    >
      {children}
    </button>
  );

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "#fff",
        borderBottom: "1px solid #eee",
        padding: "10px 12px",
        marginBottom: 8,
      }}
    >
      <b>{getDisplayRole(roleReal, email)}:</b>{" "}
      {name && <span style={{ marginRight: 8 }}>{name}</span>}
      <Btn to="/admin">Admin</Btn>
      <Btn to="/medico">Médico</Btn>
      <Btn to="/auxiliar">Auxiliar</Btn>
    </div>
  );
}
