// src/components/AdminView.jsx
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import PatientForm from "./PatientForm.jsx";
import PatientList from "./PatientList.jsx";
import { createPatient, listPatientsByEstado, setEstado } from "../lib/patients";

export default function AdminView() {
  const { state } = useLocation();
  const user = state?.user || JSON.parse(localStorage.getItem("user") || "null");

  const [pendientes, setPendientes] = useState([]);
  const [activos, setActivos] = useState([]);
  const [finalizados, setFinalizados] = useState([]);
  const [msg, setMsg] = useState("");

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Panel del Administrador</h2>
        <p>No hay datos de usuario. Vuelve al <Link to="/">inicio de sesión</Link>.</p>
      </div>
    );
  }

  const refresh = async () => {
    const [p, a, f] = await Promise.all([
      listPatientsByEstado("pendiente"),
      listPatientsByEstado("activo"),
      listPatientsByEstado("finalizado"),
    ]);
    setPendientes(p); setActivos(a); setFinalizados(f);
  };

  useEffect(() => { refresh(); }, []);

  const onCreate = async ({ nombre, apellido, cedula }) => {
    try {
      await createPatient({ nombre, apellido, cedula });
      setMsg("Paciente creado");
      await refresh();
      return true;
    } catch (e) {
      console.error(e);
      setMsg("Error creando paciente");
      return false;
    }
  };

  return (
    <div style={{ padding: 24, display: "grid", gap: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Panel del Administrador</h2>
        <LogoutButton />
      </header>

      {/* Usa tu PatientForm con un onSubmit que llama a createPatient */}
      <section>
        <h3>Crear paciente</h3>
        <PatientForm onSubmit={onCreate} msg={msg} />
      </section>

      {/* Reutiliza PatientList 3 veces, con handlers distintos */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
        <div>
          <h3>Pendientes</h3>
          <PatientList
            items={pendientes}
            actionLabel="Activar"
            onAction={async (p) => { await setEstado(p.cedula, "activo"); await refresh(); }}
          />
        </div>
        <div>
          <h3>Activos</h3>
          <PatientList
            items={activos}
            actionLabel="Finalizar"
            onAction={async (p) => { await setEstado(p.cedula, "finalizado"); await refresh(); }}
          />
        </div>
        <div>
          <h3>Finalizados</h3>
          <PatientList items={finalizados} />
        </div>
      </section>
    </div>
  );
}
