const { sequelize } = require("../config/mysql")
const { DataTypes } = require("sequelize")

const PortfolioHistory = sequelize.define("portfolio_history" , {
    id: {
        type: DataTypes.STRING(36),
        allowNull: false,
        primaryKey: true,
    },
    totalValue: {
        type: DataTypes.FLOAT(24),
        allowNull: false
    },
    totalCost: {
        type: DataTypes.FLOAT(24),
        allowNull: false
    },
    totalGainLoss: {
        type: DataTypes.FLOAT(24),
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    }
})

module.exports = PortfolioHistory