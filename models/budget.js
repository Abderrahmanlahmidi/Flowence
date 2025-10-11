module.exports = (sequelize, DataTypes) => {
  const Budget = sequelize.define("Budget", {
    montantPrevu: DataTypes.DECIMAL,
    montantDepense: DataTypes.DECIMAL,
    periode: DataTypes.DATE
  });

  Budget.associate = (models) => {
    Budget.belongsTo(models.User, { foreignKey: "userId" });
    Budget.belongsTo(models.Category, { foreignKey: "categoryId" });
  };

  return Budget;
};
