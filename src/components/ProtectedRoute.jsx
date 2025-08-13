import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const role = localStorage.getItem("role");
  return role ? children : <Navigate to="/" replace />;
}
