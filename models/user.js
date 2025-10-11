module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        firstName: DataTypes.STRING,
        lastName: DataTypes.STRING,
        email: { type: DataTypes.STRING, unique: true },
        passwordHash: DataTypes.STRING,
        currency: DataTypes.STRING,
        profileImage: DataTypes.STRING,
        dateTime: DataTypes.DATE
    });

    User.associate = (models) => {
        User.belongsTo(models.Role, { foreignKey: "roleId" });
        User.hasMany(models.Transaction, { foreignKey: "userId" });
        User.hasMany(models.Budget, { foreignKey: "userId" });
        User.hasMany(models.SavingGoal, { foreignKey: "userId" });
        User.hasMany(models.Notification, { foreignKey: "userId" });
    };

    return User;
};
