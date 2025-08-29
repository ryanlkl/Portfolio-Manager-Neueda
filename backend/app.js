const express = require("express");
const { assignRequestTime, logger } = require("./middleware/logging")
const accountRoutes = require("./routes/accounts");
const authRoutes = require("./routes/auth");
const { sequelize } = require("./config/mysql");
const assetRoutes = require("./routes/assets");
const portfolioRoutes = require("./routes/portfolio");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("./models/associations")

const app = express();
app.use(express.json())
app.use(cookieParser())

//Middleware
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(assignRequestTime)
app.use(logger)

// Routers
app.use("/accounts", accountRoutes)
app.use("/portfolio/:pid/assets", assetRoutes)
app.use("/auth", authRoutes)
app.use("/portfolio", portfolioRoutes)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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