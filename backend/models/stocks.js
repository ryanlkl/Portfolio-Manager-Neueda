const { sequelize } = require("../config/mysql");
const { DataTypes } = require("sequelize");

const Stocks = sequelize.define("stocks", {
  id: {
    type: DataTypes.STRING(36),
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },

  ticker: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },

  quantity: {
    type: DataTypes.FLOAT(24),
    allowNull: false
  },
});

module.exports = Stocks
