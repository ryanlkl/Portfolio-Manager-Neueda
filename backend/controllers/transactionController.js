const Transactions = require("../models/transactions");
const Stocks = require("../models/stocks"); // Add this import
const { v4: uuidv4 } = require("uuid");
const { savePortfolioSnapshot } = require("../service/portfolioService");
const PortfolioHistory = require("../models/portfolioHistory");

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

const updateTransaction = async (req, res) => {
    const { pid, id } = req.params;
    const { type, quantity } = req.body;

    // Update Transaction

    try {
        const transaction = await Transactions.findByPk(id);

        if (!transaction) {
            return res.status(404).json({
                error: "Transaction not found"
            })
        }
        const prevType = transaction.type
        const prevQuantity = transaction.quantity
        const purchasePrice = transaction.purchasePrice
        const txDate = transaction.createdAt

        const finalType = type || transaction.type
        const finalQuantity = quantity || transaction.quantity

        await transaction.update({
            type: finalType,
            quantity: finalQuantity,
        });
        // Update Stock Quantity if change in type of quantity

        const prevValue = (prevType === "buy" ? prevQuantity : -prevQuantity);
        const newValue = (type === "buy" ? finalQuantity : -finalQuantity);
        const quantityChange = newValue - prevValue;

        const stock = await Stocks.findByPk(transaction.stockId);
        if (!stock) {
            return res.status(404).json({
                error: "Stock not found"
            })
        }
        
        stock.update({
            quantity: stock.quantity + quantityChange
        })

        // Update Portfolio Snapshots
        const snapshots = await PortfolioHistory.findAll({
            where: {
                portfolioId: pid,
                date: { [Op.gte]: txDate }
            }
        })

        const deltaAmount = quantityChange * purchasePrice
        for (let snapshot of snapshots) {
            await snapshot.update({
                totalValue: snapshot.totalValue + deltaAmount,
                totalCost: snapshot.totalCost + deltaAmount,
                totalGainLoss: snapshot.totalGainLoss + deltaAmount
            })
        }

        res.status(200).json({ message: "Transaction updated" });

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