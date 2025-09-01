import React, { useState } from "react";
import Layout from "../components/Layout";
import { useAuthStore } from "../lib/store";
import axios from "axios";

function Account() {
  const user = useAuthStore((state) => state.user);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage("");
    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }
    try {
      await axios.patch(
        `http://localhost:3000/accounts/${user.id}`,
        {
          password: newPassword,
        }
      );
      setMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage("Failed to change password.");
    }
  };

  return (
    <Layout>
      <div className="container py-4">
        <h2 className="mb-4">Account Details</h2>
        {user ? (
          <div
            style={{
              background: "#181b20",
              color: "#fff",
              borderRadius: 12,
              padding: "24px",
              maxWidth: 400,
              boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
            }}
          >
            <p><strong>Name:</strong> {user.name || "N/A"}</p>
            <p><strong>Email:</strong> {user.email || "N/A"}</p>
            <p><strong>Username:</strong> {user.username || "N/A"}</p>
            <hr />
            <h5>Change Password</h5>
            <form onSubmit={handleChangePassword}>
              {<div className="mb-2">
                <label>Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div> }
              <div className="mb-2">
                <label>New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-2">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary mt-2">
                Change Password
              </button>
            </form>
            {message && <div className="mt-2">{message}</div>}
          </div>
        ) : (
          <p>No user details available.</p>
        )}
      </div>
    </Layout>
  );
}

export default Account;