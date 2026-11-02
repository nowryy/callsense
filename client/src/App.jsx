import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Calls from "./pages/Calls";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/calls"
        element={
          <ProtectedRoute>
            <Calls />
          </ProtectedRoute>
        }
      />
      {/* Any other address goes to /calls (which sends you to login if needed) */}
      <Route path="*" element={<Navigate to="/calls" replace />} />
    </Routes>
  );
}

export default App;