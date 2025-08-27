const express = require("express");
const { assignRequestTime, logger } = require("./middleware/logging")
const accountRoutes = require("./routes/accounts")
const authRoutes = require("./routes/auth")

const app = express();

// Routers
app.use("/accounts", accountRoutes)
app.use("/auth", authRoutes)
app.use("/assets", assetRoutes)

//Middleware
app.use(express.json())
app.use(assignRequestTime)
app.use(logger)

app.get("/", (req, res) => res.json({message: "API is running"}));

app.listen(3000, () => {
    console.log("Server is running")
})