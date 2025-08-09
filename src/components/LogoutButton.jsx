// src/components/LogoutButton.jsx
import { useNavigate } from "react-router-dom";

export default function LogoutButton({ children = "Salir", style }) {
  const navigate = useNavigate();
  const onClick = () => {
    localStorage.removeItem("user");
    navigate("/");
  };
  return (
    <button onClick={onClick} style={style}>
      {children}
    </button>
  );
}
