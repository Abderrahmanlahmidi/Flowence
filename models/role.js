module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define("Role", {
    role: DataTypes.STRING,
  });

  Role.associate = (models) => {
    Role.hasMany(models.User, { foreignKey: "roleId" });
  };

  return Role;
};
