const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

const authenticateToken = (req, res, next) => {
    const token = req.cookies.access_token;

    if (!token) {
        return res.status(401).json({ error: "No token provided" })
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid token" });

        }
        req.user = user;

        next();
    })
}

module.exports = {
    authenticateToken
}