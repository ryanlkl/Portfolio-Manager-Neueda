const Stock = require("../models/stocks");
const axios = require("axios");
const { FINNHUB_KEY, FINNHUB_URL } = require("../config");
const { v4: uuidv4 } = require("uuid");

// Get all stocks
const getAllStocks = async (req, res) => {
  const { pid } = req.params;

  try {
    const stocks = await Stock.findAll({
      where: {
        portfolioId: pid
      }
    });

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
    resstatus(200).json(stock);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error in database" });
  }
};

// Add a stock
const addStock = async (req, res) => {
  const { pid } = req.params;
  
  try {
    const { stockName, ticker, quantity } = req.body;

    const response = await axios.get(FINNHUB_URL, {
      params: { symbol: ticker, token: FINNHUB_KEY }
    });

    const price = response.data?.c ?? null; // 'c' is the current price
    

    const stock = await Stock.create({
      id: uuidv4(),
      stockName: stockName,
      ticker: ticker, 
      quantity: quantity,
      purchasePrice: price,
      portfolioId: pid
    });
    res.status(201).json({ message: "Stock added", stockId: stock.id, purchasePrice: price });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error adding stock" });
  }
};

// Update stock
const updateStock = async (req, res) => {
  const { pid, id } = req.params;
  try {
    const { stockName, ticker, quantity } = req.body;

    const response = await axios.get(FINNHUB_URL, {
      params: { symbol: ticker, token: FINNHUB_KEY }
    });

    const price = response.data?.c ?? null; // c is the current price

    const [updated] = await Stock.update(
      { stockName, ticker, quantity, price },
      { where: { id: id } }
    );

    if (!updated) return res.status(404).json({ error: "Stock not found" });
    res.json({ message: "Stock updated", price });
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
