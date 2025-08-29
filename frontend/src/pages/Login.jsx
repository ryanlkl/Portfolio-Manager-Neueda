import React, { useState } from "react";
import { Link } from "react-router-dom"; 
import "../css/Login.css";
import axios from "axios";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Login data:", formData);

    try {
      const response = await axios.post("http://localhost:3000/auth/login", formData);
      const data = response.data
      console.log(data)
    } catch (err) {
      console.error(err)
    }
  };

  return (
    <div className="login-container">
      {/* Left Section */}
      <div className="login-left d-flex justify-content-center align-items-center text-center">
        <h1 className="app-title">PortManager</h1>
      </div>

      {/* Right Section */}
      <div className="login-right d-flex justify-content-center align-items-center">
        <div className="card p-4 login-card">
          <h3 className="text-center mb-1">Log In</h3>

          <p className="text-muted mb-4" style={{ fontSize: "0.95rem" }}>
            Need to make a new account?{" "}
            <Link to="/signup" className="text-decoration-none" style={{ color: "#6d28d9" }}>
              Sign up
            </Link>
          </p>

          <form onSubmit={handleSubmit}>
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

            <div className="mb-4">
              <label className="form-label" htmlFor="password">Password</label>
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
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Log In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
