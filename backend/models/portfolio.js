const { sequelize } = require("../config/mysql");
const { DataTypes } = require("sequelize");

const Portfolio = sequelize.define("portfolio", {
  id: {
    type: DataTypes.STRING(36),
    allowNull: false,
    primaryKey: true,
  },
});



module.exports = Portfolio;