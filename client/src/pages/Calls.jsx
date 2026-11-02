import { useAuth } from "../AuthContext";

export default function Calls() {
  const { user, logout } = useAuth();

  return (
    <div className="card">
      <h2>Calls</h2>
      <p>
        Logged in as <b>{user.name}</b> ({user.role})
      </p>
      <p>The call list and upload form will appear here in Round 3.</p>
      <button onClick={logout}>Log out</button>
    </div>
  );
}