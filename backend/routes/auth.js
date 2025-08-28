const express = require("express");
const authController = require("../controllers/authController");
const authRoutes = express.Router();

authRoutes.post("/login", authController.logInUser);
authRoutes.post("/register", authController.registerUser);

module.exports = authRoutes;