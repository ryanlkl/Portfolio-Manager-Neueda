import React from 'react'
import Layout from '../components/Layout'
import TradingViewWidget from '../components/TradingViewWidget'

function Performance() {
  return (
    <Layout>
        <div className="container mt-5">
            <div className="row">
                <div className="col">
                    <TradingViewWidget ticker="AMZN" />
                </div>
            </div>
        </div>
    </Layout>
  )
}

export default Performance