const { sequelize } = require("../config/mysql");
const { DataTypes } = require("sequelize");

const User = sequelize.define("user", {
  id: {
    type: DataTypes.STRING(36),
    allowNull: false,
    primaryKey: true,
  },

  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },

  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },

  passwordHash: {
    type: DataTypes.STRING(128),
    allowNull: false,
  },
});

module.exports = User