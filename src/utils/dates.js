export function parseLegacyDate(value) {
  if (!value) return null;
  // Firestore Timestamp
  if (value && typeof value === "object" && "seconds" in value) {
    return new Date(value.seconds * 1000);
  }
  if (value instanceof Date) return value;

  if (typeof value === "string") {
    const s = value.trim();
    // dd/mm/yyyy | dd-mm-yyyy | dd.mm.yyyy
    let m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
    if (m) {
      let [, d, mm, y] = m;
      if (y.length === 2) y = "20" + y;
      const dt = new Date(+y, +mm - 1, +d);
      return isNaN(+dt) ? null : dt;
    }
    // yyyy-mm-dd | yyyy/mm/dd | yyyy.mm.dd
    m = s.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
    if (m) {
      const [, y, mm, d] = m;
      const dt = new Date(+y, +mm - 1, +d);
      return isNaN(+dt) ? null : dt;
    }
    // Último intento: Date nativo
    const dt = new Date(s);
    if (!isNaN(+dt)) return dt;
  }
  return null;
}

export function asDate(v) {
  return parseLegacyDate(v);
}

export function fmtDate(v) {
  const d = asDate(v);
  if (!d) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function ingresoDisplay(p) {
  // ingresoAt (TS) | ingreso (string) | createdAt (TS)
  return fmtDate(p.ingresoAt ?? p.ingreso ?? p.createdAt);
}

export function finDisplay(p) {
  // Prioridad: real > estimado > legacy strings/campos alternos
  const v =
    p.finAt ??
    p.finEstimadoAt ??
    p.fin ?? // legacy string
    p.fechaFin ?? // otros nombres posibles
    p.finDate; // otros nombres posibles
  return fmtDate(v);
}
