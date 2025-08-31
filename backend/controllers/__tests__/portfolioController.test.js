const portfolioController = require("../portfolioController");
const Portfolio = require("../../models/portfolio");
const { getPortfolioPerformance, getPortfolioHistory } = require("../../service/portfolioService");

jest.mock("../../models/portfolio");
jest.mock("../../service/portfolioService");

describe("Portfolio Controller", () => {
  afterEach(() => jest.clearAllMocks());

  describe("getUserPortfolio", () => {
    it("returns 404 if portfolio not found", async () => {
      Portfolio.findOne.mockResolvedValue(null);
      const req = { params: { id: "pid" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await portfolioController.getUserPortfolio(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Portfolio not found" });
    });

    it("returns portfolio and performance", async () => {
      Portfolio.findOne.mockResolvedValue({ id: "pid" });
      getPortfolioPerformance.mockResolvedValue({ perf: 123 });
      const req = { params: { id: "pid" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await portfolioController.getUserPortfolio(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ portfolio: { id: "pid" }, perf: 123 }));
    });

    it("handles errors", async () => {
      Portfolio.findOne.mockRejectedValue(new Error("fail"));
      const req = { params: { id: "pid" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await portfolioController.getUserPortfolio(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error when fetching portfolio" });
    });
  });

  describe("createPortfolio", () => {
    it("returns 400 if portfolio exists", async () => {
      Portfolio.findOne.mockResolvedValue({ id: "pid" });
      const req = { user: { id: "uid" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await portfolioController.createPortfolio(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "User has a portfolio" });
    });

    it("creates portfolio", async () => {
      Portfolio.findOne.mockResolvedValue(null);
      Portfolio.create.mockResolvedValue({ id: "pid" });
      const req = { user: { id: "uid" } };
      const res = { json: jest.fn() };
      await portfolioController.createPortfolio(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: "Portfolio created", portfolioId: "pid" });
    });

    it("handles errors", async () => {
      Portfolio.findOne.mockRejectedValue(new Error("fail"));
      const req = { user: { id: "uid" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await portfolioController.createPortfolio(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error when creating portfolio" });
    });
  });

  describe("updatePortfolio", () => {
    it("returns 404 if not found", async () => {
      Portfolio.update.mockResolvedValue([0]);
      const req = { user: { id: "uid" }, body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await portfolioController.updatePortfolio(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Portfolio not found" });
    });

    it("updates portfolio", async () => {
      Portfolio.update.mockResolvedValue([1]);
      const req = { user: { id: "uid" }, body: {} };
      const res = { json: jest.fn() };
      await portfolioController.updatePortfolio(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: "Portfolio updated" });
    });

    it("handles errors", async () => {
      Portfolio.update.mockRejectedValue(new Error("fail"));
      const req = { user: { id: "uid" }, body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await portfolioController.updatePortfolio(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error with updating portfolio" });
    });
  });

  describe("deletePortfolio", () => {
    it("returns 404 if not found", async () => {
      Portfolio.destroy.mockResolvedValue(0);
      const req = { user: { id: "uid" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await portfolioController.deletePortfolio(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Portfolio not found" });
    });

    it("deletes portfolio", async () => {
      Portfolio.destroy.mockResolvedValue(1);
      const req = { user: { id: "uid" } };
      const res = { json: jest.fn() };
      await portfolioController.deletePortfolio(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: "Portfolio deleted" });
    });

    it("handles errors", async () => {
      Portfolio.destroy.mockRejectedValue(new Error("fail"));
      const req = { user: { id: "uid" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await portfolioController.deletePortfolio(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error when deleting portfolio" });
    });
  });

  describe("getPortfolioHistoryController", () => {
    it("returns history", async () => {
      getPortfolioHistory.mockResolvedValue([{ value: 1 }]);
      const req = { params: { id: "pid" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await portfolioController.getPortfolioHistoryController(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ history: [{ value: 1 }] });
    });

    it("handles errors", async () => {
      getPortfolioHistory.mockRejectedValue(new Error("fail"));
      const req = { params: { id: "pid" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await portfolioController.getPortfolioHistoryController(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error fetching portfolio history" });
    });
  });
});