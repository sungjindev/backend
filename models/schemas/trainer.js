const Sequelize = require("sequelize");

module.exports = class Trainer extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        trainerPhoneNumber: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        trainerPassword: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        trainerName: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Trainer",
        tableName: "trainers",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.Trainer.hasMany(db.Trainee, {foreignKey: "trainerId", sourceKey: "id"});
    // db.Trainer.hasOne(db.RefreshToken, {foreignKey: "trainerId", sourceKey: "id"});
  }
};
