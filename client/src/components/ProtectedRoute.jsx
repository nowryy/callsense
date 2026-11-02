import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

// If nobody is logged in, send them to the login page
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}