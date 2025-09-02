import React from 'react'

function getTheme() {
  if (typeof window !== "undefined") {
    return document.documentElement.getAttribute("data-bs-theme") || localStorage.getItem("theme") || "dark";
  }
  return "dark";
}

function StockDistribution({ stocks }) {
  const totalQuantity = stocks.reduce((sum, stock) => sum + stock.quantity, 0);
  const theme = getTheme();
  const isDark = theme === "dark";

  const bg = isDark ? "#181b20" : "#fff";
  const barBg = isDark ? "#23272b" : "#f1f3f5";
  const text = isDark ? "#fff" : "#23272b";
  const percentText = isDark ? "#fff" : "#23272b";
  const subText = isDark ? "#adb5bd" : "#495057";
  const tickerColor = isDark ? "#51cf66" : "#198754";

  return (
    <div className="list-container" style={{ padding: 8 }}>
      <div className="list-group" style={{ background: bg, borderRadius: 12, padding: 12 }}>
        {stocks.length === 0 && (
          <div style={{ color: subText, textAlign: "center", padding: 16 }}>No stocks in portfolio.</div>
        )}
        {stocks.map((stock) => {
          const percent = totalQuantity > 0 ? (stock.quantity / totalQuantity) * 100 : 0;
          return (
            <div
              className="list-group-item"
              key={stock.id}
              style={{
                display: "flex",
                alignItems: "center",
                background: "transparent",
                border: "none",
                marginBottom: 12,
                padding: "8px 0"
              }}
            >
              <span
                style={{
                  width: 70,
                  fontWeight: 600,
                  color: tickerColor,
                  fontSize: "1em",
                  letterSpacing: 1
                }}
              >
                {stock.ticker}
              </span>
              <div
                style={{
                  flex: 1,
                  background: barBg,
                  height: 18,
                  borderRadius: 8,
                  margin: "0 12px",
                  position: "relative",
                  overflow: "hidden",
                  minWidth: 120,
                  maxWidth: 300,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.10)"
                }}
              >
                <div
                  style={{
                    background: "linear-gradient(90deg, #36A2EB 60%, #51cf66 100%)",
                    width: `${percent}%`,
                    height: "100%",
                    borderRadius: 8,
                    transition: "width 0.3s"
                  }}
                ></div>
              </div>
              <div
                style={{
                  minWidth: 90,
                  textAlign: "right",
                  color: percentText,
                  fontSize: "0.97em"
                }}
              >
                <span style={{ fontWeight: 500 }}>
                  {percent.toFixed(1)}%
                </span>
                <span style={{ color: subText, marginLeft: 10 }}>
                  ${stock.totalValue.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}

export default StockDistribution