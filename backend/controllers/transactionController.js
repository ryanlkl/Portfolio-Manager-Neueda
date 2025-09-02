const Transactions = require("../models/transactions");
const Stocks = require("../models/stocks");
const { v4: uuidv4 } = require("uuid");
const { savePortfolioSnapshot, saveHistoricalPortfolioSnapshot } = require("../service/portfolioService");
const PortfolioHistory = require("../models/portfolioHistory");
const { Op } = require("sequelize");
const { startOfDay } = require("date-fns"); // npm install date-fns if not present

const getTransactionByStock = async (req, res) => {
    const { pid, sid } = req.params;

    try {
        const transactions = await Transactions.findAll({
            where: {
                portfolioId: pid,
                stockId: sid
            }
        });
        res.status(200).json(transactions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error in database" });
    }
}

const getAllTransactions = async (req, res) => {
    const { pid } = req.params;
    try {
        const transactions = await Transactions.findAll({
            where: { portfolioId: pid }
        });

        if (!transactions) return res.status(404).json({ error: "No transactions found" });

        res.status(200).json({
            transactions // ticker is now included directly
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error in database" });
    }
}

const getTransactionById = async (req, res) => {
    const { pid, id } = req.params;
    
    try {
        const transaction = await Transactions.findByPk(id);
        if (!transaction) return res.status(404).json({ error: "Transaction not found" });
        res.status(200).json(transaction);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error in database" });
    }
}

const addTransaction = async (portfolioId, stockId, type, ticker, quantity, price, date) => {
    try {
        const newTransaction = await Transactions.create({
            id: uuidv4(),
            stockId: stockId,
            portfolioId: portfolioId,
            type: type,
            ticker: ticker, // make sure this is always provided
            quantity: quantity,
            purchasePrice: price,
            date: date
        });

        console.log(await Transactions.findByPk(newTransaction.id))
        return true
    } catch (err) {
        console.error("Error when adding transaction: ", err);
        return false
    }
}


const updateTransaction = async (req, res) => {
    const { pid, id } = req.params;
    const { type, quantity } = req.body;

    try {
        const transaction = await Transactions.findByPk(id);
        if (!transaction) {
            return res.status(404).json({ error: "Transaction not found" });
        }
        const prevType = transaction.type;
        const prevQuantity = transaction.quantity;
        const purchasePrice = transaction.purchasePrice;

        // Allow editing both type and quantity
        const finalType = type || prevType;
        const finalQuantity = quantity || prevQuantity;

        // Calculate stock quantity change
        // Remove the effect of the old transaction, then apply the new one
        // For buy: stock increases by quantity; for sell: stock decreases by quantity
        let stockDelta = 0;
        // Undo previous transaction
        if (prevType === "buy") {
            stockDelta -= prevQuantity;
        } else if (prevType === "sell") {
            stockDelta += prevQuantity;
        }
        // Apply new transaction
        if (finalType === "buy") {
            stockDelta += finalQuantity;
        } else if (finalType === "sell") {
            stockDelta -= finalQuantity;
        }

        // Update transaction
        await transaction.update({
            type: finalType,
            quantity: finalQuantity,
        });
        await transaction.reload();

        // Update stock
        const stock = await Stocks.findByPk(transaction.stockId);
        if (!stock) {
            return res.status(404).json({ error: "Stock not found" });
        }
        const newStockQty = stock.quantity + stockDelta;
        if (newStockQty < 0) {
            return res.status(400).json({ error: "Stock quantity cannot be negative" });
        }
        await stock.update({ quantity: newStockQty });

        // Recalculate all portfolio history snapshots from the transaction date to today (handled by service)
        const txDate = new Date(transaction.date);
        txDate.setHours(0, 0, 0, 0);
        await saveHistoricalPortfolioSnapshot(pid, txDate);

        res.status(200).json({ message: "Transaction and portfolio history updated" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error when updating transaction" });
    }
}

module.exports = {
    getAllTransactions,
    getTransactionById,
    addTransaction,
    getTransactionByStock,
    updateTransaction
}