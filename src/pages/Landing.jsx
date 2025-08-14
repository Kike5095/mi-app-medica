import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing__header">
        <div className="landing__brand">
          <img src={logo} alt="Hospitalización En Casa" className="landing__logo" />
          <h1 className="landing__title">Hospitalización En Casa</h1>
        </div>
        <nav className="landing__nav">
          <Link className="btn btn-primary" to="/acceso">Acceso del personal</Link>
        </nav>
      </header>

      <main className="landing__main">
        <section className="card">
          <h2>Gestión de pacientes en el hogar</h2>
          <p>
            Esta plataforma permite administrar pacientes en hospitalización domiciliaria:
            registro, seguimiento de signos vitales y egreso. El acceso es exclusivo para
            personal autorizado (Auxiliar, Médico, Admin).
          </p>
          <p>
            La información se trata conforme a nuestras políticas de privacidad y términos de uso.
          </p>
        </section>
      </main>

      <footer className="landing__footer">
        <div className="links">
          <Link to="/privacidad">Políticas de Privacidad</Link>
          <span>·</span>
          <Link to="/aviso-legal">Aviso Legal</Link>
          <span>·</span>
          <Link to="/terminos">Términos de Uso</Link>
        </div>
        <div className="contact">
          Contacto: <a href="mailto:evelyngraub@gmail.com">evelyngraub@gmail.com</a>
        </div>
      </footer>
    </div>
  );
}
