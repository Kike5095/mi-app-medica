import { useNavigate } from "react-router-dom";
export default function LogoutButton({ children="Salir", style }) {
  const navigate = useNavigate();
  return <button onClick={()=>{localStorage.removeItem("role");localStorage.removeItem("userId");localStorage.removeItem("userName");navigate("/")}} style={style}>{children}</button>
}
