import { useAuthStore } from "../lib/store";
import { useEffect } from 'react'

function format2dp(num) {
  return Number(num).toFixed(2);
}

function getTheme() {
  if (typeof window !== "undefined") {
    return document.documentElement.getAttribute("data-bs-theme") || localStorage.getItem("theme") || "dark";
  }
  return "dark";
}

function AccountSummary({ portfolio }) {
  const user = useAuthStore(state => state.user);
  const theme = getTheme();
  const isDark = theme === "dark";

  // Light mode colors
  const bg = isDark ? "#181b20" : "#fff";
  const cardBg = isDark ? "#23272b" : "#f8f9fa";
  const border = isDark ? "#23272b" : "#dee2e6";
  const text = isDark ? "#fff" : "#23272b";
  const subText = isDark ? "#adb5bd" : "#495057";
  const accent = isDark ? "#51cf66" : "#198754";
  const gainBg = isDark ? "#2d6a4f" : "#d1fae5";
  const lossBg = isDark ? "#7c2d12" : "#fee2e2";

  useEffect(() => {
    console.log("Portfolio: ", portfolio)
  }, [])

  return (
    <div
      className="account-summary"
      style={{
        position: "sticky",
        background: bg,
        borderRadius: 16,
        padding: "28px 20px 20px 20px",
        color: text,
        boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
        border: `1px solid ${border}`,
        minHeight: 420,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start"
      }}
    >
      <div className="header mb-4">
        <h5 style={{ fontWeight: 700, marginBottom: 4 }}>
          Welcome Back, <span style={{ color: accent }}>{user?.name || "User"}</span>!
        </h5>
        <span
          style={{
            fontSize: "0.95em",
            color: subText,
            fontWeight: 500
          }}
        >
          {user?.email}
        </span>
      </div>
      <div
        className="balance mb-4"
        style={{
          background: cardBg,
          borderRadius: 12,
          padding: "18px 16px",
          marginBottom: 18,
          boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
          textAlign: "center"
        }}
      >
        <p style={{ marginBottom: 4, color: subText, fontWeight: 500, fontSize: "1em" }}>
          Portfolio Value
        </p>
        <h3 style={{ fontWeight: 700, color: accent, margin: 0 }}>
          ${format2dp(portfolio.totalValue || 0)}
        </h3>
      </div>
      <div className="list mt-3">
        <p style={{ color: text, fontWeight: 600, marginBottom: 12 }}>Stocks</p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {portfolio.stocks && portfolio.stocks.length > 0 ? (
            portfolio.stocks.map((stock) => (
              <li key={stock.id} style={{ marginBottom: 14 }}>
                <div
                  style={{
                    background: cardBg,
                    borderRadius: 8,
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.06)"
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, color: accent, fontSize: "1em", letterSpacing: 1 }}>
                      {stock.ticker}
                    </span>
                    <span
                      style={{
                        fontSize: "0.92em",
                        color: subText,
                        marginLeft: 12,
                        fontWeight: 500
                      }}
                    >
                      ${format2dp(stock.totalValue)}
                    </span>
                  </div>
                  <span
                    style={{
                      display: "inline-block",
                      minWidth: 56,
                      padding: "2px 12px",
                      borderRadius: 16,
                      background: stock.avgPctChange >= 0 ? gainBg : lossBg,
                      color: isDark ? "#fff" : "#23272b",
                      fontWeight: 500,
                      textAlign: "center",
                      fontSize: "0.85em"
                    }}
                  >
                    {stock.avgPctChange >= 0 ? "+" : ""}
                    {Number(stock.avgPctChange).toFixed(2)}%
                  </span>
                </div>
              </li>
            ))
          ) : (
            <li style={{ color: subText, textAlign: "center", padding: 12 }}>
              No stocks in portfolio.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default AccountSummary;