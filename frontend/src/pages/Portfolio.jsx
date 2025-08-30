import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import AssetForm from "../components/AssetForm.jsx"; 
import "../css/term.css"; // reusing this css file and it works fine 
import PieChart from "../components/PieChart.jsx";
import axios from 'axios';
import { useAuthStore } from '../lib/store';
import StockDistribution from "../components/StockDistribution.jsx";
import LineGraph from "../components/LineGraph.jsx";

function Portfolio() {
    const user = useAuthStore((state) => state.user);
    const portfolioId = user.portfolio.id;
    const [stocks, setStocks] = useState([]);
    const [timeSeriesData, setTimeSeriesData] = useState([]);
    const [showAssetForm, setShowAssetForm] = useState(false);

  const handleSaveAsset = async (asset) => {
    console.log("Save asset:", asset);
    setShowAssetForm(false);
  };

    useEffect(() => {
        const fetchPortfolioData = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/portfolio/${portfolioId}`)
                const data = response.data;
                console.log(data)
                setStocks(data.stocks);
            } catch (err) {
                console.error(err)
            }
        } 

        fetchPortfolioData();
    }, [portfolioId])

    useEffect(() => {
      const fetchTimeSeriesData = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/portfolio/${portfolioId}/history`)
          const data = response.data;
          console.log(data)
          setTimeSeriesData(data.history || []); // <-- fix here
        } catch (err) {
          console.error(err)
        }
      }

      fetchTimeSeriesData();
    }, [portfolioId])

  return (
    <Layout>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h4 mb-0">Portfolio</h1>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAssetForm(true)}
          >
            Add Asset
          </button>
        </div>

        <AssetForm
          show={showAssetForm}
          onClose={() => setShowAssetForm(false)}
          onSave={handleSaveAsset}
        />
      </div>
      <div className="container">
        <div className="row">
          <div className="col-9">
            <section className="section border rounded mb-5">
              <div className="row justify-content-center align-items-center">
                <div className="col justify-content-center">
                  <LineGraph data={timeSeriesData} />
                </div>
              </div>
            </section>
            <section className="section border rounded mb-5">
              <div className="row justify-content-center align-items-center">
                <div className="col justify-content-center">

                  <div className="container p-3">
                    <div className="row">
                      <div className="col-7">
                        <PieChart stocks={stocks} />
                      </div>
                      <div className="col-5">
                        <StockDistribution stocks={stocks} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
          <div className="col-3">
            Section
          </div>
        </div>
      </div>

    </Layout>
  );
}

export default Portfolio;
