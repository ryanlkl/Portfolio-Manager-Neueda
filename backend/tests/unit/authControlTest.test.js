//testing JWT is created
const testJwt = require("jsonwebtoken");
const authController = require("../../controllers/authController.js");

const jwt = require("jsonwebtoken");

const JWT_SECRET = "example";

const createJWT = async (id, name) => {
  const payload = { id, name };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
  return token;
};

test("createJWT should return the expected JWT", async () => {
  const expectedToken = null;

  const token = await createJWT("any", "any");

  expect(token).not.toBe(expectedToken);
});

// test that password is encoded
const bcrypt = require("bcrypt");
const encodePassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

test("encodePassword should return a hashed password", async () => {
  const password = "myPassword123";
  const hashedPassword = await encodePassword(password);

  expect(hashedPassword).not.toBe(password);
});

// test passwordsMatch function
const passwordsMatch = async (inputPassword, hashedPassword) => {
  return await bcrypt.compare(inputPassword, hashedPassword);
};

test("passwordsMatch should return true for matching passwords", async () => {
  const password = "myPassword123";
  const hashedPassword = await encodePassword(password);

  const match = await passwordsMatch(password, hashedPassword);

  expect(match).toBe(true);
});
