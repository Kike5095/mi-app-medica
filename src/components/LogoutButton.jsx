import { useNavigate } from "react-router-dom";

export default function LogoutButton({ children = "Salir", style }) {
  const navigate = useNavigate();
  const name = localStorage.getItem("userName");
  const onClick = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("viewAs");
    navigate("/");
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {name && <span>{name}</span>}
      <button onClick={onClick} style={style}>
        {children}
      </button>
    </div>
  );
}
