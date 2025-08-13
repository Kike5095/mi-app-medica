export function getRole() {
  try {
    return localStorage.getItem("role") || "";
  } catch {
    return "";
  }
}

export function isAdmin() {
  const r = getRole();
  return r === "admin" || r === "superadmin";
}

export function assertAdmin() {
  if (!isAdmin()) {
    throw new Error("Solo el administrador puede modificar el paciente.");
  }
}
