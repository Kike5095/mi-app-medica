import { db } from "../firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function LimpiarDuplicados() {
  const limpiarDuplicados = async () => {
    try {
      const pacientesRef = collection(db, "patients");
      const snapshot = await getDocs(pacientesRef);

      const vistos = new Map(); // key = cedula/id, value = doc.id

      for (const paciente of snapshot.docs) {
        const data = paciente.data();
        const cedula = data.id || ""; // usa tu campo de identificación

        if (!cedula) {
          console.log(`Paciente sin cédula: ${paciente.id} — Eliminando`);
          await deleteDoc(doc(db, "patients", paciente.id));
          continue;
        }

        if (vistos.has(cedula)) {
          console.log(`Duplicado encontrado: ${cedula} — Eliminando ${paciente.id}`);
          await deleteDoc(doc(db, "patients", paciente.id));
        } else {
          vistos.set(cedula, paciente.id);
        }
      }

      alert("Limpieza completada. Solo queda un registro por cédula.");
    } catch (error) {
      console.error("Error limpiando duplicados:", error);
    }
  };

  return (
    <button
      onClick={limpiarDuplicados}
      style={{
        backgroundColor: "red",
        color: "white",
        padding: "10px 20px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      Limpiar duplicados
    </button>
  );
}
