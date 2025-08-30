import React from 'react'

function StockDistribution({ stocks }) {
  const totalQuantity = stocks.reduce((sum, stock) => sum + stock.quantity, 0);

  return (
    <div className="list-container">
      <div className="list-group">
        {stocks.map((stock) => {
          const percent = totalQuantity > 0 ? (stock.quantity / totalQuantity) * 100 : 0;
          return (
            <div className="list-group-item" key={stock.id} style={{ display: "flex", alignItems: "center" }}>
              <span style={{ width: 100 }}>{stock.ticker}:</span>
              <div
                style={{
                  background: "#e0e0e0",
                  minWidth: 200,
                  maxWidth: "100%",
                  height: 20,
                  borderRadius: 4,
                  margin: "0 10px",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    background: "#36A2EB",
                    width: `${percent}%`,
                    height: "100%",
                    borderRadius: 4,
                    transition: "width 0.3s"
                  }}
                ></div>
              </div>
              <div className="values">
                <span>{((stock.quantity / totalQuantity).toFixed(2)) * 100}%</span><br />
                <span>${stock.totalValue.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}

export default StockDistribution