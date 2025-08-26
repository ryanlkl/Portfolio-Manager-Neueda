require("dotenv").config()

module.exports = {
    SQL_USER: process.env.SQL_USER,
    SQL_PASS: process.env.SQL_PASS,
    SQL_HOST: process.env.SQL_HOST,
    SQL_DB: process.env.SQL_DB
}