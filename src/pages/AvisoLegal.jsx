import React from "react";

export default function AvisoLegal() {
  return (
    <div className="legal-page">
      <h1>Aviso Legal</h1>
      <p>Última actualización: {new Date().toLocaleDateString()}</p>

      <h2>1. Titular del sitio</h2>
      <p>Este sitio está destinado a la gestión de pacientes en hospitalización en casa.</p>

      <h2>2. Condiciones de uso</h2>
      <p>El uso está restringido al personal autorizado. Queda prohibido el uso no autorizado.</p>

      <h2>3. Propiedad intelectual</h2>
      <p>Los contenidos y desarrollos de software están protegidos por las leyes aplicables.</p>

      <h2>4. Responsabilidad</h2>
      <p>No nos responsabilizamos por usos indebidos ni por la disponibilidad de servicios de terceros.</p>

      <h2>5. Contacto</h2>
      <p>Correo: <a href="mailto:evelyngraub@gmail.com">evelyngraub@gmail.com</a></p>
    </div>
  );
}
