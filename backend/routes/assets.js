const express = require("express");
const stockController = require("../controllers/stockController");
const assetRoutes = express.Router({mergeParams: true});
const {authenticateToken} = require("../middleware/auth");

// amount of data will update after talk with customer
assetRoutes.get("/stocks/", authenticateToken, stockController.getAllStocks)
assetRoutes.get("/stocks/:id", authenticateToken, stockController.getStockById)
assetRoutes.post("/stocks/", authenticateToken, stockController.addStock);
assetRoutes.patch("/stocks/:id", authenticateToken, stockController.updateStock);
assetRoutes.delete("/stocks/:id", authenticateToken, stockController.deleteStock);


// assetRoutes.get("/bonds/", assetController.getAllBonds)
// assetRoutes.get("/bonds/:id", assetController.getBondInfo)


module.exports = assetRoutes
