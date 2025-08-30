import React, { useState } from "react";
import "../css/form.css"; 
import axios from "axios";
import { useAuthStore } from "../lib/store";

function AssetForm({ show, onClose, onSave, initial = {} }) {

  if (!show) return null;
  const user = useAuthStore((state) => state.user);
  const portfolioId = user.portfolio.id

  const [id, setId] = useState(initial.id || "");
  const [ticker, setTicker] = useState(initial.ticker || "");
  const [quantity, setQuantity] = useState(
    initial.quantity !== undefined ? String(initial.quantity) : ""
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.({
      id,
      ticker,
      quantity: quantity === "" ? "" : parseFloat(quantity),
    });

    if (!id || !ticker || !quantity) {
      console.log("Invalid input");
      return;
    }
    try {
        const response = axios.post(`http://localhost:3000/portfolio/${portfolioId}/assets/stocks`, {
          name: id,
          ticker: ticker,
          quantity: quantity,
          portfolioId: portfolioId
        })

        console.log(response.data)
    } catch (error) {
      console.error("Error adding asset: ", error)
    }

  };

  return (
    <div className="asset-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="asset-modal" onClick={(e) => e.stopPropagation()}>
        <div className="asset-header">
          <h4 className="mb-0">Add Asset</h4>
          <button type="button" className="asset-close" onClick={onClose}>×</button>
        </div>

        <div className="asset-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="asset-id" className="form-label">Name</label>
              <input
                id="asset-id"
                className="form-control"
                type="text"
                placeholder="e.g. 123456-abcdef"
                value={id}
                onChange={(e) => setId(e.target.value)}
                autoFocus
              />
            </div>

            <div className="mb-3">
              <label htmlFor="asset-ticker" className="form-label">Ticker</label>
              <input
                id="asset-ticker"
                className="form-control"
                type="text"
                placeholder="e.g. AAPL"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="asset-quantity" className="form-label">Quantity</label>
              <input
                id="asset-quantity"
                className="form-control"
                type="number"
                step="any"
                placeholder="e.g. 10.3"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="asset-footer" style={{ borderTop: "none", padding: 0 }}>
              <button type="button" className="btn btn-light me-2" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="asset-action">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AssetForm;
