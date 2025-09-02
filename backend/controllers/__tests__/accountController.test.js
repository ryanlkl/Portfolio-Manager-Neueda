const accountController = require("../accountController");
const User = require("../../models/users");
const Portfolio = require("../../models/portfolio");

jest.mock("../../models/users");
jest.mock("../../models/portfolio");

describe("Account Controller", () => {
  afterEach(() => jest.clearAllMocks());

  describe("getAllAccounts", () => {
    it("returns users", async () => {
      User.findAll.mockResolvedValue([{ id: 1 }]);
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn()
      };
      await accountController.getAllAccounts(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ users: [{ id: 1 }] });
    });

    it("handles errors", async () => {
      User.findAll.mockRejectedValue(new Error("fail"));
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn()
      };
      await accountController.getAllAccounts(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getAccount", () => {
    it("returns user", async () => {
      User.findByPk.mockResolvedValue({ id: 1 });
      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn()
      };
      await accountController.getAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        user: expect.objectContaining({ id: 1 })
      }));
    });

    it("returns 404 if not found", async () => {
      User.findByPk.mockResolvedValue(null);
      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn()
      };
      await accountController.getAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("handles errors", async () => {
      User.findByPk.mockRejectedValue(new Error("fail"));
      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn()
      };
      await accountController.getAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("editAccount", () => {
    it("returns 404 if not found", async () => {
      User.findByPk.mockResolvedValue(null);
      const req = { params: { id: 1 }, body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn()
      };
      await accountController.editAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("returns 400 if no valid fields", async () => {
      User.findByPk.mockResolvedValue({ id: 1 });
      const req = { params: { id: 1 }, body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn()
      };
      await accountController.editAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("updates user", async () => {
      const update = jest.fn();
      User.findByPk.mockResolvedValue({ id: 1, update });
      const req = { params: { id: 1 }, body: { name: "New" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn()
      };
      await accountController.editAccount(req, res);
      expect(update).toHaveBeenCalledWith({ name: "New" });
      expect(res.status).toHaveBeenCalledWith(204);
      expect.objectContaining({ id: 1 })
    });

    it("handles errors", async () => {
      const update = jest.fn();
      User.findByPk.mockResolvedValue({ id: 1, update });
      update.mockRejectedValue(new Error("fail"));
      const req = { params: { id: 1 }, body: { name: "New" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn()
      };
      await accountController.editAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("deleteAccount", () => {
    it("returns 404 if not found", async () => {
      User.findByPk.mockResolvedValue(null);
      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn()
      };
      await accountController.deleteAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("deletes user", async () => {
      const destroy = jest.fn();
      User.findByPk.mockResolvedValue({ id: 1, destroy });
      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn()
      };
      await accountController.deleteAccount(req, res);
      expect(destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it("handles errors", async () => {
      const destroy = jest.fn();
      User.findByPk.mockResolvedValue({ id: 1, destroy });
      destroy.mockRejectedValue(new Error("fail"));
      const req = { params: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn()
      };
      await accountController.deleteAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});