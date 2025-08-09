// src/components/AuxiliarView.jsx
import { useState } from "react";
import LogoutButton from "./LogoutButton";
import PatientSearch from "./PatientSearch.jsx";
import PatientVitals from "./PatientVitals.jsx"; // o DataEntryView.jsx
import { getPatient, addVitals } from "../lib/patients";

export default function AuxiliarView() {
  const [paciente, setPaciente] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const onSearch = async (cedula) => {
    const p = await getPatient(cedula);
    setPaciente(p || null);
  };

  const onSaveVitals = async (values) => {
    if (!paciente) return;
    await addVitals(paciente.cedula, values, {
      creadoPorCedula: user?.cedula,
      creadoPorRol: user?.rol,
    });
    alert("Signos guardados");
  };

  return (
    <div style={{ padding: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Panel del Auxiliar</h2>
        <LogoutButton />
      </header>

      <PatientSearch onSearch={onSearch} />

      {paciente ? (
        <>
          <h3>Paciente: {paciente.nombre} {paciente.apellido} — {paciente.cedula}</h3>
          <PatientVitals onSubmit={onSaveVitals} />
        </>
      ) : (
        <p>Busca un paciente por cédula…</p>
      )}
    </div>
  );
}
