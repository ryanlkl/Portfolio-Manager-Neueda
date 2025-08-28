const jwt = require("jsonwebtoken")
const { JWT_SECRET } = require("../config")
const User = require("../models/users")
const bcrypt = require("bcrypt");

const createJWT = (id, name) => {
    const payload = {
        id: id,
        name: name
    }

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    return token;
}

const encodePassword = (password) => {
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            console.error("Error generating salt")
            return
        }

        bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
                console.error("Error hashing password")
                return
            };

            return hash
        })
    });

}

const passwordsMatch = (inputPassword, hashedPassword) => {
    bcrypt.compare(inputPassword, hashedPassword, (err, result) => {
        if (err) {
            console.error("Error comparing passwords: ", err);
            return
        }

        if (result) {
            return true;
        } else {
            return false
        }
    })
}

const logInUser = async (req, res) => {
    const { email, password } = req.body;

    // Find User Logic
    try {
        const user = await User.findAll({
            where: {
                email: email
            }
        })

        const match = passwordsMatch(password, user.password_hash)

        if (!match) {
            res.status(401).json({
                error: "Invalid credentials"
            })
        }

        const token = createJWT(user.id, user.username)

        res.status(201).json({
            message: "Success"
        })
    } catch (err) {
        console.error("Error logging in user: ", err)
    }
    

}

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    // Create User logic
    try {
        const newUser = await User.create({
            username: username,
            email: email,
            password_hash: encodePassword(password)
        })
        res.status(201).json(newUser)
    } catch (err) {
        res.status(400).json({
            error: "Failed to create user"
        })
    }


    res.status(201).json({
        username: newUser.username,
        email: newUser.email
    })

    const token = createJWT(user.id, user.username)

    return res.status(201).json({
        message: "Successfully created"
    })
}

module.exports = {
    logInUser,
    registerUser
}