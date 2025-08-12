export function getRole() {
  try {
    return localStorage.getItem("role") || "";
  } catch {
    return "";
  }
}

export function isAdmin() {
  return getRole() === "admin";
}

export function assertAdmin() {
  if (!isAdmin()) {
    throw new Error("Solo el administrador puede modificar el paciente.");
  }
}
