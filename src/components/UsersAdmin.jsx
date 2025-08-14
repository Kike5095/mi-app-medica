import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUsersPage,
  findUserByCedula,
  updateUserRole,
  isSuperAdminLocal,
} from "../lib/users";
import LogoutButton from "./LogoutButton";
import RoleSwitcher from "./RoleSwitcher";

export default function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [cedula, setCedula] = useState("");
  const [roles, setRoles] = useState({});
  const navigate = useNavigate();
  const myCedula = localStorage.getItem("userId");

  useEffect(() => {
    (async () => {
      try {
        const rows = await getUsersPage();
        setUsers(rows);
      } catch (err) {
        console.error(err);
        alert("No se pudieron cargar los usuarios. Revisa la consola.");
      }
    })();
  }, []);

  const buscar = async () => {
    try {
      if (cedula.trim()) {
        const u = await findUserByCedula(cedula.trim());
        if (u) {
          setUsers([{ ...u, cedula: u.cedula || u.id }]);
        } else {
          setUsers([]);
          alert("Usuario no encontrado.");
        }
      } else {
        const rows = await getUsersPage();
        setUsers(rows);
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo buscar. Revisa la consola.");
    }
  };

  const onChangeRole = (id, role) => {
    setRoles((prev) => ({ ...prev, [id]: role }));
  };

  const guardar = async (u) => {
    const newRole = roles[u.id] || u.role || "";
    try {
      await updateUserRole(u.id, newRole);
      alert("Rol actualizado");
      const updatedAt = new Date();
      setUsers((prev) =>
        prev.map((p) =>
          p.id === u.id ? { ...p, role: newRole, updatedAt } : p
        )
      );
      if (u.id === myCedula) {
        localStorage.setItem("role", newRole);
        if (newRole !== "admin") {
          const route =
            newRole === "medico"
              ? "/medico"
              : newRole === "auxiliar"
              ? "/auxiliar"
              : "/acceso";
          navigate(route);
        }
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar. Revisa la consola.");
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString();
    };

  return (
    <div className="page">
      <div className="container">
        <div className="section-header" style={{ gap: 8 }}>
          <h1 className="section-title">Usuarios</h1>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              placeholder="Cédula"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
            />
            <button className="btn" onClick={buscar}>
              Buscar
            </button>
            <LogoutButton />
            {isSuperAdminLocal() && <RoleSwitcher />}
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cédula</th>
                <th>Correo</th>
                <th>Rol actual</th>
                <th>Actualizado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6}>No hay usuarios</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.nombreCompleto || "—"}</td>
                    <td>{u.cedula || u.id}</td>
                    <td>{u.correo || "—"}</td>
                    <td>
                      <select
                        value={roles[u.id] || u.role || ""}
                        onChange={(e) => onChangeRole(u.id, e.target.value)}
                      >
                        <option value="auxiliar">auxiliar</option>
                        <option value="medico">medico</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>{formatDate(u.updatedAt)}</td>
                    <td>
                      <button className="btn" onClick={() => guardar(u)}>
                        Guardar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

