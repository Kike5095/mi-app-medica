import { useNavigate } from "react-router-dom";
export default function LogoutButton({ children="Salir", style }) {
  const navigate = useNavigate();
  return <button onClick={()=>{localStorage.removeItem("user");navigate("/")}} style={style}>{children}</button>
}
