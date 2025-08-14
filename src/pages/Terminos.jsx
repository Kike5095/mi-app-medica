import React from "react";

export default function Terminos() {
  return (
    <div className="legal-page">
      <h1>Términos de Uso</h1>
      <p>Última actualización: {new Date().toLocaleDateString()}</p>

      <h2>1. Objeto</h2>
      <p>Regular las condiciones de acceso y uso de la plataforma por parte del personal autorizado.</p>

      <h2>2. Registro y acceso</h2>
      <p>El acceso requiere autenticación con credenciales válidas provistas por la organización.</p>

      <h2>3. Conducta del usuario</h2>
      <p>Debe garantizar la veracidad de la información e impedir accesos no autorizados.</p>

      <h2>4. Privacidad</h2>
      <p>El tratamiento de datos se rige por nuestras Políticas de Privacidad.</p>

      <h2>5. Modificaciones</h2>
      <p>Podemos actualizar estos términos; los cambios se publicarán en esta página.</p>

      <h2>6. Contacto</h2>
      <p>Correo: <a href="mailto:evelyngraub@gmail.com">evelyngraub@gmail.com</a></p>
    </div>
  );
}
