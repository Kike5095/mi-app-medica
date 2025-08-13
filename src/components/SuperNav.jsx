// src/components/SuperNav.jsx
import { useNavigate, useLocation } from "react-router-dom";

export default function SuperNav() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const name = localStorage.getItem("userName");

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
    <div style={{
      position: "sticky",
      top: 0,
      zIndex: 10,
      background: "#fff",
      borderBottom: "1px solid #eee",
      padding: "10px 12px",
      marginBottom: 8
    }}>
      <b>Super Admin:</b>{" "}
      {name && <span style={{ marginRight: 8 }}>{name}</span>}
      <Btn to="/admin">Admin</Btn>
      <Btn to="/medico">Médico</Btn>
      <Btn to="/auxiliar">Auxiliar</Btn>
    </div>
  );
}
