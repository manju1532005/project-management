import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; 
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);

      
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/tasks");
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-accent/30 via-accent2/20 to-surface">
      <div className="w-[90%] max-w-md rounded-xl2 bg-panel/90 p-8 border border-gray-800 shadow-soft">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/40 mb-3">✨</div>
          <h1 className="text-2xl font-bold">IdeaFlow</h1>
          <p className="text-gray-300 text-sm">AI-Powered Collaboration Platform</p>
        </div>

        <div className="space-y-3">
          
          <Input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button className="w-full" onClick={handleLogin}>
            Sign In →
          </Button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        <p className="text-center text-sm text-gray-300 mt-4">
          Don’t have an account?{" "}
          <Link className="text-accent" to="/register">
            Sign up
          </Link>
        </p>

        <div className="grid grid-cols-2 gap-3 mt-6 text-sm">
          <div className="rounded-lg border border-gray-800 bg-card p-3 text-center">🔮 AI Insights</div>
          <div className="rounded-lg border border-gray-800 bg-card p-3 text-center">🤝 Team Sync</div>
        </div>
      </div>
    </div>
  );
}
