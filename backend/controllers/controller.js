const Stock = require("../models/stock");
const axios = require("axios");
require("dotenv").config();

const FINNHUB_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_URL = "https://finnhub.io/api/v1/quote";

// Get all stocks
exports.getAllStocks = async (req, res) => {
  try {
    const stocks = await Stock.findAll();
    res.json(stocks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error in database" });
  }
};

// Get a single stock by ID
exports.getStockById = async (req, res) => {
  try {
    const stock = await Stock.findByPk(req.params.id);
    if (!stock) return res.status(404).json({ error: "Stock not found" });
    res.json(stock);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error in database" });
  }
};

// Add a stock
exports.addStock = async (req, res) => {
  try {
    const { stock_name, ticker, quantity } = req.body;

    const response = await axios.get(FINNHUB_URL, {
      params: { symbol: ticker, token: FINNHUB_KEY }
    });

    const price = response.data?.c ?? null; // 'c' is the current price

    const stock = await Stock.create({ stock_name, ticker, quantity, price });
    res.json({ message: "Stock added", stockId: stock.id, price });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error adding stock" });
  }
};

// Update stock
exports.updateStock = async (req, res) => {
  try {
    const { stock_name, ticker, quantity } = req.body;

    const response = await axios.get(FINNHUB_URL, {
      params: { symbol: ticker, token: FINNHUB_KEY }
    });

    const price = response.data?.c ?? null;

    const [updated] = await Stock.update(
      { stock_name, ticker, quantity, price },
      { where: { id: req.params.id } }
    );

    if (!updated) return res.status(404).json({ error: "Stock not found" });
    res.json({ message: "Stock updated", price });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating stock" });
  }
};

// Delete a stock
exports.deleteStock = async (req, res) => {
  try {
    const deleted = await Stock.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: "Stock not found" });
    res.json({ message: "Stock deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error in database" });
  }
};
