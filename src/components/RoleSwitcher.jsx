import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isSuperAdminLocal } from "../lib/users";

export default function RoleSwitcher() {
  const [viewAs, setViewAs] = useState(() => localStorage.getItem("viewAs") || "admin");
  const nav = useNavigate();

  useEffect(() => {
    localStorage.setItem("viewAs", viewAs);
  }, [viewAs]);

  if (!isSuperAdminLocal()) return null;

  const go = () => {
    if (viewAs === "admin") nav("/admin");
    else if (viewAs === "medico") nav("/medico");
    else if (viewAs === "auxiliar") nav("/auxiliar");
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <label style={{ marginRight: 4 }}>Ver como:</label>
      <select value={viewAs} onChange={(e) => setViewAs(e.target.value)}>
        <option value="admin">admin</option>
        <option value="medico">medico</option>
        <option value="auxiliar">auxiliar</option>
      </select>
      <button className="btn" onClick={go}>Ir</button>
    </div>
  );
}
