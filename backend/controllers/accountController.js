const User = require("../models/users");
const { v4: uuidv4 } = require("uuid");

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
        user = await User.findByPk(id);

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
    return;
};

const deleteAccount = async (req, res) => {
    return;
}

module.exports = {
    getAllAccounts,
    getAccount,
    editAccount,
    deleteAccount
}