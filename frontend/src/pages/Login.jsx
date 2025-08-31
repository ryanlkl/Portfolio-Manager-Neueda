import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../css/Login.css";
import axios from "axios";
import { useAuthStore } from "../lib/store";
import { useNavigate } from "react-router-dom";

function getTheme() {
  if (typeof window !== "undefined") {
    return document.documentElement.getAttribute("data-bs-theme") || localStorage.getItem("theme") || "dark";
  }
  return "dark";
}

function Login() {
  const setUser = useAuthStore((state) => state.setUser);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(getTheme());
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("no-sidebar-pad");
    const updateTheme = () => setTheme(getTheme());
    window.addEventListener("storage", updateTheme);
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-bs-theme"] });
    return () => {
      document.body.classList.remove("no-sidebar-pad");
      window.removeEventListener("storage", updateTheme);
      observer.disconnect();
    };
  }, []);

  const isDark = theme === "dark";
  const cardBg = isDark ? "#23272b" : "#fff";
  const text = isDark ? "#f8f9fa" : "#23272b";
  const border = isDark ? "#343a40" : "#dee2e6";
  const inputBg = isDark ? "#181b20" : "#fff";
  const inputBorder = isDark ? "#343a40" : "#ced4da";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:3000/auth/login", formData, {
        withCredentials: true
      });
      const { user } = response.data;
      setUser(user);
      navigate("/portfolio");
    } catch (err) {
      if (err.response) {
        if (err.response.status === 400) {
          setError("Please enter both email and password.");
        } else if (err.response.status === 401) {
          setError("Invalid email or password.");
        } else if (err.response.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError("Login failed. Please try again.");
        }
      } else {
        setError("Network error. Please check your connection.");
      }
    }
  };

  return (
    <div className="login-container" style={{ background: isDark ? "#181b20" : "#f8f9fa" }}>
      <div className="login-left d-flex justify-content-center align-items-center text-center">
        <h1 className="app-title" style={{ color: "#51cf66" }}>PortManager</h1>
      </div>
      <div className="login-right d-flex justify-content-center align-items-center">
        <div className="card p-4 login-card"
          style={{
            background: cardBg,
            color: text,
            border: `1.5px solid ${border}`,
            borderRadius: 16,
            boxShadow: isDark
              ? "0 4px 24px rgba(0,0,0,0.45)"
              : "0 4px 24px rgba(0,0,0,0.10)",
            minWidth: 340,
            maxWidth: 400,
          }}>
          <h3 className="text-center mb-1" style={{ color: text }}>Log In</h3>
          <p className="mt-3 mb-4" style={{ fontSize: "0.95rem", color: isDark ? "#adb5bd" : "#495057" }}>
            Need to make a new account?{" "}
            <Link to="/signup" className="text-decoration-none" style={{ color: "#36A2EB" }}>
              Sign up
            </Link>
          </p>
          {error && (
            <div className="alert alert-danger py-2" style={{ fontSize: "0.97em" }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="email" style={{ color: text }}>Email</label>
              <input
                id="email"
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                required
                style={{
                  background: inputBg,
                  color: text,
                  border: `1px solid ${inputBorder}`,
                }}
              />
            </div>
            <div className="mb-4">
              <label className="form-label" htmlFor="password" style={{ color: text }}>Password</label>
              <input
                id="password"
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                style={{
                  background: inputBg,
                  color: text,
                  border: `1px solid ${inputBorder}`,
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary w-100" style={{
              borderRadius: 8,
              fontWeight: 600,
              background: "#51cf66",
              border: "none"
            }}>
              Log In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
