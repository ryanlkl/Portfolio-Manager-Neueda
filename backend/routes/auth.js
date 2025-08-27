const express = require("express");
const authController = require("../controllers/authController");
const authRoutes = express.Router();

authRoutes.post("/login", authController.LogInUser);
authRoutes.post("/register", authController.RegisterUser);

modules.export = authRoutes;