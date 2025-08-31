const authController = require("../authController");
const User = require("../../models/users");
const Portfolio = require("../../models/portfolio");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("../../models/users");
jest.mock("../../models/portfolio");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("Auth Controller", () => {
  afterEach(() => jest.clearAllMocks());

  describe("logInUser", () => {
    it("returns 400 if missing email or password", async () => {
      const req = { body: { email: "", password: "" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await authController.logInUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 401 if user not found", async () => {
      User.findAll.mockResolvedValue([]);
      const req = { body: { email: "a@b.com", password: "pw" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await authController.logInUser(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("returns 401 if password hash missing", async () => {
      User.findAll.mockResolvedValue([{ passwordHash: null }]);
      const req = { body: { email: "a@b.com", password: "pw" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await authController.logInUser(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("returns 401 if password does not match", async () => {
      User.findAll.mockResolvedValue([{ passwordHash: "hash" }]);
      bcrypt.compare.mockResolvedValue(false);
      const req = { body: { email: "a@b.com", password: "pw" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await authController.logInUser(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("returns 201 and user if credentials valid", async () => {
      User.findAll.mockResolvedValue([{ id: 1, name: "Test", passwordHash: "hash" }]);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("token");
      const req = { body: { email: "a@b.com", password: "pw" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      await authController.logInUser(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.cookie).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: "token" }));
    });

    it("handles errors", async () => {
      User.findAll.mockRejectedValue(new Error("fail"));
      const req = { body: { email: "a@b.com", password: "pw" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await authController.logInUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("registerUser", () => {
    it("returns 400 if missing fields", async () => {
      const req = { body: { email: "", name: "", password: "" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await authController.registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 409 if email exists", async () => {
      User.findOne.mockResolvedValue({ id: 1 });
      const req = { body: { email: "a@b.com", name: "Test", password: "Password1!" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await authController.registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it("returns 400 if password weak", async () => {
      User.findOne.mockResolvedValue(null);
      const req = { body: { email: "a@b.com", name: "Test", password: "weak" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await authController.registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 201 and user if valid", async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({ id: 1 });
      Portfolio.create.mockResolvedValue({ id: 2 });
      User.findAll.mockResolvedValue([{ id: 1, name: "Test" }]);
      jwt.sign.mockReturnValue("token");
      const req = { body: { email: "a@b.com", name: "Test", password: "Password1!" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      await authController.registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.cookie).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: "token" }));
    });

    it("handles errors", async () => {
      User.findOne.mockRejectedValue(new Error("fail"));
      const req = { body: { email: "a@b.com", name: "Test", password: "Password1!" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await authController.registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getCurrentUser", () => {
    it("returns 404 if user not found", async () => {
      const req = { user: null };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await authController.getCurrentUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("returns 200 and user if found", async () => {
      const req = { user: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await authController.getCurrentUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ user: { id: 1 } }));
    });
  });
});