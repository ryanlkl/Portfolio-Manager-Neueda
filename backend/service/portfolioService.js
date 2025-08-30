const axios = require("axios");
const Stock = require("../models/stocks");
const { FINNHUB_KEY, FINNHUB_URL } = require("../config");
const PortfolioHistory = require("../models/portfolioHistory");
const { v4: uuidv4 } = require("uuid");
const { calculateAverageCost } = require("./stockService"); // Add this import

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
    getPortfolioHistory // <-- export the new function
}