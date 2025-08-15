export default function NotFound() {
  return (
    <div className="container-app">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold mb-2">Página no encontrada.</h1>
        <p className="text-gray-600">
          La ruta que intentas abrir no existe. Usa el menú para regresar.
        </p>
      </div>
    </div>
  );
}
