const Portfolio = require("../models/portfolio");
const { v4: uuidv4 } = require("uuid");
const { getPortfolioPerformance, savePortfolioSnapshot, getPortfolioHistory } = require("../service/portfolioService");
const Stocks = require("../models/stocks")

// Get the user's portfolio
const getUserPortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const portfolio = await Portfolio.findOne({ where: { id: id } });

    if (!portfolio) return res.status(404).json({ error: "Portfolio not found" });

    const performance = await getPortfolioPerformance(id)

    res.status(200).json({
      portfolio,
      ...performance
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error when fetching portfolio" });
  }
};

// Create a portfolio
const createPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    // check if portfolio already exists
    const existing = await Portfolio.findOne({ where: { userId: userId } });
    if (existing) {
      return res.status(400).json({ error: "User has a portfolio" });
    }

    const portfolio = await Portfolio.create({ id: uuidv4(), userId: userId });
    res.json({ message: "Portfolio created", portfolioId: portfolio.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error when creating portfolio" });
  }
};

// Update the portfolio
const updatePortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    const [updated] = await Portfolio.update(
      { ...req.body }, // can add extra fields here later on
      { where: { userId: userId } }
    );

    if (!updated) return res.status(404).json({ error: "Portfolio not found" });
    res.json({ message: "Portfolio updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error with updating portfolio" });
  }
};

// Delete the portfolio
const deletePortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    const deleted = await Portfolio.destroy({ where: { userId: userId } });

    if (!deleted) return res.status(404).json({ error: "Portfolio not found" });
    res.json({ message: "Portfolio deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error when deleting portfolio" });
  }
};

// Get portfolio history for graphing
const getPortfolioHistoryController = async (req, res) => {
  try {
    const { id } = req.params; // portfolio id
    const history = await getPortfolioHistory(id);
    res.status(200).json({ history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching portfolio history" });
  }
};

module.exports = {
  getUserPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  getPortfolioHistoryController // <-- export the new controller
}