export function normalizeCedula(value) {
  if (value == null) return "";
  return String(value).replace(/[^\d]/g, "");
}

export function displayCedula(value) {
  return normalizeCedula(value);
}
