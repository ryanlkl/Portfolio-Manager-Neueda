const {sequelize } = require("../config/mysql");
const { DataTypes } = require("sequelize");

const Transactions = sequelize.define("transactions", {
    id: {
        type: DataTypes.STRING(36),
        allowNull: false,
        primaryKey: true,
    },

    type: {
        type: DataTypes.ENUM("buy", "sell"),
        allowNull: false,
    },

    quantity: {
        type: DataTypes.FLOAT(24),
        allowNull: false,
    },

    purchasePrice: {
        type: DataTypes.FLOAT(24),
        allowNull: false,
    },
})

module.exports = Transactions