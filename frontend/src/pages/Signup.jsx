import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TermsModal from "../components/terms";
import "../css/Signup.css";
import "../css/term.css";
import axios from "axios";
import { useAuthStore } from "../lib/store";
import { useNavigate } from "react-router-dom";

function getTheme() {
  if (typeof window !== "undefined") {
    return document.documentElement.getAttribute("data-bs-theme") || localStorage.getItem("theme") || "dark";
  }
  return "dark";
}

function Signup() {
  const setUser = useAuthStore((state) => state.setUser);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [reenterPassword, setReenterPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
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

  const validatePassword = (password) => {
    // Minimum 8 characters, at least one uppercase, one lowercase, one number, one special character
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/.test(password);
  };

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

  const handleReenterChange = (e) => {
    setReenterPassword(e.target.value);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) return;

    if (formData.password !== reenterPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!validatePassword(formData.password)) {
      setError("Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/auth/register", formData, {
        withCredentials: true,
      });
      const { user } = response.data;
      setUser(user);
      navigate("/portfolio");
    } catch (err) {
      // Handle backend errors
      if (err.response) {
        if (err.response.status === 400) {
          setError(err.response.data.error || "All fields are required.");
        } else if (err.response.status === 409) {
          setError("Email already in use.");
        } else if (err.response.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError("Registration failed. Please try again.");
        }
      } else {
        setError("Network error. Please check your connection.");
      }
    }
  };

  return (
    <div className="signup-container" style={{ background: isDark ? "#181b20" : "#f8f9fa" }}>
      {/* Left Section */}
      <div className="signup-left d-flex justify-content-center align-items-center text-center">
        <h1 className="app-title" style={{ color: "#51cf66" }}>PortManager</h1>
      </div>

      {/* Right Section */}
      <div className="signup-right d-flex justify-content-center align-items-center">
        <div className="card p-4 signup-card"
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
          <h3 className="text-center mb-1" style={{ color: text }}>Sign Up</h3>

          <p className="auth-helper mb-4" style={{ color: isDark ? "#adb5bd" : "#495057" }}>
            Already have an account?{" "}
            <Link to="/login" className="auth-link" style={{ color: "#36A2EB" }}>Log in</Link>
          </p>

          {error && (
            <div className="alert alert-danger py-2" style={{ fontSize: "0.97em" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="name" style={{ color: text }}>Name</label>
              <input
                id="name"
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                autoComplete="name"
                required
                style={{
                  background: inputBg,
                  color: text,
                  border: `1px solid ${inputBorder}`,
                }}
              />
            </div>

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

            <div className="mb-3">
              <label className="form-label" htmlFor="password" style={{ color: text }}>Password</label>
              <input
                id="password"
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="new-password"
                required
                style={{
                  background: inputBg,
                  color: text,
                  border: `1px solid ${inputBorder}`,
                }}
              />
              <small className="text-muted">
                Minimum 8 characters, at least one uppercase, one lowercase, one number, and one special character.
              </small>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="reenterPassword" style={{ color: text }}>Re-enter Password</label>
              <input
                id="reenterPassword"
                type="password"
                name="reenterPassword"
                className="form-control"
                value={reenterPassword}
                onChange={handleReenterChange}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                required
                style={{
                  background: inputBg,
                  color: text,
                  border: `1px solid ${inputBorder}`,
                }}
              />
            </div>

            <div className="form-check mb-4">
              <input
                id="acceptTerms"
                className="form-check-input"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                required
              />
              <label className="form-check-label" htmlFor="acceptTerms" style={{ color: text }}>
                I have read the{" "}
                <button
                  type="button"
                  className="auth-link auth-link-btn"
                  onClick={() => setShowTerms(true)}
                  style={{ color: "#36A2EB", background: "none", border: "none", padding: 0 }}
                >
                  Terms and Conditions
                </button>
              </label>
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={!acceptedTerms} style={{
              borderRadius: 8,
              fontWeight: 600,
              background: "#51cf66",
              border: "none"
            }}>
              Create Account
            </button>
          </form>
        </div>
      </div>

      {showTerms && (
        <TermsModal
          onClose={() => setShowTerms(false)}
          onAgree={() => {
            setAcceptedTerms(true);
            setShowTerms(false);
          }}
        />
      )}
    </div>
  );
}

export default Signup;
