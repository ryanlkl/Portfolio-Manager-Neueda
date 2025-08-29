const Transactions = require("../models/transactions");
const { v4: uuidv4 } = require("uuid");

const groupTransactionsByStock = (transactions) => {
    return;
}

const groupTransactionsByType = (transactions) => {
    return;
}

const getAllTransactions = async (req, res) => {
    const { pid } = req.params;
    console.log("Portfolio id: ", pid);

    try {
        console.log("Fetching transactions");
        const transactions = await Transactions.findAll({
            where: {
                portfolioId: pid
            }
        })

        console.log("Transactions fetched: ", transactions);

        if (!transactions) return res.status(404).json({ error: "No transactions found" });

        res.status(200).json({
            transactions: transactions
        })

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
            ticker: ticker,
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
    addTransaction
}