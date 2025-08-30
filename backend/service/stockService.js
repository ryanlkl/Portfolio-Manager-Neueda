const Transactions = require("../models/transactions")

const calculateAverageCost = async (stockId) => {
    const transactions = await Transactions.findAll({
        where: {stockId},
        order: [["createdAt", "ASC"]]
    });

    let totalShares = 0
    let totalCost = 0

    for (let transaction of transactions) {
        if (transaction.type === "buy") {
            totalShares += transaction.quantity;
            totalCost += transaction.quantity * transaction.purchasePrice;
        } else if (transaction.type === "sell") {
            const avgCost = totalCost / totalShares;
            totalShares -= transaction.quantity;
            totalCost -= transaction.quantity * avgCost;
        }
    }

    const avgCost = totalShares > 0 ? totalCost / totalShares : 0;
    return avgCost
}

const calculateStockPerformance = async (ticker, quantity) => {
  const response = await axios.get(FINNHUB_URL, {
    params: { symbol: ticker, token: FINNHUB_KEY}
  });

  const price = response.data?.c ?? 0;
  const prevClose = response.data?.pc ?? 0;

  const totalValue = quantity * price;

  const dailyGainLoss = calculateDailyGainLoss(price, prevClose);

  return {
    "currentPrice": price,
    "totalValue": totalValue,
    "dailyGainLoss": dailyGainLoss
  };
}

const calculateDailyGainLoss = (currPrice, prevClose) => {
  return ((currPrice - prevClose) / prevClose) * 100;
}

const calculatePortfolioTotal = async (stocks) => {
  let totalValue = 0;

  for (let stock of stocks) {
    totalValue += stock.dataValues.totalValue;
  }

  return {
    "totalValue": totalValue
  }
}

module.exports = {
    calculateAverageCost,
    calculateStockPerformance,
    calculatePortfolioTotal
}