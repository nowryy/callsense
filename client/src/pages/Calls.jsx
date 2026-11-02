import { useState, useEffect, useCallback } from "react";
import api from "../api";
import { useAuth } from "../AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Calls() {
  const { user, logout } = useAuth();
  const [calls, setCalls] = useState([]);
  const [agentName, setAgentName] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  // Ask the server for the list of calls
  const loadCalls = useCallback(async () => {
    try {
      const { data } = await api.get("/api/calls");
      setCalls(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load calls");
    }
  }, []);

  // Load once when the page opens, then again every 5 seconds
  useEffect(() => {
    loadCalls();
    const timer = setInterval(loadCalls, 5000);
    return () => clearInterval(timer); // stop the timer when leaving the page
  }, [loadCalls]);

  // Send the audio file and agent name to the server
  async function handleUpload(e) {
    e.preventDefault();
    setError("");
    if (!file) return setError("Please choose an audio file");

    const form = new FormData();
    form.append("agentName", agentName);
    form.append("audio", file); // the name "audio" must match the server

    try {
      setUploading(true);
      await api.post("/api/calls", form);
      setAgentName("");
      setFile(null);
      e.target.reset(); // clears the file box
      loadCalls();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="card wide">
      <div className="topbar">
        <h2>CallSense</h2>
        <div>
          {user.name} ({user.role}){" "}
          <button className="small" onClick={logout}>Log out</button>
        </div>
      </div>

      <h3>Upload a call</h3>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleUpload}>
        <input
          placeholder="Agent name (for example Ravi)"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          required
        />
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload call"}
        </button>
      </form>

      <h3>All calls</h3>
      {calls.length === 0 ? (
        <p>No calls yet. Upload your first one above.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Agent</th>
              <th>File</th>
              <th>Status</th>
              <th>Uploaded</th>
              <th>Audio</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((c) => (
              <tr key={c._id}>
                <td>{c.agentName}</td>
                <td>{c.originalName}</td>
                <td><span className={`badge ${c.status}`}>{c.status}</span></td>
                <td>{new Date(c.createdAt).toLocaleString()}</td>
                <td><audio controls src={API_URL + c.audioUrl} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}