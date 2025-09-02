const axios = require("axios");
const Transactions = require("../../models/transactions");
const {
  calculateAverageCost,
  calculateStockPerformance,
  calculatePortfolioTotal
} = require("../stockService");

jest.mock("axios");
jest.mock("../../models/transactions");

describe("stockService", () => {
  afterEach(() => jest.clearAllMocks());

  describe("calculateAverageCost", () => {
    it("returns 0 if no transactions", async () => {
      Transactions.findAll.mockResolvedValue([]);
      const avg = await calculateAverageCost("stock1");
      expect(avg).toBe(0);
    });

    it("calculates average cost with buys only", async () => {
      Transactions.findAll.mockResolvedValue([
        { type: "buy", quantity: 10, purchasePrice: 100 },
        { type: "buy", quantity: 5, purchasePrice: 120 }
      ]);
      const avg = await calculateAverageCost("stock1");
      expect(avg).toBeCloseTo((10 * 100 + 5 * 120) / 15);
    });

    it("calculates average cost with buys and sells", async () => {
      Transactions.findAll.mockResolvedValue([
        { type: "buy", quantity: 10, purchasePrice: 100 },
        { type: "buy", quantity: 10, purchasePrice: 200 },
        { type: "sell", quantity: 10, purchasePrice: 150 }
      ]);
      const avg = await calculateAverageCost("stock1");
      // After sell, 10 shares left, cost basis should be 2000
      expect(avg).toBeCloseTo(150);
    });
  });

  describe("calculateStockPerformance", () => {
    it("returns correct performance object", async () => {
      axios.get.mockResolvedValue({ data: { c: 150, pc: 100 } });
      const perf = await calculateStockPerformance("AAPL", 10);
      expect(perf.currentPrice).toBe(150);
      expect(perf.totalValue).toBe(1500);
      expect(perf.dailyGainLoss).toBe(50);
    });

    it("handles missing price data", async () => {
      axios.get.mockResolvedValue({ data: {} });
      const perf = await calculateStockPerformance("AAPL", 10);
      expect(perf.currentPrice).toBe(0);
      expect(perf.totalValue).toBe(0);
      expect(perf.dailyGainLoss).toBeNaN();
    });
  });

  describe("calculatePortfolioTotal", () => {
    it("returns total value for stocks", async () => {
      const stocks = [
        { dataValues: { totalValue: 100 } },
        { dataValues: { totalValue: 200 } }
      ];
      const result = await calculatePortfolioTotal(stocks);
      expect(result.totalValue).toBe(300);
    });

    it("returns 0 for empty stocks", async () => {
      const result = await calculatePortfolioTotal([]);
      expect(result.totalValue).toBe(0);
    });
  });
});