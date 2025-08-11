// src/components/Migracion.jsx
import React from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

async function copiarSubcolecciones(origenId, destinoId) {
  // Obtener todas las subcolecciones
  const subcolecciones = ["vitals"]; // puedes agregar más si las tienes
  for (const sub of subcolecciones) {
    const subSnap = await getDocs(collection(db, `patients/${origenId}/${sub}`));
    for (const subDoc of subSnap.docs) {
      await setDoc(
        doc(db, `patients/${destinoId}/${sub}`, subDoc.id),
        subDoc.data()
      );
    }
  }
}

export default function Migracion() {
  const migrarPacientes = async () => {
    try {
      const snapshot = await getDocs(collection(db, "patients"));
      const procesados = new Set();

      for (const paciente of snapshot.docs) {
        const data = paciente.data();
        const cedula = data.id;

        // Evitar duplicados por cédula
        if (procesados.has(cedula)) continue;
        procesados.add(cedula);

        // Crear/actualizar el documento
        await setDoc(doc(db, "patients", cedula), data);

        // Copiar subcolecciones
        await copiarSubcolecciones(paciente.id, cedula);
      }

      alert("Migración completada con subcolecciones");
    } catch (error) {
      console.error("Error migrando pacientes:", error);
      alert("Error migrando pacientes. Ver consola.");
    }
  };

  const limpiarDuplicados = async () => {
    try {
      const snapshot = await getDocs(collection(db, "patients"));
      const vistos = new Set();

      for (const paciente of snapshot.docs) {
        const data = paciente.data();
        const cedula = data.id;

        if (vistos.has(cedula)) {
          // Si ya existe esa cédula, eliminar el documento duplicado
          await deleteDoc(doc(db, "patients", paciente.id));
        } else {
          vistos.add(cedula);
        }
      }

      alert("Duplicados eliminados");
    } catch (error) {
      console.error("Error limpiando duplicados:", error);
      alert("Error limpiando duplicados. Ver consola.");
    }
  };

  return (
    <div>
      <button
        onClick={migrarPacientes}
        style={{ background: "orange", color: "white", padding: "8px", marginRight: "10px" }}
      >
        Migrar pacientes antiguos
      </button>
      <button
        onClick={limpiarDuplicados}
        style={{ background: "red", color: "white", padding: "8px" }}
      >
        Limpiar duplicados
      </button>
    </div>
  );
}
