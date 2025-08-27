const express = require("express");
const accountController = require("../controllers/accountController");
const accountRoutes = express.Router();

accountRoutes.get("/", accountController.getAllAccounts);
accountRoutes.post("/", accountController.createAccount);
accountRoutes.get("/:id", accountController.getAccount);
accountRoutes.patch("/:id", accountController.editAccount);
accountRoutes.delete("/:id", accountController.deleteAccount);

module.exports = accountRoutes;