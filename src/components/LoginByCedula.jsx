import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserByCedula, isCedulaInSuperAdmins } from "../lib/users";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

const normCed = (s) => (s || "").toString().trim().replace(/[.\s-]/g, "");

export default function LoginByCedula() {
  const [cedula, setCedula] = useState("");
  const [buscando, setBuscando] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    document.title = "Acceso del personal · Mi App Médica";
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const ced = normCed(cedula);
    if (!ced) return;
    setBuscando(true);
    try {
      const user = await getUserByCedula(ced);
      if (isCedulaInSuperAdmins(ced)) {
        localStorage.setItem("role", "superadmin");
        localStorage.setItem("userId", ced);
        localStorage.setItem("userName", user?.nombreCompleto || "");
        try {
          if (user?.role !== "superadmin") {
            await updateDoc(doc(db, "users", ced), {
              role: "superadmin",
              updatedAt: serverTimestamp(),
            });
          }
        } catch (e) {
          /* no-op */
        }
        nav("/admin");
        return;
      }
      if (user) {
        localStorage.setItem("role", user.role || "");
        localStorage.setItem("userId", user.cedula);
        localStorage.setItem("userName", user.nombreCompleto || "");
        const r = user.role;
        localStorage.setItem("viewAs", r === "superadmin" ? "admin" : r);
        if (r === "admin" || r === "superadmin") nav("/admin");
        else if (r === "medico") nav("/medico");
        else if (r === "auxiliar") nav("/auxiliar");
        else nav("/acceso");
      } else {
        nav(`/registro?cedula=${encodeURIComponent(ced)}`);
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo buscar. Revisa la consola.");
    } finally {
      setBuscando(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      style={{ maxWidth: 420, margin: "40px auto", padding: 16, textAlign: "center" }}
    >
      <h1 style={{ marginBottom: 20 }}>Acceso del personal</h1>
      <p style={{ marginBottom: 20 }}>
        Ingresa tu cédula de personal para continuar.
      </p>
      <input
        placeholder="Cédula del personal"
        value={cedula}
        onChange={(e) => setCedula(normCed(e.target.value))}
        style={{ display: "block", width: "100%", padding: 10, marginBottom: 12 }}
      />
      <button
        type="submit"
        disabled={buscando || !cedula.trim()}
        className="btn primary"
        style={{ width: "100%", padding: 12 }}
      >
        {buscando ? "Buscando..." : "Continuar"}
      </button>
    </form>
  );
}
