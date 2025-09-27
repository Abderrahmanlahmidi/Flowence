'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SavingGoals', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      userId: {
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "id" }
      },
      categoryId: {
        type: Sequelize.INTEGER,
        references: { model: "Categories", key: "id" }
      },
      title: Sequelize.STRING,
      targetAmount: Sequelize.DECIMAL,
      currentAmount: Sequelize.DECIMAL,
      deadline: Sequelize.DATE,
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('SavingGoals');
  }
};
