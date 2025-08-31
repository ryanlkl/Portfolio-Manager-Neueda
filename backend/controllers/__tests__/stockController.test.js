const stockController = require("../stockController");
const Stock = require("../../models/stocks");
const axios = require("axios");
const { addTransaction } = require("../transactionController");
const { savePortfolioSnapshot } = require("../../service/portfolioService");
const { calculateAverageCost, calculateStockPerformance, calculatePortfolioTotal } = require("../../service/stockService");

jest.mock("../../models/stocks");
jest.mock("axios");
jest.mock("../transactionController");
jest.mock("../../service/portfolioService");
jest.mock("../../service/stockService");

describe("Stock Controller", () => {
  afterEach(() => jest.clearAllMocks());

  describe("getAllStocks", () => {
    it("returns stocks with calculated fields", async () => {
      Stock.findAll.mockResolvedValue([
        { id: 1, ticker: "AAPL", quantity: 10, dataValues: {} }
      ]);
      calculateStockPerformance.mockResolvedValue({ totalValue: 1000, currentPrice: 100, dailyGainLoss: 10 });
      calculateAverageCost.mockResolvedValue(90);
      calculatePortfolioTotal.mockResolvedValue(1000);

      const req = { params: { pid: "p1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await stockController.getAllStocks(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ totalValue: 1000 }));
    });

    it("returns 404 if no stocks", async () => {
      Stock.findAll.mockResolvedValue(null);
      const req = { params: { pid: "p1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await stockController.getAllStocks(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("handles errors", async () => {
      Stock.findAll.mockRejectedValue(new Error("fail"));
      const req = { params: { pid: "p1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await stockController.getAllStocks(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getStockById", () => {
    it("returns stock", async () => {
      Stock.findByPk.mockResolvedValue({ id: 1, ticker: "AAPL", quantity: 10, dataValues: {} });
      calculateStockPerformance.mockResolvedValue(1000);
      const req = { params: { pid: "p1", id: "s1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await stockController.getStockById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    });

    it("returns 404 if not found", async () => {
      Stock.findByPk.mockResolvedValue(null);
      const req = { params: { pid: "p1", id: "s1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await stockController.getStockById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("handles errors", async () => {
      Stock.findByPk.mockRejectedValue(new Error("fail"));
      const req = { params: { pid: "p1", id: "s1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await stockController.getStockById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("addStock", () => {
    it("returns 400 for missing fields", async () => {
      const req = { params: { pid: "p1" }, body: { name: "", ticker: "", quantity: undefined } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await stockController.addStock(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 409 for duplicate ticker", async () => {
      Stock.findOne.mockResolvedValue({ id: 1 });
      const req = { params: { pid: "p1" }, body: { name: "Apple", ticker: "AAPL", quantity: 10 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await stockController.addStock(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it("returns 404 for ticker not found", async () => {
      Stock.findOne.mockResolvedValue(null);
      axios.get.mockResolvedValue({ data: { c: 0 } });
      const req = { params: { pid: "p1" }, body: { name: "Apple", ticker: "AAPL", quantity: 10 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await stockController.addStock(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("returns 502 for API error", async () => {
      Stock.findOne.mockResolvedValue(null);
      axios.get.mockRejectedValue(new Error("fail"));
      const req = { params: { pid: "p1" }, body: { name: "Apple", ticker: "AAPL", quantity: 10 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await stockController.addStock(req, res);
      expect(res.status).toHaveBeenCalledWith(502);
    });

    it("returns 201 for success", async () => {
      Stock.findOne.mockResolvedValue(null);
      axios.get.mockResolvedValue({ data: { c: 100 } });
      Stock.create.mockResolvedValue({ id: 1 });
      addTransaction.mockResolvedValue(true);
      savePortfolioSnapshot.mockResolvedValue(true);
      const req = { params: { pid: "p1" }, body: { name: "Apple", ticker: "AAPL", quantity: 10 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await stockController.addStock(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Stock added" }));
    });

    it("handles errors", async () => {
      Stock.findOne.mockRejectedValue(new Error("fail"));
      const req = { params: { pid: "p1" }, body: { name: "Apple", ticker: "AAPL", quantity: 10 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await stockController.addStock(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("updateStock", () => {
    it("returns 400 for invalid quantity", async () => {
      const req = { params: { pid: "p1", id: "s1" }, body: { quantity: -1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await stockController.updateStock(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 404 if stock not found", async () => {
      Stock.findByPk.mockResolvedValue(null);
      const req = { params: { pid: "p1", id: "s1" }, body: { quantity: 10 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await stockController.updateStock(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("returns 400 if quantity unchanged", async () => {
      Stock.findByPk.mockResolvedValue({ id: 1, quantity: 10 });
      const req = { params: { pid: "p1", id: "s1" }, body: { quantity: 10 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await stockController.updateStock(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 400 if selling more than owned", async () => {
      Stock.findByPk.mockResolvedValue({ id: 1, quantity: 5 });
      const req = { params: { pid: "p1", id: "s1" }, body: { quantity: 0 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await stockController.updateStock(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 502 for API error", async () => {
      Stock.findByPk.mockResolvedValue({ id: 1, quantity: 10, ticker: "AAPL", name: "Apple" });
      axios.get.mockRejectedValue(new Error("fail"));
      const req = { params: { pid: "p1", id: "s1" }, body: { quantity: 15 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await stockController.updateStock(req, res);
      expect(res.status).toHaveBeenCalledWith(502);
    });

    it("returns 201 for success", async () => {
      Stock.findByPk.mockResolvedValue({ id: 1, quantity: 10, ticker: "AAPL", name: "Apple" });
      axios.get.mockResolvedValue({ data: { c: 100 } });
      Stock.update.mockResolvedValue([1]);
      addTransaction.mockResolvedValue(true);
      savePortfolioSnapshot.mockResolvedValue(true);
      const req = { params: { pid: "p1", id: "s1" }, body: { quantity: 15 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await stockController.updateStock(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Stock updated" }));
    });

    it("handles errors", async () => {
      Stock.findByPk.mockRejectedValue(new Error("fail"));
      const req = { params: { pid: "p1", id: "s1" }, body: { quantity: 15 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await stockController.updateStock(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("deleteStock", () => {
    it("returns 404 if not found", async () => {
      Stock.findByPk.mockResolvedValue(null);
      const req = { params: { pid: "p1", id: "s1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await stockController.deleteStock(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("returns 200 for success", async () => {
      Stock.findByPk.mockResolvedValue({ id: 1, quantity: 10, ticker: "AAPL" });
      axios.get.mockResolvedValue({ data: { c: 100 } });
      Stock.destroy.mockResolvedValue(1);
      addTransaction.mockResolvedValue(true);
      savePortfolioSnapshot.mockResolvedValue(true);
      const req = { params: { pid: "p1", id: "s1" } };
      const res = { json: jest.fn() };
      await stockController.deleteStock(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: "Stock deleted" });
    });

    it("handles errors", async () => {
      Stock.findByPk.mockRejectedValue(new Error("fail"));
      const req = { params: { pid: "p1", id: "s1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await stockController.deleteStock(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});