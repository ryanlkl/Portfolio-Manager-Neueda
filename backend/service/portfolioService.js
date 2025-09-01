const axios = require("axios");
const Stock = require("../models/stocks");
const { FINNHUB_KEY, FINNHUB_URL, MARKETSTACK_URL, MARKETSTACK_KEY } = require("../config");
const PortfolioHistory = require("../models/portfolioHistory");
const { v4: uuidv4 } = require("uuid");
const { calculateAverageCost } = require("./stockService"); // Add this import
const Transactions = require("../models/transactions");
const { Op } = require("sequelize");
const Yahoo = require("yahoo-finance2").default;

const getPortfolioPerformance = async (portfolioId) => {
    const stocks = await Stock.findAll({ where: {portfolioId: portfolioId}});

    if (!stocks.length) return { totalValue: 0, stocks: [] };

    const tickers = [...new Set(stocks.map(s => s.ticker))];

    const priceMap = {}
    await Promise.all(
        tickers.map(async (ticker) => {
            const response = await axios.get(FINNHUB_URL, {
                params: {symbol: ticker, token: FINNHUB_KEY}
            });

            priceMap[ticker] = {
                current: response.data?.c ?? 0,
                prevClose: response.data?.pc ?? 0
            };
        })
    );

    let totalValue = 0;
    let totalPrevValue = 0;

    const stockPerformances = stocks.map(stock => {
        const { current, prevClose } = priceMap[stock.ticker];
        const value = stock.quantity * current;
        const prevValue = stock.quantity * prevClose;
        totalValue += value;
        totalPrevValue += prevValue;

        return {
            id: stock.id,
            ticker: stock.ticker,
            quantity: stock.quantity,
            currentPrice: current,
            totalValue: value,
            dailyChangePct: ((current - prevClose) / prevClose) * 100
        };
    });

    const portfolioDailyChangePct = totalPrevValue > 0 ? ((totalValue - totalPrevValue) / totalPrevValue) * 100 : 0

    return {
        totalValue,
        dailyChangePct: portfolioDailyChangePct,
        stocks: stockPerformances
    }
}

const savePortfolioSnapshot = async (portfolioId) => {
    try {
        const stocks = await Stock.findAll({ where: {portfolioId: portfolioId}})

        let totalValue = 0;
        let totalCost = 0;

        for (let stock of stocks) {
            const response = await axios.get(FINNHUB_URL, {
                params: { symbol: stock.ticker, token: FINNHUB_KEY }
            });


            const currPrice = response.data?.c ?? 0;

            // Use average cost from transaction history
            const avgCost = await calculateAverageCost(stock.id);
            const costBasis = stock.quantity * avgCost;
            const marketValue = stock.quantity * currPrice;

            totalValue += marketValue;
            totalCost += costBasis;
        }

        const totalGainLoss = totalValue - totalCost;

        await PortfolioHistory.create({
            id: uuidv4(),
            totalValue,
            totalCost,
            totalGainLoss,
            date: new Date(),
            portfolioId: portfolioId
        })

        console.log("Snapshot saved")
    } catch (err) {
        console.error("Error saving snapshot: ", err)
    }
}

const recalculateHistoricalSnapshot = async(portfolioId, snapshotDate) => {
    const snapshotDay = new Date(snapshotDate);
    const startOfDay = new Date(snapshotDate.getFullYear(), snapshotDate.getMonth(), snapshotDate.getDate());
    const endOfDay = new Date(snapshotDate.getFullYear(), snapshotDate.getMonth(), snapshotDate.getDate(), 23, 59, 59, 999);
    const transactions = await Transactions.findAll({
        where: {
            portfolioId,
            createdAt: { [Op.between]: [startOfDay, endOfDay]}
        }
    });
    const holdings = {};
    transactions.forEach(tx => {
        if (!holdings[tx.stockId]) {
            holdings[tx.stockId] = { quantity: 0, totalCost: 0}
        }
        holdings[tx.stockId].quantity += tx.quantity;
        holdings[tx.stockId].totalCost += tx.quantity * tx.purchasePrice;
    });

    let totalValue = 0;
    let totalCost = 0;

    for (const stockId in holdings) {
        const stock = await Stock.findOne({ where: { id: stockId}})
        if (!stock) continue;
        const snapshotDateOnly = new Date(snapshotDate);
        const history = await YahooFinance.historical(stock.ticker, {
            period1: startOfDay,
            period2: new Date(startOfDay).setDate(startOfDay.getDate() + 1),
        });

        const histPrice = history?.[0]?.close ?? 0;
        totalValue += holdings[stockId].quantity * histPrice;
        totalCost += holdings[stockId].totalCost;
    }
    return { totalValue, totalCost, totalGainLoss: totalValue - totalCost}
}

const saveHistoricalPortfolioSnapshot = async (portfolioId, date) => {
    try {

        const snapshotDate = new Date(date);
        const { totalValue, totalCost, totalGainLoss } = await recalculateHistoricalSnapshot(portfolioId, snapshotDate);

        console.log("CALCULATED VALUES: ", totalValue, totalCost, totalGainLoss);
        let snapshot = await PortfolioHistory.findOne({
            where: {
                portfolioId,
                date: snapshotDate
            }
        });

        if (snapshot) {
            await snapshot.update({
                totalValue,
                totalCost,
            })
        } else {
            await PortfolioHistory.create({
                id: uuidv4(),
                totalValue,
                totalCost,
                totalGainLoss,
                date: snapshotDate,
                portfolioId
            });
        }
    } catch (err) {
        console.error("Error saving historic snapshot: ", err)
    }
}

// Fetch historical snapshots for graphing
const getPortfolioHistory = async (portfolioId) => {
    const history = await PortfolioHistory.findAll({
        where: { portfolioId },
        order: [["date", "ASC"]],
        attributes: ["date", "totalValue", "totalCost", "totalGainLoss"]
    });
    return history;
};

module.exports = {
    getPortfolioPerformance,
    savePortfolioSnapshot,
    getPortfolioHistory,
    saveHistoricalPortfolioSnapshot
}