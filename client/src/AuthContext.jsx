import { createContext, useContext, useState } from "react";
import api from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Start with the saved user (if any), so a page refresh keeps you logged in
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  // Save the token and user in the browser, and in state
  function save(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  }

  async function login(email, password) {
    const { data } = await api.post("/api/auth/login", { email, password });
    save(data);
  }

  async function register(name, email, password) {
    const { data } = await api.post("/api/auth/register", { name, email, password });
    save(data);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// A shortcut so pages can write: const { user } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}