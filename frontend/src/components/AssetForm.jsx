import React, { useState } from "react";
import axios from "axios";
import { useAuthStore } from "../lib/store";
import { useNavigate } from "react-router-dom";

function getTheme() {
  if (typeof window !== "undefined") {
    return document.documentElement.getAttribute("data-bs-theme") || localStorage.getItem("theme") || "dark";
  }
  return "dark";
}

function AssetForm({ show, onClose, onSave, initial = {} }) {
  if (!show) return null;
  const user = useAuthStore((state) => state.user);
  const portfolioId = user?.portfolio?.id || user?.portfolioId;
  const navigate = useNavigate();

  const [id, setId] = useState(initial.id || "");
  const [ticker, setTicker] = useState(initial.ticker || "");
  const [quantity, setQuantity] = useState(
    initial.quantity !== undefined ? String(initial.quantity) : ""
  );
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(getTheme());
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const updateTheme = () => setTheme(getTheme());
    window.addEventListener("storage", updateTheme);
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-bs-theme"] });
    return () => {
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

  // Validation helpers
  const isValidTicker = (t) => /^[A-Z0-9]{1,5}$/.test(t);
  const isValidName = (n) => typeof n === "string" && n.trim().length >= 2 && n.trim().length <= 50;
  const isValidQuantity = (q) => {
    const num = Number(q);
    return !isNaN(num) && num > 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!id || !ticker || !quantity) {
      setError("All fields are required.");
      return;
    }
    if (!isValidName(id)) {
      setError("Name must be 2-50 characters.");
      return;
    }
    if (!isValidTicker(ticker)) {
      setError("Ticker must be 1-5 uppercase letters or numbers.");
      return;
    }
    if (!isValidQuantity(quantity)) {
      setError("Quantity must be a positive number.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`http://localhost:3000/portfolio/${portfolioId}/assets/stocks`, {
        name: id,
        ticker: ticker,
        quantity: quantity,
        portfolioId: portfolioId
      });
      onSave?.({
        id,
        ticker,
        quantity: quantity === "" ? "" : parseFloat(quantity),
      });
      onClose();
      window.location.reload(false);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        if (error.response.status === 409) {
          setError("This ticker is already in your portfolio.");
        } else if (error.response.status === 404) {
          setError("Ticker not found. Please check the symbol.");
        } else if (error.response.status === 400) {
          setError(error.response.data.error);
        } else if (error.response.status === 502) {
          setError("Could not reach ticker data provider. Try again later.");
        } else {
          setError(error.response.data.error);
        }
      } else {
        setError("Error adding asset.");
      }
      console.error("Error adding asset: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="asset-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      style={{
        background: isDark ? "rgba(20,20,20,0.85)" : "rgba(0,0,0,0.25)",
        zIndex: 2000,
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div
        className="asset-modal"
        onClick={(e) => e.stopPropagation()}
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
          width: "100%",
          padding: "0",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div
          className="asset-header d-flex align-items-center justify-content-between"
          style={{
            borderBottom: `1px solid ${border}`,
            padding: "20px 24px 12px 24px"
          }}
        >
          <h4 className="mb-0" style={{ color: text, fontWeight: 700 }}>Add Asset</h4>
          <button
            type="button"
            className="asset-close"
            onClick={onClose}
            style={{
              color: text,
              background: "none",
              border: "none",
              fontSize: 28,
              fontWeight: 400,
              lineHeight: 1,
              cursor: "pointer"
            }}
            aria-label="Close"
          >×</button>
        </div>
        <div className="asset-body" style={{ padding: "24px" }}>
          {error && (
            <div className="alert alert-danger py-2" style={{ fontSize: "0.97em" }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="asset-id" className="form-label" style={{ color: text, fontWeight: 500 }}>Name</label>
              <input
                id="asset-id"
                className="form-control"
                type="text"
                placeholder="e.g. Apple Inc."
                value={id}
                onChange={(e) => setId(e.target.value)}
                autoFocus
                style={{
                  background: inputBg,
                  color: text,
                  border: `1px solid ${inputBorder}`,
                  borderRadius: 8,
                  fontWeight: 500
                }}
                maxLength={50}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="asset-ticker" className="form-label" style={{ color: text, fontWeight: 500 }}>Ticker</label>
              <input
                id="asset-ticker"
                className="form-control"
                type="text"
                placeholder="e.g. AAPL"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                style={{
                  background: inputBg,
                  color: text,
                  border: `1px solid ${inputBorder}`,
                  borderRadius: 8,
                  fontWeight: 500,
                  textTransform: "uppercase"
                }}
                maxLength={5}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="asset-quantity" className="form-label" style={{ color: text, fontWeight: 500 }}>Quantity</label>
              <input
                id="asset-quantity"
                className="form-control"
                type="number"
                step="any"
                min="0"
                placeholder="e.g. 10.3"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{
                  background: inputBg,
                  color: text,
                  border: `1px solid ${inputBorder}`,
                  borderRadius: 8,
                  fontWeight: 500
                }}
              />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light"
                onClick={onClose}
                style={{
                  borderRadius: 8,
                  border: `1px solid ${border}`,
                  background: isDark ? "#343a40" : "#f8f9fa",
                  color: text,
                  fontWeight: 500,
                  minWidth: 90
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  borderRadius: 8,
                  fontWeight: 600,
                  background: "#51cf66",
                  border: "none",
                  minWidth: 90
                }}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AssetForm;
