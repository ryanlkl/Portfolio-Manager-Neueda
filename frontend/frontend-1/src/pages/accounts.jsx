import React from "react";
import Layout from "../components/Layout";
import { useAuthStore } from '../lib/store';

function Accounts() {
  const user = useAuthStore((state) => state.user);

  return (
    <Layout>
      <div className="container py-4">
        <h1 className="h3 mb-4">User Details</h1>
        {user ? (
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Account Information</h5>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Portfolio ID:</strong> {user.portfolio?.id || user.portfolioId}</p>
              {/* Add more user details as needed */}
            </div>
          </div>
        ) : (
          <p>No user information available.</p>
        )}
      </div>
    </Layout>
  );
}

export default Accounts;