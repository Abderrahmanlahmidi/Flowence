module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define("Category", {
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    userId:DataTypes.INTEGER
  });

  Category.associate = (models) => {
    Category.hasMany(models.Transaction, { foreignKey: "categoryId" });
    Category.hasMany(models.Budget, { foreignKey: "categoryId" });
    Category.hasMany(models.SavingGoal, { foreignKey: "categoryId" });
    Category.belongsTo(models.User, { foreignKey: "userId" });
  };

  return Category;
};
