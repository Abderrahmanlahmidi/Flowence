const { DataTypes } = require("sequelize");

const sequelize = ("./db.js");

const budget = sequelize.define("Budget", {
    amount:DataTypes.FLOAT,
    time:DataTypes.DATE,
    montant:DataTypes.FLOAT

})