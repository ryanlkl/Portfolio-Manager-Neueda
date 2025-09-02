const transactionController = require("../transactionController");
const Transactions = require("../../models/transactions");
const Stocks = require("../../models/stocks");

jest.mock("../../models/transactions");
jest.mock("../../models/stocks");

describe("Transaction Controller", () => {
  afterEach(() => jest.clearAllMocks());

  describe("getTransactionByStock", () => {
    it("returns transactions for stock", async () => {
      Transactions.findAll.mockResolvedValue([{ id: 1 }]);
      const req = { params: { pid: "p1", sid: "s1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await transactionController.getTransactionByStock(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it("handles errors", async () => {
      Transactions.findAll.mockRejectedValue(new Error("fail"));
      const req = { params: { pid: "p1", sid: "s1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await transactionController.getTransactionByStock(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getAllTransactions", () => {
    it("returns all transactions", async () => {
      Transactions.findAll.mockResolvedValue([{ id: 1 }]);
      const req = { params: { pid: "p1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await transactionController.getAllTransactions(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ transactions: [{ id: 1 }] });
    });

    it("returns 404 if none found", async () => {
      Transactions.findAll.mockResolvedValue(null);
      const req = { params: { pid: "p1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await transactionController.getAllTransactions(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("handles errors", async () => {
      Transactions.findAll.mockRejectedValue(new Error("fail"));
      const req = { params: { pid: "p1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await transactionController.getAllTransactions(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getTransactionById", () => {
    it("returns transaction", async () => {
      Transactions.findByPk.mockResolvedValue({ id: 1 });
      const req = { params: { pid: "p1", id: "t1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await transactionController.getTransactionById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });

    it("returns 404 if not found", async () => {
      Transactions.findByPk.mockResolvedValue(null);
      const req = { params: { pid: "p1", id: "t1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await transactionController.getTransactionById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("handles errors", async () => {
      Transactions.findByPk.mockRejectedValue(new Error("fail"));
      const req = { params: { pid: "p1", id: "t1" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await transactionController.getTransactionById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("addTransaction", () => {
    it("returns true on success", async () => {
      Transactions.create.mockResolvedValue({ id: 1 });
      const result = await transactionController.addTransaction("p1", "s1", "buy", "AAPL", 10, 100, new Date());
      expect(result).toBe(true);
    });

    it("returns false on error", async () => {
      Transactions.create.mockRejectedValue(new Error("fail"));
      const result = await transactionController.addTransaction("p1", "s1", "buy", "AAPL", 10, 100, new Date());
      expect(result).toBe(false);
    });
  });
});