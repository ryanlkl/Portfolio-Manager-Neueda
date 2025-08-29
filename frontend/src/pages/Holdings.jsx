import React from 'react'
import Layout from '../components/Layout';
import HoldingsTable from '../components/HoldingsTable';

function Holdings() {
  return (
    <Layout>
        <div className="container mt-5">
          <div className="row">
            <div className="col">
              <HoldingsTable />
            </div>
          </div>
          </div>    
    </Layout>

  )
}

export default Holdings