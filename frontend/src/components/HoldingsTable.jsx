import Table from 'react-bootstrap/Table';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import React from 'react';

function getTheme() {
  if (typeof window !== "undefined") {
    return document.documentElement.getAttribute("data-bs-theme") || localStorage.getItem("theme") || "dark";
  }
  return "dark";
}

function HoldingsTable() {
  const user = useAuthStore((state) => state.user);
  const portfolioId = user?.portfolio?.id || user?.portfolioId || null;
  const [holdings, setHoldings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editError, setEditError] = useState(""); // <-- Add this
  const navigate = useNavigate();
  const [theme, setTheme] = useState(getTheme());

  useEffect(() => {
    if (!portfolioId) {
      setHoldings([]);
      return;
    }
    const fetchHoldings = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/portfolio/${portfolioId}/`);
        setHoldings(response.data.stocks || []);
      } catch (error) {
        setHoldings([]);
        console.error("Error fetching holdings:", error);
      }
    };
    fetchHoldings();
  }, [portfolioId]);

  useEffect(() => {
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

  // Match Portfolio page card background and border
  const cardBg = isDark ? "#181b20" : "#fff";
  const border = isDark ? "#23272b" : "#dee2e6";
  const text = isDark ? "#fff" : "#23272b";
  const accent = "#51cf66";
  const gainBg = isDark ? "#2d6a4f" : "#d1fae5";
  const lossBg = isDark ? "#7c2d12" : "#fee2e2";

  const handleRowClick = (ticker, stockId) => {
    navigate(`/performance?ticker=${ticker}&portfolioId=${portfolioId}&stockId=${stockId}`);
  };

  const handleEditClick = (holding) => {
    setEditingId(holding.id);
    setEditQuantity(holding.quantity);
    setEditError("");
  };

  const handleEditChange = (e) => {
    setEditQuantity(e.target.value);
  };

  const handleEditSave = async (stockId) => {
    setEditError(""); // Clear previous error
    // Validate on frontend
    if (isNaN(Number(editQuantity)) || Number(editQuantity) <= 0) {
      setEditError("Quantity must be a positive number.");
      return;
    }
    try {
      await axios.patch(
        `http://localhost:3000/portfolio/${portfolioId}/assets/stocks/${stockId}`,
        { quantity: Number(editQuantity) }
      );
      setHoldings(holdings.map(h =>
        h.id === stockId ? { ...h, quantity: Number(editQuantity) } : h
      ));
      setEditingId(null);
      setEditError("");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setEditError(error.response.data.error);
      } else {
        setEditError("Error updating stock.");
      }
      // Don't exit edit mode if error
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  const handleSellAll = async (stockId) => {
    try {
      await axios.delete(
        `http://localhost:3000/portfolio/${portfolioId}/assets/stocks/${stockId}`
      );
      setHoldings(holdings.filter(h => h.id !== stockId));
    } catch (error) {
      console.error("Error selling all shares:", error);
    }
  };

  // Adjusted column widths
  const nameColWidth = 110;
  const tickerColWidth = 80;
  const volumeColWidth = 120;
  const editColWidth = 150; // wider edit column

  // Table cell style for light/dark mode
  const cellStyle = {
    background: cardBg,
    color: text,
    borderColor: border,
    transition: "background 0.2s, color 0.2s"
  };

  return (
    <div
      className="holdings-table-container"
      style={{
        background: cardBg,
        borderRadius: 16,
        padding: 24,
        boxShadow: isDark
          ? "0 2px 8px rgba(0,0,0,0.15)"
          : "0 2px 8px rgba(0,0,0,0.06)",
        border: `1px solid ${border}`,
        transition: "background 0.2s, color 0.2s"
      }}
    >
      <h4 style={{ color: text, marginBottom: 20 }}>Portfolio Holdings</h4>
      <Table
        striped
        bordered
        hover
        style={{
          borderRadius: 8,
          overflow: "hidden",
          background: cardBg,
          color: text,
          border: `1px solid ${border}`,
          transition: "background 0.2s, color 0.2s"
        }}
      >
        <thead>
          <tr>
            <th style={{ ...cellStyle, width: tickerColWidth, minWidth: tickerColWidth, maxWidth: tickerColWidth }}>Ticker</th>
            <th style={{ ...cellStyle, width: volumeColWidth, minWidth: volumeColWidth, maxWidth: volumeColWidth }}>Volume</th>
            <th style={cellStyle}>Total Value</th>
            <th style={cellStyle}>Gain/Loss</th>
            <th style={{ ...cellStyle, width: editColWidth, minWidth: editColWidth, maxWidth: editColWidth, textAlign: "center" }}>Edit</th>
            <th style={cellStyle}>Sell All</th>
          </tr>
        </thead>
        <tbody>
          {holdings.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ ...cellStyle, textAlign: "center", color: "#adb5bd" }}>
                No holdings found.
              </td>
            </tr>
          ) : (
            holdings.map((holding) => (
              <tr
                key={holding.id}
                style={{ cursor: 'pointer', ...cellStyle }}
                onClick={() => handleRowClick(holding.ticker, holding.id)}
              >
                <td style={{ ...cellStyle, color: accent, fontWeight: 600, fontSize: "0.98em" }}>{holding.ticker}</td>
                <td style={{ ...cellStyle, width: volumeColWidth, minWidth: volumeColWidth, maxWidth: volumeColWidth }}>
                  {editingId === holding.id ? (
                    <>
                      <input
                        type="number"
                        value={editQuantity}
                        min={0}
                        onChange={handleEditChange}
                        style={{ width: 70, borderRadius: 6, padding: "2px 6px" }}
                        onClick={e => e.stopPropagation()}
                      />
                      {editError && (
                        <div style={{ color: "#ff6b6b", fontSize: "0.93em", marginTop: 2 }}>
                          {editError}
                        </div>
                      )}
                    </>
                  ) : (
                    holding.quantity
                  )}
                </td>
                <td style={cellStyle}>${Number(holding.totalValue).toFixed(2)}</td>
                <td style={cellStyle}>
                  <span
                    style={{
                      display: "inline-block",
                      minWidth: 60,
                      padding: "2px 10px",
                      borderRadius: 16,
                      background: holding.avgPctChange >= 0 ? gainBg : lossBg,
                      color: isDark ? "#fff" : "#23272b",
                      fontWeight: 500,
                      textAlign: "center",
                      fontSize: "0.95em"
                    }}
                  >
                    {holding.avgPctChange >= 0 ? "+" : ""}
                    {Number(holding.avgPctChange).toFixed(2)}%
                  </span>
                </td>
                <td
                  style={{
                    ...cellStyle,
                    width: editColWidth,
                    minWidth: editColWidth,
                    maxWidth: editColWidth,
                    textAlign: "center",
                    verticalAlign: "middle"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "center", gap: 4, minHeight: 32 }}>
                    {editingId === holding.id ? (
                      <>
                        <button
                          className="btn btn-success btn-sm"
                          style={{ borderRadius: 16, fontWeight: 500, marginRight: 2, minWidth: 48 }}
                          onClick={e => {
                            e.stopPropagation();
                            handleEditSave(holding.id);
                          }}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ borderRadius: 16, fontWeight: 500, minWidth: 48 }}
                          onClick={e => {
                            e.stopPropagation();
                            handleEditCancel();
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-outline-info btn-sm"
                        style={{ borderRadius: 16, fontWeight: 500, minWidth: 100 }}
                        onClick={e => {
                          e.stopPropagation();
                          handleEditClick(holding);
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </td>
                <td style={cellStyle}>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    style={{ borderRadius: 16, fontWeight: 500 }}
                    onClick={e => {
                      e.stopPropagation();
                      handleSellAll(holding.id);
                    }}
                  >
                    Sell All
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}

export default HoldingsTable;