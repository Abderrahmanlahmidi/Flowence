// models/Category.js
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define("Category", {
    name: DataTypes.STRING,
    type: DataTypes.STRING,
  });

  Category.associate = (models) => {
    Category.hasMany(models.Transaction, { foreignKey: "categoryId" });
    Category.hasMany(models.Budget, { foreignKey: "categoryId" });
    Category.hasMany(models.SavingGoal, { foreignKey: "categoryId" });
  };

  return Category;
};
