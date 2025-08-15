export default function TopBar({ title }) {
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };
  return (
    <div className="section-header" style={{ marginBottom: 20 }}>
      <h1 className="section-title">{title}</h1>
      <button className="btn" onClick={logout}>
        Cerrar sesión
      </button>
    </div>
  );
}
