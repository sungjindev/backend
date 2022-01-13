const Sequelize = require("sequelize");

module.exports = class Trainee extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        traineePhoneNumber: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        traineePassword: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        traineeName: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        expired: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        }
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Trainee",
        tableName: "trainees",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.Trainee.belongsTo(db.Trainer, {foreignKey: "trainerId", targetKey: "id"});
    db.Trainee.hasMany(db.Record, {foreignKey: "traineeId", sourceKey: "id"});
    // db.Trainee.hasOne(db.RefreshToken, {foreignKey: "traineeId", sourceKey: "id"});
  }
};
