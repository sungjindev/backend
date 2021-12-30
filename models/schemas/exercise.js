const Sequelize = require('sequelize');

module.exports = class Exercise extends Sequelize.Model { 
  static init(sequelize) {
    return super.init (
      {
        part: {
          type: Sequelize.STRING(10)
        },
        equipment: {
          type: Sequelize.STRING(10)
        },
        name: {
          type: Sequelize.STRING(30)
        }
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "Exercise",
        tableName: "exercises",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
  }
};