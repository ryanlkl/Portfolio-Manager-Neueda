const User = require("../models/users");
const Portfolio = require("../models/portfolio");
const bycrypt = require ("bcrypt");
const { encodePassword } = require("./authController");

const getAllAccounts = async (req, res) => {
    let users;

    try {
        users = await User.findAll()
    } catch (err) {
        return res.status(500).json({
            error: "Error when fetching accounts"
        })
    };


    return res.status(200).json({
        users: users
    })
}

const getAccount = async (req, res) => {
    let user;
    const { id } = req.params;

    try {
        user = await User.findByPk(id, {
            include: {
                model: Portfolio,
                attributes: ["id"]
            }
        });

        if (!user) {
            return res.status(404).json({
                error: "Account not found"
            })
        }
    } catch (err) {
        return res.status(500).json({
            error: "Error when fetching account"
        })
    }

    return res.status(200).json({
        message: "Success",
        user: user
    })
}

const editAccount = async (req, res) => {
    const { id } = req.params;
    let user;

    try {
        const { name, email, password } = req.body;
        user = await User.findByPk(id);

        await user.update({
            name: name || user.name,
            email: email || user.email,
            passwordHash: await encodePassword(password) || user.passwordHash
        })
        
    } catch (err) {
        return res.status(500).json({
            error: "Error when updating account"
        })
    }

    return res.status(204).json({
        message: "Success",
        user: user
    })
};

const deleteAccount = async (req, res) => {
    const { id } = req.params;
    let user;

    try {
        user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                error: "Account not found"
            })
        }

        await user.destroy();
    } catch (err) {
        return res.status(500).json({
            error: "Error when deleting account"
        })
    }

    return res.status(204).send();
}

module.exports = {
    getAllAccounts,
    getAccount,
    editAccount,
    deleteAccount
}