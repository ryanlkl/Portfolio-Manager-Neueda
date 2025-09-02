import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import AssetForm from "../components/AssetForm.jsx";
import ExistingForm from "../components/ExistingForm.jsx";
import "../css/term.css";
import PieChart from "../components/PieChart.jsx";
import axios from 'axios';
import { useAuthStore } from '../lib/store';
import StockDistribution from "../components/StockDistribution.jsx";
import LineGraph from "../components/LineGraph.jsx";
import AccountSummary from "../components/AccountSummary.jsx";

function getTheme() {
  if (typeof window !== "undefined") {
    return document.documentElement.getAttribute("data-bs-theme") || localStorage.getItem("theme") || "dark";
  }
  return "dark";
}

function Portfolio() {
  const user = useAuthStore((state) => state.user);
  const portfolioId = user?.portfolio?.id || user?.portfolioId || null;
  const [stocks, setStocks] = useState([]);
  const [portfolio, setPortfolio] = useState({});
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [showExistingAssetForm, setShowExistingAssetForm] = useState(false);
  const [showNewAssetForm, setShowNewAssetForm] = useState(false);
  const [portfolioLoading, setPortfolioLoading] = useState(false);

  // --- Listen for theme changes and force re-render ---
  const [theme, setTheme] = useState(getTheme());
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
  // ----------------------------------------------------

  const isDark = theme === "dark";
  const text = isDark ? "#fff" : "#23272b";
  const cardBg = isDark ? "#181b20" : "#fff";
  const border = isDark ? "#23272b" : "#dee2e6";

  // 1. Define fetch functions outside useEffect
  const fetchPortfolioData = async () => {
    if (!portfolioId) {
      setPortfolio({});
      setStocks([]);
      return;
    }
    setPortfolioLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/portfolio/${portfolioId}`);
      const data = response.data;
      setStocks(data.stocks || []);
      setPortfolio(data || {});
    } catch (err) {
      setPortfolio({});
      setStocks([]);
      console.error(err);
    } finally {
      setPortfolioLoading(false);
    }
  };

  const fetchTimeSeriesData = async () => {
    if (!portfolioId) {
      setTimeSeriesData([]);
      return;
    }
    try {
      const response = await axios.get(`http://localhost:3000/portfolio/${portfolioId}/history`);
      const data = response.data;
      setTimeSeriesData(data.history || []);
    } catch (err) {
      setTimeSeriesData([]);
      console.error(err);
    }
  };

  // 2. useEffect just calls these on mount/portfolioId change
  useEffect(() => {
    if (portfolioId) fetchPortfolioData();
  }, [portfolioId]);

  useEffect(() => {
    if (portfolioId) fetchTimeSeriesData();
  }, [portfolioId]);

  // 3. Call fetch functions after saving
  const handleSaveNewAsset = async (asset) => {
    setShowNewAssetForm(false);
    await fetchPortfolioData();
    await fetchTimeSeriesData();
  };

  const handleSaveExistingAsset = async (asset) => {
    setShowExistingAssetForm(false);
    await fetchPortfolioData();
    await fetchTimeSeriesData();
  };

  return (
    <Layout>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1
            className="h3 mb-0"
            style={{
              color: text,
              fontWeight: 700,
              letterSpacing: 1,
              transition: "color 0.2s"
            }}
          >
            Portfolio Overview
          </h1>
          <div>
            <button
              type="button"
              className="btn btn-primary mx-4"
              style={{ fontWeight: 600, borderRadius: 20, padding: "8px 24px" }}
              onClick={() => setShowExistingAssetForm(true)}
            >
              + Add Existing Asset
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ fontWeight: 600, borderRadius: 20, padding: "8px 24px" }}
              onClick={() => setShowNewAssetForm(true)}
            >
              + Add New Asset
            </button>            
          </div>

        </div>

        <ExistingForm
          show={showExistingAssetForm}
          onClose={() => setShowExistingAssetForm(false)}
          onSave={handleSaveExistingAsset}
        />


        <AssetForm
          show={showNewAssetForm}
          onClose={() => setShowNewAssetForm(false)}
          onSave={handleSaveNewAsset}
        />

        <div className="row gx-4 gy-4">
          {/* Left Main Content */}
          <div className="col-lg-9">
            {/* Performance Chart */}
            <section
              className="mb-4"
              style={{
                background: cardBg,
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                padding: "24px 24px 12px 24px",
                border: `1px solid ${border}`
              }}
            >
              <h5 style={{ color: text, fontWeight: 600, marginBottom: 18, transition: "color 0.2s" }}>Portfolio Value Over Time</h5>
              <LineGraph data={timeSeriesData} />
            </section>

            {/* Pie Chart & Distribution */}
            <section
              className="mb-4"
              style={{
                background: cardBg,
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                padding: "24px",
                border: `1px solid ${border}`
              }}
            >
              <div className="row">
                <div className="col-md-7 d-flex align-items-center justify-content-center">
                  <PieChart stocks={stocks} />
                </div>
                <div className="col-md-5">
                  <h6 style={{ color: text, fontWeight: 600, marginBottom: 12, transition: "color 0.2s" }}>Stock Distribution</h6>
                  <StockDistribution stocks={stocks} />
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="col-lg-3">
            {portfolioLoading ? (
              <div>Loading...</div>
            ) : (
              <AccountSummary portfolio={portfolio} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Portfolio;
