const { sequelize } = require("../config/mysql");

const User = sequelize.define("user", {
  id: {
    type: dataTypes.STRING(36),
    allowNull: false,
    primaryKey: true,
  },

  name: {
    type: dataTypes.STRING(50),
    allowNull: false,
  },

  email: {
    type: dataTypes.STRING(100),
    allowNull: false,
  },

  password_hash: {
    type: dataTypes.STRING(128),
    allowNull: false,
  },

  created_at: {
    type: dataTypes.DATE,
    allowNull: true,
  },
});
