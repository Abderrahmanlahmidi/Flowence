module.exports = (sequelize, DataTypes) => {
  const SavingGoal = sequelize.define("SavingGoal", {
    title: DataTypes.STRING,
    targetAmount: DataTypes.FLOAT,
    deadline: DataTypes.DATE
  });

  SavingGoal.associate = (models) => {
    SavingGoal.belongsTo(models.User, { foreignKey: "userId" });
    SavingGoal.belongsTo(models.Category, { foreignKey: "categoryId" });
  };

  return SavingGoal;
};
