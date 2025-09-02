
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../lib/store';
import Layout from '../components/Layout';

function format2dp(num) {
  return Number(num).toFixed(2);
}

function getTheme() {
  if (typeof window !== "undefined") {
    return document.documentElement.getAttribute("data-bs-theme") || localStorage.getItem("theme") || "dark";
  }
  return "dark";
}

const typeOptions = ["buy", "sell"];

function TransactionsPage() {
  const user = useAuthStore((state) => state.user);
  const portfolioId = user?.portfolio?.id || user?.portfolioId;
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editType, setEditType] = useState("");
  const [editError, setEditError] = useState("");
  const [theme, setTheme] = useState(getTheme());
  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  useEffect(() => {
    if (!portfolioId) return;
    const fetchAllTransactions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/portfolio/${portfolioId}/transactions/`
        );
        let txs = response.data.transactions || response.data || [];
        setTransactions(txs);
      } catch (error) {
        console.error("Error fetching transactions: ", error);
      }
    };
    fetchAllTransactions();
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
  const cardBg = isDark ? "#181b20" : "#fff";
  const border = isDark ? "#23272b" : "#dee2e6";
  const text = isDark ? "#fff" : "#23272b";
  const accent = "#51cf66";
  const loss = "#ff6b6b";
  const subText = isDark ? "#adb5bd" : "#495057";

  // Table cell style for light/dark mode
  const cellStyle = {
    background: cardBg,
    color: text,
    borderColor: border,
    transition: "background 0.2s, color 0.2s"
  };

  // Sorting logic
  const sortedTransactions = [...transactions].sort((a, b) => {
    const { key, direction } = sortConfig;
    let aValue = a[key];
    let bValue = b[key];
    // For numbers
    if (["quantity", "purchasePrice"].includes(key)) {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }
    // For total price
    if (key === "totalPrice") {
      aValue = Number(a.quantity) * Number(a.purchasePrice);
      bValue = Number(b.quantity) * Number(b.purchasePrice);
    }
    // For date
    if (key === "date") {
      aValue = new Date(a.date);
      bValue = new Date(b.date);
    }
    // For type/ticker (string)
    if (["type", "ticker"].includes(key)) {
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
    }
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // Toggle direction
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleEditClick = (tx) => {
    setEditingId(tx.id);
    setEditQuantity(tx.quantity);
    setEditType(tx.type);
    setEditError("");
  };

  const handleEditChange = (e) => {
    setEditQuantity(e.target.value);
  };

  const handleTypeChange = (e) => {
    setEditType(e.target.value);
  };

  const handleEditSave = async (txId) => {
    setEditError("");
    if (isNaN(Number(editQuantity)) || Number(editQuantity) <= 0) {
      setEditError("Quantity must be a positive number.");
      return;
    }


    if (!typeOptions.includes(editType)) {
      setEditError("Invalid transaction type.");
      return;
    }


    // Allow type change: do not block in UI, let backend validate. Only check for valid type and quantity here.
    const txToEdit = transactions.find(tx => tx.id === txId);
    if (!txToEdit) {
      setEditError("Transaction not found.");
      return;
    }

    try {
      await axios.patch(
        `http://localhost:3000/portfolio/${portfolioId}/transactions/${txId}`,
        { quantity: Number(editQuantity), type: editType }
      );
      setTransactions(transactions.map(tx =>
        tx.id === txId ? { ...tx, quantity: Number(editQuantity), type: editType } : tx
      ));
      setEditingId(null);
      setEditError("");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setEditError(error.response.data.error);
      } else {
        setEditError("Error updating transaction.");
      }
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditError("");
  };

  // Adjusted column widths
  const typeColWidth = 90;
  const tickerColWidth = 80;
  const qtyColWidth = 120;
  const priceColWidth = 120;
  const editColWidth = 150;

  return (
    <Layout>
      <div className="container mt-4">
        <h3 className="mb-4" style={{ fontWeight: 700, color: text }}>All Transactions</h3>
        <div
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
          <table
            className="table table-striped table-bordered table-hover"
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
                <th style={{ ...cellStyle, width: typeColWidth, cursor: 'pointer' }} onClick={() => handleSort('type')}>
                  Type
                  <span style={{ marginLeft: 4, fontSize: 13 }}>
                    <span style={{ color: sortConfig.key === 'type' && sortConfig.direction === 'asc' ? accent : subText }}>▲</span>
                    <span style={{ color: sortConfig.key === 'type' && sortConfig.direction === 'desc' ? accent : subText, marginLeft: 2 }}>▼</span>
                  </span>
                </th>
                <th style={{ ...cellStyle, width: tickerColWidth, cursor: 'pointer' }} onClick={() => handleSort('ticker')}>
                  Ticker
                  <span style={{ marginLeft: 4, fontSize: 13 }}>
                    <span style={{ color: sortConfig.key === 'ticker' && sortConfig.direction === 'asc' ? accent : subText }}>▲</span>
                    <span style={{ color: sortConfig.key === 'ticker' && sortConfig.direction === 'desc' ? accent : subText, marginLeft: 2 }}>▼</span>
                  </span>
                </th>
                <th style={{ ...cellStyle, width: qtyColWidth, cursor: 'pointer' }} onClick={() => handleSort('quantity')}>
                  Quantity
                  <span style={{ marginLeft: 4, fontSize: 13 }}>
                    <span style={{ color: sortConfig.key === 'quantity' && sortConfig.direction === 'asc' ? accent : subText }}>▲</span>
                    <span style={{ color: sortConfig.key === 'quantity' && sortConfig.direction === 'desc' ? accent : subText, marginLeft: 2 }}>▼</span>
                  </span>
                </th>
                {/* <th style={{ ...cellStyle, width: priceColWidth, cursor: 'pointer' }} onClick={() => handleSort('purchasePrice')}>
                  Purchase Price {sortConfig.key === 'purchasePrice' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th> */}
                <th style={{ ...cellStyle, cursor: 'pointer' }} onClick={() => handleSort('totalPrice')}>
                  Total Price
                  <span style={{ marginLeft: 4, fontSize: 13 }}>
                    <span style={{ color: sortConfig.key === 'totalPrice' && sortConfig.direction === 'asc' ? accent : subText }}>▲</span>
                    <span style={{ color: sortConfig.key === 'totalPrice' && sortConfig.direction === 'desc' ? accent : subText, marginLeft: 2 }}>▼</span>
                  </span>
                </th>
                <th style={{ ...cellStyle, cursor: 'pointer' }} onClick={() => handleSort('date')}>
                  Date
                  <span style={{ marginLeft: 4, fontSize: 13 }}>
                    <span style={{ color: sortConfig.key === 'date' && sortConfig.direction === 'asc' ? accent : subText }}>▲</span>
                    <span style={{ color: sortConfig.key === 'date' && sortConfig.direction === 'desc' ? accent : subText, marginLeft: 2 }}>▼</span>
                  </span>
                </th>
                {/* <th style={{ ...cellStyle, width: editColWidth, textAlign: "center" }}>Edit</th> */}
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ ...cellStyle, textAlign: "center", color: subText }}>
                    No transactions found.
                  </td>
                </tr>
              ) : (
                sortedTransactions.map((tx) => (
                  <tr key={tx.id} style={cellStyle}>
                    <td style={{ ...cellStyle, color: tx.type === "buy" ? accent : loss, fontWeight: 600, textTransform: "capitalize" }}>
                      {editingId === tx.id ? (
                        <select value={editType} onChange={handleTypeChange} style={{ borderRadius: 6, padding: "2px 6px" }}>
                          {typeOptions.map(opt => (
                            <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                          ))}
                        </select>
                      ) : (
                        tx.type
                      )}
                    </td>
                    <td style={cellStyle}>{tx.ticker}</td>
                    <td style={cellStyle}>
                      {editingId === tx.id ? (
                        <>
                          <input
                            type="number"
                            value={editQuantity}
                            min={0}
                            onChange={handleEditChange}
                            style={{ width: 70, borderRadius: 6, padding: "2px 6px" }}
                          />
                          {editError && (
                            <div style={{ color: "#ff6b6b", fontSize: "0.93em", marginTop: 2 }}>
                              {editError}
                            </div>
                          )}
                        </>
                      ) : (
                        format2dp(tx.quantity)
                      )}
                    </td>
                    {/* <td style={cellStyle}>${format2dp(tx.purchasePrice)}</td> */}
                    <td style={cellStyle}>${format2dp(tx.quantity * tx.purchasePrice)}</td>
                    <td style={cellStyle}>{new Date(tx.date).toLocaleString()}</td>
                    {/* <td style={{ ...cellStyle, textAlign: "center", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", justifyContent: "center", gap: 4, minHeight: 32 }}>
                        {editingId === tx.id ? (
                          <>
                            <button
                              className="btn btn-success btn-sm"
                              style={{ borderRadius: 16, fontWeight: 500, marginRight: 2, minWidth: 48 }}
                              onClick={() => handleEditSave(tx.id)}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ borderRadius: 16, fontWeight: 500, minWidth: 48 }}
                              onClick={handleEditCancel}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn btn-outline-info btn-sm"
                            style={{ borderRadius: 16, fontWeight: 500, minWidth: 100 }}
                            onClick={() => handleEditClick(tx)}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

export default TransactionsPage;