// models/Transaction.js
module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define("Transaction", {
    amount: DataTypes.DECIMAL,
    type: DataTypes.ENUM("income", "expense"),
    date: DataTypes.DATE,
    paymentMethod: DataTypes.STRING,
  });

  Transaction.associate = (models) => {
    Transaction.belongsTo(models.User, { foreignKey: "userId" });
    Transaction.belongsTo(models.Category, { foreignKey: "categoryId" });
  };

  return Transaction;
};
