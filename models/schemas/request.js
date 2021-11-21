const Sequelize = require('sequelize');

module.exports = class Request extends Sequelize.Model { 
  static init(sequelize) {
    return super.init (
      {
        requestor: {
          type: Sequelize.STRING(20)
        },
        requestee: {
          type: Sequelize.STRING(20)
        },
        requestorIsTrainer: {
          type: Sequelize.BOOLEAN,
          allowNull: false
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