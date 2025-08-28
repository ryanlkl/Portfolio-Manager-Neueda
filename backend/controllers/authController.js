const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const User = require("../models/users");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const createJWT = async (id, name) => {
  const payload = {
    id: id,
    name: name,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

  return token;
};

const encodePassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

const passwordsMatch = async (inputPassword, hashedPassword) => {
  return await bcrypt.compare(inputPassword, hashedPassword);
};

const logInUser = async (req, res) => {
  const { email, password } = req.body;

  // Find User Logic
  try {
    const users = await User.findAll({
      where: {
        email: email,
      },
    });

    const user = users[0];

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const match = await passwordsMatch(password, user.passwordHash);

    if (!match) {
      res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const token = await createJWT(user.id, user.name);

    res.status(201).cookie("access_token", token, { httpOnly: true }).json({
      message: "Success",
      user: user,
      token: token,
    });
  } catch (err) {
    console.error("Error logging in user: ", err);
  }
};

const registerUser = async (req, res) => {
  const { email, name, password } = req.body;
  let newUser;

  // Create User logic
  try {
    const hashedPassword = await encodePassword(password);

    newUser = await User.create({
      id: uuidv4(),
      name: name,
      email: email,
      passwordHash: hashedPassword,
    });
  } catch (err) {
    res.status(400).json({
      status: "Failed to create user",
      error: err,
    });
  }

  const token = await createJWT(newUser.id, newUser.name);

  return res
    .status(201)
    .cookie("access_token", token, { httpOnly: true })
    .json({
      message: "Successfully created",
    });
};

module.exports = {
  logInUser,
  registerUser,
  createJWT,
  encodePassword,
  passwordsMatch,
};
