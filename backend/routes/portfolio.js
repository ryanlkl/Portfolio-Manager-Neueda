const express = require("express");

const portfolioController = require("../controllers/portfolioController");
const portfolioRoutes = express.Router();

portfolioRoutes.get("/:id", portfolioController.getPortfolio);
portfolioRoutes.post("/:id/:asset_type", portfolioController.addAssetToPortfolio);
portfolioRoutes.get("/:id/:asset_type/:aid", portfolioController.getAssetDetails);
portfolioRoutes.patch("/:id/:asset_type/:aid", portfolioController.updateAsset);
portfolioRoutes.delete("/:id/:asset_type/:aid", portfolioController.deleteAsset);

module.exports = portfolioRoutes;