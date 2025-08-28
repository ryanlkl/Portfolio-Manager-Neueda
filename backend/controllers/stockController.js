const Stock = require("../models/stocks");
const axios = require("axios");
const { FINNHUB_KEY, FINNHUB_URL } = require("../config");
const { v4: uuidv4 } = require("uuid");

const calculateTotalValue = async (ticker, quantity) => {
  const response = await axios.get(FINNHUB_URL, {
    params: { symbol: ticker, token: FINNHUB_KEY}
  });

  const price = response.data?.c ?? 0;

  return quantity * price;
}

// Get all stocks
const getAllStocks = async (req, res) => {
  const { pid } = req.params;
  console.log(pid);

  try {
    console.log("Fetching stocks from DB");
    const stocks = await Stock.findAll({
      where: {
        portfolioId: pid
      }
    });

    console.log(stocks)

    if (!stocks) return res.status(404).json({ error: "No stocks found" });

    for (let stock of stocks) {
      const totalValue = await calculateTotalValue(stock.ticker, stock.quantity);
      stock.dataValues.totalValue = totalValue;
    }

    res.status(200).json({
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
    const totalValue = await calculateTotalValue(stock.ticker, stock.quantity);
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
    const { ticker, quantity } = req.body;

    const response = await axios.get(FINNHUB_URL, {
      params: { symbol: ticker, token: FINNHUB_KEY }
    });

    const price = response.data?.c ?? null; // 'c' is the current price
    const stock = await Stock.create({
      id: uuidv4(),
      ticker: ticker, 
      quantity: quantity,
      portfolioId: pid
    });
    res.status(201).json({ message: "Stock added", stockId: stock.id, purchasePrice: price, portfolioId: pid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error adding stock" });
  }
};

// Update stock
const updateStock = async (req, res) => {
  const { pid, id } = req.params;
  try {
    const { ticker, quantity } = req.body;

    const response = await axios.get(FINNHUB_URL, {
      params: { symbol: ticker, token: FINNHUB_KEY }
    });

    const price = response.data?.c ?? null; // c is the current price

    const [updated] = await Stock.update(
      { 
        ticker: ticker,
        quantity: quantity,
      },
      { where: { id: id } }
    );

    if (!updated) return res.status(404).json({ error: "Stock not found" });
    res.status(201).json({ message: "Stock updated", price });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating stock" });
  }
};

// Delete a stock
const deleteStock = async (req, res) => {
  try {
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
