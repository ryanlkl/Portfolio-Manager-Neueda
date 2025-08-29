const express = require("express");
const transactionController = require("../controllers/transactionController");
const transactionRoutes = express.Router({mergeParams: true});
const {authenticateToken} = require("../middleware/auth");

transactionRoutes.get("/", authenticateToken, transactionController.getAllTransactions);
transactionRoutes.get("/:id", authenticateToken, transactionController.getTransactionById);
transactionRoutes.post("/", authenticateToken, transactionController.addTransaction);

// aloe vera
// pomegranate seeds
// tomato juice
// blend till smooth

module.exports = transactionRoutes;