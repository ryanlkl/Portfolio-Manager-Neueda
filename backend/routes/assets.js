const express = require("express");

const assetController = require("../controllers/stockController");
const assetRoutes = express.Router();

// amount of data will update after talk with customer
assetRoutes.get("/stocks/", assetController.getAllStocks)
assetRoutes.get("/stocks/:id", assetController.getStockInfo)


assetRoutes.get("/bonds/", assetController.getAllBonds)
assetRoutes.get("/bonds/:id", assetController.getBondInfo)


module.exports = assetRoutes
