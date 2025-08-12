export function parseBP(value) {
  if (value == null) return null;
  const str = String(value).trim();
  const match = str.match(/(\d{2,3})\D*(\d{2,3})/);
  if (match) {
    const sys = Number(match[1]);
    const dia = Number(match[2]);
    return { sys, dia, text: `${sys}/${dia}` };
  }
  const digits = str.replace(/\D/g, "");
  if (digits.length >= 4 && digits.length <= 6) {
    const sys = Number(digits.slice(0, -2));
    const dia = Number(digits.slice(-2));
    return { sys, dia, text: `${sys}/${dia}` };
  }
  return null;
}
