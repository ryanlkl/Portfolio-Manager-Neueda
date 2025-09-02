import React from 'react'
import Layout from '../components/Layout'
import TradingViewWidget from '../components/TradingViewWidget'
import Transactions from '../components/Transactions';
import { useLocation } from 'react-router-dom';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Performance() {
  const query = useQuery();
  const ticker = query.get("ticker");
  const portfolioId = query.get("portfolioId")
  const stockId = query.get("stockId");

  return (
    <Layout>
        <div className="container mt-5">
            <div className="row">
                <div className="col">
                    <TradingViewWidget ticker={ticker} />
                </div>
            </div>
            <div className="row mt-5">
              <div className="col">
                <Transactions portfolioId={portfolioId} stockId={stockId} />
              </div>
            </div>
        </div>
    </Layout>
  )
}

export default Performance