const Sequelize = require('sequelize');

module.exports = class Certification extends Sequelize.Model { 
  static init(sequelize) {
    return super.init (
      {
        trainerId: {
          type: Sequelize.STRING(20)
        },
        traineeId: {
          type: Sequelize.STRING(20)
        },
        authNumber: {
          type: Sequelize.INTEGER(6).UNSIGNED,
          allowNull: false,
        },
        smsAttempts: {
          type: Sequelize.INTEGER(2).UNSIGNED,
          allowNull: false,
          defaultValue: 1
        },
        authAttempts: {
          type: Sequelize.INTEGER(2).UNSIGNED,
          allowNull: false,
          defaultValue: 0
        },
        lastRequest: {
          type: Sequelize.DATE
        }
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "Certification",
        tableName: "certifications",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
  }
};