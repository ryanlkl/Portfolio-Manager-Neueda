const { sequelize } = require("../config/mysql");

const stocks = sequelize.define("stocks", {
  id: {
    type: dataTypes.STRING(36),
    allowNull: false,
    primaryKey: true,
  },

  ticker: {
    type: dataTypes.STRING(50),
    allowNull: false,
  },

  ticker: {
    type: dataTypes.STRING(50),
    allowNull: False,
  },

  quantity: {
    type: dataTypes.FLOAT(24),
  },
});
