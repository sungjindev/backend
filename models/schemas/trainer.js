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
        introduction: {
          type: Sequelize.STRING(100),
          defaultValue: null
        },
        image: {
          type: Sequelize.STRING(100),
          defaultValue: null
        },
        center: {
          type: Sequelize.STRING(100),
          defaultValue: null
        }
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
    db.Trainer.hasMany(db.Record, {foreignKey: "trainerId", sourceKey: "id"});
    // db.Trainer.hasOne(db.RefreshToken, {foreignKey: "trainerId", sourceKey: "id"});
  }
};
