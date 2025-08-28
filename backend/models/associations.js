const Portfolio = require("./portfolio");
const Stocks = require("./stocks");
const User = require("./users");

User.hasOne(Portfolio);
Portfolio.belongsTo(User);
Portfolio.hasMany(Stocks);
Stocks.belongsTo(Portfolio);