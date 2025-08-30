import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TermsModal from "../components/terms";
import "../css/Signup.css";
import "../css/term.css";
import axios from "axios";

function Signup() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    document.body.classList.add("no-sidebar-pad");
    return () => document.body.classList.remove("no-sidebar-pad");
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) return;
    try {
      const response = await axios.post("http://localhost:3000/auth/register", formData, {
        withCredentials: true,
      });
      console.log(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="signup-container">
      {/* Left Section */}
      <div className="signup-left d-flex justify-content-center align-items-center text-center">
        <h1 className="app-title">PortManager</h1>
      </div>

      {/* Right Section */}
      <div className="signup-right d-flex justify-content-center align-items-center">
        <div className="card p-4 signup-card">
          <h3 className="text-center mb-1">Sign Up</h3>

          <p className="auth-helper mb-4">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">Log in</Link>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="name">Name</label>
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
              />
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="email">Email</label>
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
              />
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="password">Password</label>
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
              <label className="form-check-label" htmlFor="acceptTerms">
                I have read the{" "}
                <button
                  type="button"
                  className="auth-link auth-link-btn"
                  onClick={() => setShowTerms(true)}
                >
                  Terms and Conditions
                </button>
              </label>
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={!acceptedTerms}>
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
