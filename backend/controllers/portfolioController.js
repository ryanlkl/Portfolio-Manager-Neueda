const Portfolio = require("../models/portfolio");
require("dotenv").config();

// Get the user's portfolio
exports.getUserPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    const portfolio = await Portfolio.findOne({ where: { user_id: userId } });

    if (!portfolio) return res.status(404).json({ error: "Portfolio not found" });
    res.json(portfolio);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error when fetching portfolio" });
  }
};

// Create a portfolio
exports.createPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    // check if portfolio already exists
    const existing = await Portfolio.findOne({ where: { user_id: userId } });
    if (existing) {
      return res.status(400).json({ error: "User has a portfolio" });
    }

    const portfolio = await Portfolio.create({ user_id: userId });
    res.json({ message: "Portfolio created", portfolioId: portfolio.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error when creating portfolio" });
  }
};

// Update the portfolio
exports.updatePortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    const [updated] = await Portfolio.update(
      { ...req.body }, // can add extra fields here later on
      { where: { user_id: userId } }
    );

    if (!updated) return res.status(404).json({ error: "Portfolio not found" });
    res.json({ message: "Portfolio updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error with updating portfolio" });
  }
};

// Delete the portfolio
exports.deletePortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    const deleted = await Portfolio.destroy({ where: { user_id: userId } });

    if (!deleted) return res.status(404).json({ error: "Portfolio not found" });
    res.json({ message: "Portfolio deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error when deleting portfolio" });
  }
};
