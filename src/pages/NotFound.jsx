export default function NotFound() {
  return (
    <main className="container-app">
      <div className="card">
        <h1 className="text-2xl font-semibold mb-2">Página no encontrada.</h1>
        <p className="text-slate-600 mb-4">
          La ruta que intentas abrir no existe. Usa el menú para regresar.
        </p>
        <a href="/" className="btn">Volver al inicio</a>
      </div>
    </main>
  );
}

