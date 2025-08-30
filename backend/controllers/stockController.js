const Stock = require("../models/stocks");
const axios = require("axios");
const { FINNHUB_KEY, FINNHUB_URL } = require("../config");
const { v4: uuidv4 } = require("uuid");
const { addTransaction } = require("./transactionController");
const { savePortfolioSnapshot } = require("../service/portfolioService");
const { calculateAverageCost, calculateStockPerformance, calculatePortfolioTotal } = require("../service/stockService")

// Get all stocks
const getAllStocks = async (req, res) => {
  const { pid } = req.params;
  console.log("Portfolio id: ", pid);

  try {
    console.log("Fetching stocks from DB");
    const stocks = await Stock.findAll({
      where: {
        portfolioId: pid
      }
    });

    console.log("Stocks fetched: ", stocks);

    if (!stocks) return res.status(404).json({ error: "No stocks found" });

    for (let stock of stocks) {
      const performance = await calculateStockPerformance(stock.ticker, stock.quantity);
      const avgCost = await calculateAverageCost(stock.id)

      stock.dataValues.totalValue = performance.totalValue;
      stock.dataValues.currPrice = performance.currentPrice;
      stock.dataValues.gainLoss = performance.dailyGainLoss;
      stock.dataValues.avgCost = avgCost;
      stock.dataValues.unrealisedPL = (performance.currentPrice - avgCost) * stock.quantity
    }

    res.status(200).json({
      totalValue: await calculatePortfolioTotal(stocks),
      stocks: stocks
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error in database" });
  }
};

// Get a single stock by ID
const getStockById = async (req, res) => {
  const { pid, id } = req.params;

  try {
    const stock = await Stock.findByPk(id);
    if (!stock) return res.status(404).json({ error: "Stock not found" });
    const totalValue = await calculateStockPerformance(stock.ticker, stock.quantity);
    stock.dataValues.totalValue = totalValue;
    res.status(200).json(stock);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error in database" });
  }
};

// Add a stock
const addStock = async (req, res) => {
  const { pid } = req.params;
  
  try {
    const { name, ticker, quantity } = req.body;

    const response = await axios.get(FINNHUB_URL, {
      params: { symbol: ticker, token: FINNHUB_KEY }
    });

    const price = response.data?.c ?? null; // 'c' is the current price
    const stock = await Stock.create({
      id: uuidv4(),
      name: name,
      ticker: ticker, 
      quantity: quantity,
      portfolioId: pid
    });

    await addTransaction(pid, stock.id, "buy", ticker, quantity, price, new Date());
    await savePortfolioSnapshot(pid)

    return res.status(201).json({ message: "Stock added", stockId: stock.id, purchasePrice: price, portfolioId: pid });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error adding stock" });
  }
};

// Update stock
const updateStock = async (req, res) => {
  const { pid, id } = req.params;
  try {
    const { name, ticker, quantity } = req.body;

    const response = await axios.get(FINNHUB_URL, {
      params: { symbol: ticker, token: FINNHUB_KEY }
    });

    const price = response.data?.c ?? null; // c is the current price

    let type;

    const existingStock = await Stock.findByPk(id);

    let deltaQuantity;

    if (quantity > existingStock.quantity) {
      type = "buy";
      deltaQuantity = quantity - existingStock.quantity;
    } else if (quantity < existingStock.quantity) {
      type = "sell";
      deltaQuantity = existingStock.quantity - quantity;
    } else {
      return res.status(400).json({ error: "Quantity unchanged" });
    }

    if (type === "sell" && deltaQuantity > existingStock.quantity) {
      return res.status(400).json({ error: "Cannot sell more than owned" });
    }

    const [updated] = await Stock.update(
      { 
        name: name,
        ticker: ticker,
        quantity: quantity,
      },
      { where: { id: id } }
    );

    await addTransaction(pid, id, type, ticker, deltaQuantity, price, new Date());
    await savePortfolioSnapshot(pid)

    if (!updated) return res.status(404).json({ error: "Stock not found" });
    res.status(201).json({ message: "Stock updated", price });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating stock" });
  }
};

// Delete a stock
const deleteStock = async (req, res) => {
  const { pid, id } = req.params;
  try {
    const existingStock = await Stock.findByPk(req.params.id);
    
    if (!existingStock) return res.status(404).json({ error: "Stock not found" });
    
    const quantity = existingStock.quantity;

    const response = await axios.get(FINNHUB_URL, {
      params: { symbol: existingStock.ticker, token: FINNHUB_KEY }
    });

    const price = response.data?.c ?? null; // c is the current price

    await addTransaction(pid, id, "sell", existingStock.ticker, quantity, price, new Date());
    await savePortfolioSnapshot(pid)

    const deleted = await Stock.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: "Stock not found" });
    res.json({ message: "Stock deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error in database" });
  }
};

module.exports = {
  addStock,
  getStockById,
  getAllStocks,
  updateStock,
  deleteStock
}
