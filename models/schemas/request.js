const Sequelize = require('sequelize');

module.exports = class Request extends Sequelize.Model { 
  static init(sequelize) {
    return super.init (
      {
        traineeId: {
          type: Sequelize.STRING(20)
        },
        trainerId: {
          type: Sequelize.STRING(20)
        }
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "Request",
        tableName: "requests",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
  }
};