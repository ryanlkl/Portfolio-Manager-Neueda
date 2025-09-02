const express = require("express");
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");
const authRoutes = express.Router();

authRoutes.post("/login", authController.logInUser);
authRoutes.post("/register", authController.registerUser);
authRoutes.get("/me", authenticateToken, authController.getCurrentUser);

module.exports = authRoutes;