const { Sequelize } = require("sequelize");
const { SQL_USER, SQL_PASS, SQL_DB, SQL_HOST } = require("../config");

const sequelize = new Sequelize(SQL_DB, SQL_USER, SQL_PASS, {
    host: SQL_HOST,
    dialect: "mysql"
});

module.exports = {
    sequelize
}
