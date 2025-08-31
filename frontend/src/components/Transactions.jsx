import axios from 'axios';
import { useEffect, useState } from 'react';

function Transactions({ portfolioId, stockId }) {
  const [transactions, setTransactions] = useState([]);
  const [theme, setTheme] = useState(getTheme());
  const isDark = theme === "dark";

  useEffect(() => {
    const fetchTransactionsByStock = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/portfolio/${portfolioId}/transactions/stock/${stockId}`
        );
        // Sort transactions by date (most recent first)
        const sorted = (response.data || []).slice().sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setTransactions(sorted);
      } catch (error) {
        console.error("Error fetching transactions: ", error);
      }
    };
    fetchTransactionsByStock();
  }, [stockId, portfolioId]);

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

  const bg = isDark ? "#23272b" : "#f8f9fa";
  const cardBg = isDark ? "#181b20" : "#fff";
  const border = isDark ? "#343a40" : "#dee2e6";
  const text = isDark ? "#f8f9fa" : "#23272b";
  const accent = "#51cf66";
  const loss = "#ff6b6b";
  const subText = isDark ? "#adb5bd" : "#495057";

  return (
    <div>
      <h5 className="mb-3" style={{ fontWeight: 600, color: text }}>Transactions</h5>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {transactions.length === 0 && <li style={{ color: subText }}>No transactions found.</li>}
        {transactions.map((tx) => (
          <li
            key={tx.id}
            style={{
              border: `1px solid ${border}`,
              borderRadius: 6,
              marginBottom: 10,
              padding: "10px 16px",
              background: bg,
              boxShadow: isDark
                ? "0 1px 2px rgba(0,0,0,0.15)"
                : "0 1px 2px rgba(0,0,0,0.06)",
              color: text
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{
                fontWeight: 600,
                color: tx.type === "buy" ? accent : loss,
                textTransform: "capitalize"
              }}>
                {tx.type}
              </span>
              <span style={{
                fontSize: "0.9em",
                color: subText
              }}>
                {new Date(tx.createdAt).toLocaleString()}
              </span>
            </div>
            <div style={{ marginTop: 6, display: "flex", gap: 24 }}>
              <span><strong>Qty:</strong> {tx.quantity}</span>
              <span><strong>Price:</strong> ${tx.purchasePrice}</span>
              <span style={{ fontSize: "0.85em", color: subText }}>
                <strong>ID:</strong> {tx.id}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function getTheme() {
  if (typeof window !== "undefined") {
    return document.documentElement.getAttribute("data-bs-theme") || localStorage.getItem("theme") || "dark";
  }
  return "dark";
}

export default Transactions;