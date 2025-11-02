import React, { useState } from "react";
import API from "../api/api.js";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await API.post("/auth/login", { email, password });
    console.log("Login response:", res.data); // <-- add this

    if (!res.data.token) {
      alert("Login failed: no token received");
      return;
    }

    localStorage.setItem("token", res.data.token);
    console.log("Token saved, navigating to dashboard...");
    navigate("/dashboard");
  } catch (err) {
    console.error("Login error:", err); // <-- log full error
    alert(err.response?.data?.message || "Login failed");
  }
};


  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      <button type="submit">Login</button>
      <p>
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </form>
  );
};

export default Login;
