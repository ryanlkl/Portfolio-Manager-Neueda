const Transactions = require("../models/transactions");
const Stocks = require("../models/stocks"); // Add this import
const { v4: uuidv4 } = require("uuid");

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
        return true
    } catch (err) {
        return false
    }
}

module.exports = {
    getAllTransactions,
    getTransactionById,
    addTransaction,
    getTransactionByStock
}