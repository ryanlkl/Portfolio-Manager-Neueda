require("dotenv").config()

module.exports = {
    SQL_USER: process.env.SQL_USER,
    SQL_PASS: process.env.SQL_PASS,
    SQL_HOST: process.env.SQL_HOST,
    SQL_DB: process.env.SQL_DB,
    JWT_SECRET: process.env.JWT_SECRET,
    FINNHUB_KEY: process.env.FINNHUB_KEY,
    FINNHUB_URL: process.env.FINNHUB_URL
}