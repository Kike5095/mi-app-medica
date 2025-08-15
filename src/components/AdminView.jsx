import { useEffect, useState, useMemo } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import PatientForm from "./PatientForm";
import RoleSwitcher from "./RoleSwitcher";
import TopBar from "./TopBar";
import SuperNav from "./SuperNav";
import { ingresoDisplay, finDisplay } from "../utils/dates";
import { isAdmin } from "../utils/roles";
import { isSuperAdminLocal } from "../lib/users";
import { displayCedula } from "../utils/format";
import {
  updateUserRoleById,
  canChangeTargetUser,
  isPrivileged,
} from "../lib/db";
import { Button } from "./ui/button";

function RolSelect({ value, disabled, onChange }) {
  return (
    <select
      className="input"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="auxiliar">Auxiliar</option>
      <option value="medico">Medico</option>
      <option value="admin">Admin</option>
    </select>
  );
}

function formatName(p) {
  const name = (p.nombreCompleto || `${p.firstName || ""} ${p.lastName || ""}`).trim();
  return name || "—";
}

function showVal(v) {
  return v || v === 0 ? String(v) : "—";
}

function truncate(t, n = 40) {
  if (!t) return "—";
  return t.length > n ? t.slice(0, n) + "…" : t;
}

function fdate(ts) {
  if (!ts) return "—";
  try {
    if (typeof ts === "object" && ts.seconds)
      return new Date(ts.seconds * 1000).toLocaleString();
    const d = ts instanceof Date ? ts : new Date(ts);
    return isNaN(d) ? "—" : d.toLocaleString();
  } catch {
    return "—";
  }
}

export default function AdminView() {
  const [patients, setPatients] = useState([]);
  const [creating, setCreating] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [users, setUsers] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUser = storedUser;
  const currentRole = localStorage.getItem("role") || "";
  const puedeEditar = isPrivileged(currentUser, currentRole);

  useEffect(() => {
    const q = collection(db, "patients");
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPatients(rows);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("updatedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setUsers(list);
    });
    return () => unsub();
  }, []);

  const pendientes = useMemo(
    () => patients.filter((p) => (p.status || "").toLowerCase() === "pendiente"),
    [patients]
  );
  const activos = useMemo(
    () => patients.filter((p) => (p.status || "").toLowerCase() === "activo"),
    [patients]
  );
  const finalizados = useMemo(
    () => patients.filter((p) => (p.status || "").toLowerCase() === "finalizado"),
    [patients]
  );

  const refrescar = async () => {
    const snap = await getDocs(collection(db, "patients"));
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setPatients(rows);
  };

  const updateLocal = (id, changes) => {
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, ...changes } : p)));
  };

  const activar = (p) => {
    const fecha = new Date();
    updateLocal(p.id, { status: "activo", fechaIngreso: fecha });
    updateDoc(doc(db, "patients", p.id), {
      status: "activo",
      fechaIngreso: serverTimestamp(),
    });
  };

  const finalizar = (p) => {
    const fecha = new Date();
    updateLocal(p.id, { status: "finalizado", finAt: fecha, fechaFin: fecha });
    const ts = serverTimestamp();
    updateDoc(doc(db, "patients", p.id), {
      status: "finalizado",
      finAt: ts,
      fechaFin: ts,
    });
  };

  async function handleSave(u, nextRole) {
    if (!puedeEditar) return;
    if (!canChangeTargetUser(u.correo)) {
      alert("No puedes modificar el rol de un superadmin.");
      return;
    }
    try {
      setSavingId(u.id);
      await updateUserRoleById(u.id, nextRole);
    } finally {
      setSavingId(null);
    }
  }

  const UserRow = ({ u }) => {
    const esSuperTarget = !canChangeTargetUser(u.correo);
    const [localRole, setLocalRole] = useState(u.role || "auxiliar");
    const disabled = !puedeEditar || esSuperTarget || savingId === u.id;
    return (
      <tr key={u.id}>
        <td>{u.nombreCompleto || "—"}</td>
        <td>{displayCedula(u.cedula) || "—"}</td>
        <td>{u.correo || "—"}</td>
        <td>
          <RolSelect value={localRole} disabled={disabled} onChange={setLocalRole} />
          {esSuperTarget && <div className="caption">Superadmin</div>}
        </td>
        <td>
          <button
            className="btn"
            disabled={disabled || localRole === (u.role || "auxiliar")}
            onClick={() => handleSave(u, localRole)}
          >
            {savingId === u.id ? "Guardando…" : "Guardar"}
          </button>
        </td>
        <td>{fdate(u.updatedAt || u.createdAt)}</td>
      </tr>
    );
  };
  const renderRows = (list, tipo) =>
    list.map((p) => {
      const ingreso = ingresoDisplay(p);
      const fin = finDisplay(p);
      const isEstimado = !!p.finEstimadoAt && !p.finAt;
      return (
        <tr key={p.id}>
          <td><span className="no-detect">{formatName(p)}</span></td>
          <td>
            <span className="no-detect">{displayCedula(p.cedula) || "—"}</span>
          </td>
          <td>{showVal(p.edad)}</td>
          <td title={p.diagnostico || ""}>{truncate(p.diagnostico, 30)}</td>
          <td>{ingreso}</td>
          <td>
            {fin}
            {isEstimado ? " (planificado)" : ""}
          </td>
          <td>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn"
                onClick={() =>
                  navigate(`/paciente/${p.id}`, { state: { from: "admin" } })
                }
              >
                Ver historial
              </button>
              {isAdmin() && (
                <button className="btn" onClick={() => setEditingPatient(p)}>
                  Editar
                </button>
              )}
              {tipo === "pendiente" && (
                <button className="btn primary" onClick={() => activar(p)}>
                  Activar
                </button>
              )}
              {tipo === "activo" && (
                <button className="btn danger" onClick={() => finalizar(p)}>
                  Finalizar
                </button>
              )}
            </div>
          </td>
        </tr>
      );
    });

  const renderTable = (title, list, tipo) => (
    <section className="card">
      <div className="card-body">
        <h2>{title}</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cédula</th>
                <th>Edad</th>
                <th>Diagnóstico</th>
                <th>Ingreso</th>
                <th>Fin</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={7}>No hay pacientes</td>
                </tr>
              ) : (
                renderRows(list, tipo)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );

  return (
    <div className="container-app">
      {isSuperAdminLocal() && <SuperNav />}
      <TopBar title="Panel Admin" />
      <div className="section-header">
        <h1 className="section-title">Pacientes</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {isSuperAdminLocal() && <RoleSwitcher />}
        </div>
      </div>

      <Button onClick={() => setCreating(true)}>Crear paciente</Button>

      {renderTable("Pendientes", pendientes, "pendiente")}
      {renderTable("Activos", activos, "activo")}
      {renderTable("Finalizados", finalizados, "finalizado")}

      <section id="usuarios" style={{ marginTop: 32 }}>
        <div className="card">
          <div className="card-header">
            <h2 style={{ fontWeight: 700, fontSize: 18 }}>Usuarios registrados</h2>
            <p style={{ color: "#667085", marginTop: 4 }}>
              Lista en tiempo real desde Firestore
            </p>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cédula</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Acción</th>
                  <th>Actualizado</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ textAlign: "center", color: "#98A2B3" }}
                    >
                      No hay usuarios
                    </td>
                  </tr>
                )}
                {users.map((u) => (
                  <UserRow key={u.id} u={u} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {creating && (
        <PatientForm
          onCreated={refrescar}
          onClose={() => setCreating(false)}
        />
      )}
      {editingPatient && (
        <PatientForm
          mode="edit"
          initialValues={editingPatient}
          onUpdated={refrescar}
          onClose={() => setEditingPatient(null)}
        />
      )}
    </div>
  );
}

