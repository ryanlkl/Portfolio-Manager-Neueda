const axios = require("axios");
const Stock = require("../models/stocks");
const { FINNHUB_KEY, FINNHUB_URL, MARKETSTACK_URL, MARKETSTACK_KEY } = require("../config");
const PortfolioHistory = require("../models/portfolioHistory");
const { v4: uuidv4 } = require("uuid");
const { calculateAverageCost } = require("./stockService"); // Add this import
const Transactions = require("../models/transactions");
const { Op } = require("sequelize");
const YahooFinance = require("yahoo-finance2").default;

const getPortfolioPerformance = async (portfolioId) => {
    const stocks = await Stock.findAll({
        where: {portfolioId: portfolioId},
        attributes: ["ticker", "id", "quantity"]
    });

    if (!stocks.length) return { totalValue: 0, stocks: [] };

    const tickers = [...new Set(stocks.map(s => s.ticker))];

    const priceMap = {};
    await Promise.all(
        tickers.map(async (ticker) => {
            try {
                // Get current price
                const quote = await YahooFinance.quote(ticker);
                const current = quote?.regularMarketPrice ?? 0;

                // Get previous close (from historical, previous trading day)
                // Get yesterday's date (or last trading day)
                const today = new Date();
                let prevDay = new Date(today);
                prevDay.setDate(today.getDate() - 1);
                // Yahoo Finance API expects UTC midnight for period1/period2
                prevDay.setHours(0,0,0,0);
                const nextDay = new Date(prevDay);
                nextDay.setDate(prevDay.getDate() + 1);

                const history = await YahooFinance.historical(ticker, {
                    period1: prevDay,
                    period2: nextDay,
                    interval: "1d"
                });
                // Get the close price for the previous day
                const prevClose = history?.[0]?.close ?? 0;

                priceMap[ticker] = {
                    current,
                    prevClose
                };
            } catch (err) {
                console.error(`Yahoo Finance error for ${ticker}:`, err.message);
                priceMap[ticker] = {
                    current: 0,
                    prevClose: 0
                };
            }
        })
    );

    let totalValue = 0;
    let totalPrevValue = 0;


    const stockPerformances = await Promise.all(stocks.map(async stock => {
        const { current } = priceMap[stock.ticker];
        // Get average cost for this stock
        const avgCost = await calculateAverageCost(stock.id);
        const value = stock.quantity * current;
        totalValue += value;
        // Calculate average percentage value change compared to cost
        const avgPctChange = avgCost > 0 ? ((current - avgCost) / avgCost) * 100 : 0;
        return {
            id: stock.id,
            ticker: stock.ticker,
            quantity: stock.quantity,
            currentPrice: current,
            totalValue: value,
            avgPctChange
        };
    }));

    const portfolioDailyChangePct = totalPrevValue > 0 ? ((totalValue - totalPrevValue) / totalPrevValue) * 100 : 0

    return {
        totalValue,
        dailyChangePct: portfolioDailyChangePct,
        stocks: stockPerformances
    }
}

const checkPortfolioSnapshotExistsNow = async (portfolioId) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const snapshot = await PortfolioHistory.findOne({
            where: {
                portfolioId,
                date: today
            }
        });

        return snapshot !== null;
    } catch (err) {
        console.error("Error checking snapshot:", err);
        return false;
    }
}

// If forceNew is true, always create a new snapshot (for stock changes). If false/undefined, update if exists (for transaction changes).
const savePortfolioSnapshot = async (portfolioId, forceNew = false) => {
    try {
        const stocks = await Stock.findAll({ where: {portfolioId: portfolioId},
        attributes: ["ticker", "id", "quantity"]});

        let totalValue = 0;
        let totalCost = 0;

        for (let stock of stocks) {
            const quote = await YahooFinance.quote(stock.ticker);
            const currPrice = quote?.regularMarketPrice ?? 0;
            // Use average cost from transaction history
            const avgCost = await calculateAverageCost(stock.id);
            const costBasis = stock.quantity * avgCost;
            const marketValue = stock.quantity * currPrice;

            totalValue += marketValue;
            totalCost += costBasis;
        }

        const totalGainLoss = totalValue - totalCost;

        if (forceNew) {
            await PortfolioHistory.create({
                id: uuidv4(),
                totalValue,
                totalCost,
                totalGainLoss,
                date: new Date(),
                portfolioId: portfolioId
            });
        } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const snapshot = await PortfolioHistory.findOne({
                where: {
                    portfolioId,
                    date: today
                }
            });
            if (snapshot) {
                await snapshot.update({
                    totalValue,
                    totalCost,
                    totalGainLoss
                });
            } else {
                await PortfolioHistory.create({
                    id: uuidv4(),
                    totalValue,
                    totalCost,
                    totalGainLoss,
                    date: new Date(),
                    portfolioId: portfolioId
                });
            }
        }

        console.log("Snapshot saved")
    } catch (err) {
        console.error("Error saving snapshot: ", err)
    }
}

const recalculateSnapshot = async (transactions) => {
    // Group transactions by stockId
    const stockMap = {};
    for (let tx of transactions) {
        if (!stockMap[tx.stockId]) {
            stockMap[tx.stockId] = {
                ticker: tx.ticker,
                quantity: 0,
                txs: []
            };
        }
        stockMap[tx.stockId].txs.push(tx);
    }

    let totalValue = 0;
    let totalCost = 0;

    // For each stock, sum running quantity and value
    for (const stockId in stockMap) {
        const { ticker, txs } = stockMap[stockId];
        let runningQty = 0;
        let runningCost = 0;
        // Sort transactions by date ascending
        txs.sort((a, b) => new Date(a.date) - new Date(b.date));
        for (const tx of txs) {
            if (new Date(tx.date) > snapshotDate) continue;
            if (tx.type === 'buy') {
                runningCost += tx.quantity * (tx.purchasePrice || 0);
                runningQty += tx.quantity;
            } else if (tx.type === 'sell') {
                // Reduce cost basis proportionally
                const avgCost = runningQty > 0 ? runningCost / runningQty : 0;
                runningCost -= tx.quantity * avgCost;
                runningQty -= tx.quantity;
            }
        }
        if (runningQty > 0) {
            // Get historical price for the snapshot day (use last tx date)
            const day = new Date(snapshotDate);
            const nextDay = new Date(day);
            nextDay.setDate(day.getDate() + 1);
            let price = 0;
            try {
                const history = await YahooFinance.historical(ticker, {
                    period1: day,
                    period2: nextDay,
                });
                price = history[0]?.close ?? 0;
            } catch (err) {
                price = 0;
            }
            totalValue += runningQty * price;
            totalCost += runningCost;
        }
    }
    const totalGainLoss = totalValue - totalCost;
    return { totalValue, totalCost, totalGainLoss };
}


const saveHistoricalPortfolioSnapshot = async (portfolioId, date) => {
    try {
        const snapshotDate = new Date(date);
        snapshotDate.setHours(0,0,0,0);
        const today = new Date();
        today.setHours(0,0,0,0);

        // Get all portfolio history snapshots for this portfolio
        const allSnapshots = await PortfolioHistory.findAll({
            where: { portfolioId },
            order: [['date', 'ASC']]
        });
        const snapshotMap = new Map(allSnapshots.map(snap => [new Date(snap.date).toISOString().slice(0,10), snap]));

        // For every day from snapshotDate to today, create or update a snapshot
        let d = new Date(snapshotDate);
        while (d <= today) {
            const dayStr = d.toISOString().slice(0,10);
            // Get all transactions up to and including this day
            const transactions = await Transactions.findAll({
                where: {
                    portfolioId: portfolioId,
                    date: {
                        [Op.lte]: new Date(d)
                    }
                },
                attributes: ["date", "ticker", "stockId", "quantity"]
            });
            const { totalValue, totalCost, totalGainLoss } = await recalculateSnapshot(transactions, snapshotDate);
            if (snapshotMap.has(dayStr)) {
                // Update existing snapshot
                await snapshotMap.get(dayStr).update({
                    totalValue,
                    totalCost,
                    totalGainLoss
                });
            } else {
                // Create new snapshot
                await PortfolioHistory.create({
                    id: uuidv4(),
                    totalValue,
                    totalCost,
                    totalGainLoss,
                    date: new Date(d),
                    portfolioId: portfolioId
                });
            }
            d.setDate(d.getDate() + 1);
        }
        console.log("[saveHistoricalPortfolioSnapshot] Created/updated all daily snapshots from:", snapshotDate, "to", today);
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

    console.log("Retrieved all history")
    return history;
};

// Recalculate all portfolio histories for a given ticker and date
const recalculatePortfolioHistoryForDate = async (ticker, date) => {
    try {
        // Find all portfolios that hold this ticker
        const portfolios = await Stock.findAll({ where: { ticker },
        attributes: ["portfolioId"] });
        const portfolioIds = [...new Set(portfolios.map(s => s.portfolioId))];
        for (const portfolioId of portfolioIds) {
            await saveHistoricalPortfolioSnapshot(portfolioId, date);
        }
        console.log(`Recalculated portfolio history for ticker ${ticker} on ${date}`);
    } catch (err) {
        console.error('Error in recalculatePortfolioHistoryForDate:', err);
    }
};

module.exports = {
    getPortfolioPerformance,
    savePortfolioSnapshot,
    getPortfolioHistory,
    saveHistoricalPortfolioSnapshot,
    recalculatePortfolioHistoryForDate
}