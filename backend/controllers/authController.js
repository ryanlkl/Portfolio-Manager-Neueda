const jwt = require("jsonwebtoken")
const { JWT_SECRET } = require("../config")
const User = require("../models/users")
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const Portfolio = require("../models/portfolio");

const createJWT = async (id, name) => {
    const payload = {
        id: id,
        name: name
    }

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    return token;
}

const encodePassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;

}

const passwordsMatch = async (inputPassword, hashedPassword) => {
    return await bcrypt.compare(inputPassword, hashedPassword);
}

const logInUser = async (req, res) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({
            error: "Email and password are required"
        });
    }

    try {
        const users = await User.findAll({
            where: {
                email: email
            },
            include: {
                model: Portfolio,
                attributes: ["id"]
            }
        });

        const user = users[0];

        // If user not found
        if (!user) {
            return res.status(401).json({
                error: "Invalid credentials"
            });
        }

        // If user does not have a password hash (should not happen)
        if (!user.passwordHash) {
            return res.status(401).json({
                error: "Invalid credentials"
            });
        }

        // Check password
        const match = await passwordsMatch(password, user.passwordHash);

        if (!match) {
            return res.status(401).json({
                error: "Invalid credentials"
            });
        }

        const token = await createJWT(user.id, user.name);

        return res.status(201)
            .cookie("access_token", token, { httpOnly: true, sameSite: "lax", secure: false })
            .json({
                message: "Success",
                user: user,
                token: token,
            });
    } catch (err) {
        console.error("Error logging in user: ", err);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

const registerUser = async (req, res) => {
    const { email, name, password } = req.body;

    // Check for missing fields
    if (!email || !name || !password) {
        return res.status(400).json({
            error: "All fields are required"
        });
    }

    try {
        // Check for existing email
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                error: "Email already in use"
            });
        }

        // Password strength check (same as frontend)
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/.test(password)) {
            return res.status(400).json({
                error: "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
            });
        }

        const hashedPassword = await encodePassword(password);

        const newUser = await User.create({
            id: uuidv4(),
            name: name,
            email: email,
            passwordHash: hashedPassword
        });

        await Portfolio.create({
            id: uuidv4(),
            userId: newUser.id,
            totalValue: 0
        });

        const users = await User.findAll({
            where: { email: email },
            include: { model: Portfolio, attributes: ["id"] }
        });

        const user = users[0];
        const token = await createJWT(newUser.id, newUser.name);

        return res
            .status(201)
            .cookie("access_token", token, { httpOnly: true, sameSite: "lax", secure: false })
            .json({
                message: "Success",
                user: user,
                token: token,
            });

    } catch (err) {
        return res.status(500).json({
            error: "Failed to create user"
        });
    }
}


const getCurrentUser = async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(404).json({
            error: "User not found"
        });
    }

    return res.status(200).json({
        message: "Success",
        user: user
    });
};

module.exports = {
    logInUser,
    registerUser,
    getCurrentUser,
    encodePassword
}