const Portfolio = require("./portfolio");
const Stocks = require("./stocks");
const User = require("./users");
const Transactions = require("./transactions");

User.hasOne(Portfolio);
Portfolio.belongsTo(User);

Portfolio.hasMany(Stocks);
Stocks.belongsTo(Portfolio);

Stocks.hasMany(Transactions);
Transactions.belongsTo(Stocks);

Portfolio.hasMany(Transactions);
Transactions.belongsTo(Portfolio);