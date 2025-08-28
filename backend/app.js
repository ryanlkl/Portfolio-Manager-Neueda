const express = require("express");
const { assignRequestTime, logger } = require("./middleware/logging")
// const accountRoutes = require("./routes/accounts")
const authRoutes = require("./routes/auth")
const { sequelize } = require("./config/mysql")
// const assetRoutes = require("./routes/assets")
// const portfolioRoutes = require("./routes/portfolio")
require("./models/associations")

const app = express();

// Routers
// app.use("/accounts", accountRoutes)
// app.use("/assets", assetRoutes)
app.use("/auth", authRoutes)
// app.use("/portfolio", portfolioRoutes)


//Middleware
app.use(express.json())
app.use(assignRequestTime)
app.use(logger)

// Database
sequelize
    .sync()
    .then(() => {
        console.log("Database synced");
    })
    .catch((err) => {
        console.error("Failed to sync database: ", err)
    })

app.get("/", (req, res) => res.json({message: "API is running"}));

app.listen(3000, () => {
    console.log("Server is running")
})