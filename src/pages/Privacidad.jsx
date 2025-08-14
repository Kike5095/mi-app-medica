import React from "react";

export default function Privacidad() {
  return (
    <div className="legal-page">
      <h1>Políticas de Privacidad</h1>
      <p>Última actualización: {new Date().toLocaleDateString()}</p>

      <h2>1. Responsable del tratamiento</h2>
      <p>Somos responsables del tratamiento de los datos personales recolectados a través de esta plataforma.</p>

      <h2>2. Datos que tratamos</h2>
      <ul>
        <li>Datos de identificación del personal (nombre, correo, cédula según corresponda).</li>
        <li>Datos necesarios para la gestión clínica de pacientes en el hogar.</li>
      </ul>

      <h2>3. Finalidades</h2>
      <p>La finalidad es gestionar la hospitalización domiciliaria: alta, seguimiento y egreso del paciente.</p>

      <h2>4. Base legal</h2>
      <p>Tratamos los datos conforme a la normativa aplicable y con las autorizaciones correspondientes.</p>

      <h2>5. Conservación</h2>
      <p>Conservamos los datos durante el tiempo necesario para cumplir con fines asistenciales y legales.</p>

      <h2>6. Seguridad</h2>
      <p>Aplicamos medidas técnicas y organizativas para proteger la información.</p>

      <h2>7. Derechos</h2>
      <p>Puede ejercer sus derechos de acceso, rectificación y supresión contactando a: <a href="mailto:evelyngraub@gmail.com">evelyngraub@gmail.com</a>.</p>

      <h2>8. Contacto</h2>
      <p>Correo: <a href="mailto:evelyngraub@gmail.com">evelyngraub@gmail.com</a></p>
    </div>
  );
}
