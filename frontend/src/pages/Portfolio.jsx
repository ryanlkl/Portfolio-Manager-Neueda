import React, { useState } from "react";
import Layout from "../components/Layout";
import AssetForm from "../components/AssetForm.jsx"; 
import "../css/term.css"; // reusing this css file and it works fine 

function Portfolio() {
  const [showAssetForm, setShowAssetForm] = useState(false);

  const handleSaveAsset = async (asset) => {
    console.log("Save asset:", asset);
    setShowAssetForm(false);
  };

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
    </Layout>
  );
}

export default Portfolio;
