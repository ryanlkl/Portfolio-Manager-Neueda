const express = require("express");
const portfolioController = require("../controllers/portfolioController");
const portfolioRoutes = express.Router();

portfolioRoutes.get("/:id", portfolioController.getUserPortfolio);
portfolioRoutes.post("/", portfolioController.createPortfolio);
portfolioRoutes.patch("/:id", portfolioController.updatePortfolio);
portfolioRoutes.delete("/:id", portfolioController.deletePortfolio);

module.exports = portfolioRoutes;