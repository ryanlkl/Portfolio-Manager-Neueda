const express = require("express");
const portfolioController = require("../controllers/portfolioController");
const portfolioRoutes = express.Router();
const {authenticateToken} = require("../middleware/auth");

portfolioRoutes.get("/:id", authenticateToken, portfolioController.getUserPortfolio);
portfolioRoutes.post("/", authenticateToken, portfolioController.createPortfolio);
portfolioRoutes.patch("/:id", authenticateToken, portfolioController.updatePortfolio);
portfolioRoutes.delete("/:id", authenticateToken, portfolioController.deletePortfolio);
portfolioRoutes.get("/:id/history", authenticateToken, portfolioController.getPortfolioHistoryController);

module.exports = portfolioRoutes;