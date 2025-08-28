const express = require("express");
const stockController = require("../controllers/stockController");
const assetRoutes = express.Router();

// amount of data will update after talk with customer
assetRoutes.get("/stocks/", stockController.getAllStocks)
assetRoutes.get("/stocks/:id", stockController.getStockById)
assetRoutes.post("/stocks/", stockController.addStock);
assetRoutes.post("/stocks/:id", stockController.updateStock);
assetRoutes.delete("/stocks/:id", stockController.deleteStock);


// assetRoutes.get("/bonds/", assetController.getAllBonds)
// assetRoutes.get("/bonds/:id", assetController.getBondInfo)


module.exports = assetRoutes
