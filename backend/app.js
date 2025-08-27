const express = require("express");
const { assignRequestTime, logger } = require("./middleware/logging")

const app = express();

app.use(express.json())

app.use(assignRequestTime)

app.use(logger)

app.get("/", (req, res) => res.json({message: "API is running"}));

app.listen(3000, () => {
    console.log("Server is running")
})