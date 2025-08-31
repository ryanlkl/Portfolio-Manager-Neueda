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

function TransactionsPage() {
  const user = useAuthStore((state) => state.user);
  const portfolioId = user?.portfolio?.id || user?.portfolioId;
  const [transactions, setTransactions] = useState([]);
  const [theme, setTheme] = useState(getTheme());

  useEffect(() => {
    if (!portfolioId) return;
    const fetchAllTransactions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/portfolio/${portfolioId}/transactions/`
        );
        let txs = response.data.transactions || response.data || [];
        // Sort by date descending (most recent first)
        txs = txs.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
  const bg = isDark ? "#23272b" : "#f8f9fa";
  const cardBg = isDark ? "#181b20" : "#fff";
  const border = isDark ? "#343a40" : "#dee2e6";
  const text = isDark ? "#f8f9fa" : "#23272b";
  const accent = "#51cf66";
  const loss = "#ff6b6b";
  const subText = isDark ? "#adb5bd" : "#495057";

  return (
    <Layout>
      <div className="container mt-4">
        <h3 className="mb-4" style={{ fontWeight: 700, color: text }}>All Transactions</h3>
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
                boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
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
              <div style={{ marginTop: 6, display: "flex", gap: 24, flexWrap: "wrap" }}>
                <span><strong>Ticker:</strong> {tx.ticker}</span>
                <span><strong>Qty:</strong> {format2dp(tx.quantity)}</span>
                <span><strong>Purchase Price:</strong> ${format2dp(tx.purchasePrice)}</span>
                <span><strong>Total Price:</strong> ${format2dp(tx.quantity * tx.purchasePrice)}</span>
                <span style={{ fontSize: "0.85em", color: subText }}>
                  <strong>ID:</strong> {tx.id}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}

export default TransactionsPage;