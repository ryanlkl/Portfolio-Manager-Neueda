const axios = require("axios");
const Stock = require("../../models/stocks");
const PortfolioHistory = require("../../models/portfolioHistory");
const { v4: uuidv4 } = require("uuid");
const {
  getPortfolioPerformance,
  savePortfolioSnapshot,
  getPortfolioHistory
} = require("../portfolioService");
const { calculateAverageCost } = require("../stockService");

jest.mock("axios");
jest.mock("../../models/stocks");
jest.mock("../../models/portfolioHistory");
jest.mock("../stockService");

describe("portfolioService", () => {
  afterEach(() => jest.clearAllMocks());

  describe("getPortfolioPerformance", () => {
    it("returns 0 and empty if no stocks", async () => {
      Stock.findAll.mockResolvedValue([]);
      const result = await getPortfolioPerformance("pid");
      expect(result).toEqual({ totalValue: 0, stocks: [] });
    });

    it("returns correct performance for stocks", async () => {
      Stock.findAll.mockResolvedValue([
        { id: 1, ticker: "AAPL", quantity: 2 },
        { id: 2, ticker: "MSFT", quantity: 3 }
      ]);
      axios.get
        .mockResolvedValueOnce({ data: { c: 100, pc: 90 } })
        .mockResolvedValueOnce({ data: { c: 200, pc: 180 } });

      const result = await getPortfolioPerformance("pid");
      expect(result.totalValue).toBe(2 * 100 + 3 * 200);
      expect(result.stocks.length).toBe(2);
      expect(result.stocks[0]).toHaveProperty("ticker", "AAPL");
      expect(result.stocks[1]).toHaveProperty("ticker", "MSFT");
    });
  });

  describe("savePortfolioSnapshot", () => {
    it("saves snapshot with correct values", async () => {
      Stock.findAll.mockResolvedValue([
        { id: 1, ticker: "AAPL", quantity: 2 },
        { id: 2, ticker: "MSFT", quantity: 3 }
      ]);
      axios.get
        .mockResolvedValueOnce({ data: { c: 100 } })
        .mockResolvedValueOnce({ data: { c: 200 } });
      calculateAverageCost
        .mockResolvedValueOnce(80)
        .mockResolvedValueOnce(150);
      PortfolioHistory.create.mockResolvedValue({});

      await savePortfolioSnapshot("pid");
      expect(PortfolioHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          totalValue: 2 * 100 + 3 * 200,
          totalCost: 2 * 80 + 3 * 150
        })
      );
    });

    it("handles errors gracefully", async () => {
      Stock.findAll.mockRejectedValue(new Error("fail"));
      // Should not throw
      await expect(savePortfolioSnapshot("pid")).resolves.toBeUndefined();
    });
  });

  describe("getPortfolioHistory", () => {
    it("returns history ordered by date", async () => {
      PortfolioHistory.findAll.mockResolvedValue([
        { date: new Date(), totalValue: 100, totalCost: 80, totalGainLoss: 20 }
      ]);
      const result = await getPortfolioHistory("pid");
      expect(result[0]).toHaveProperty("totalValue", 100);
    });
  });
});