const Sequelize = require('sequelize');

module.exports = class RefreshToken extends Sequelize.Model { 
  static init(sequelize) {
    return super.init (
      {
        refreshToken: {
          type: Sequelize.STRING(300),
          allowNull: false,
        }
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "RefreshToken",
        tableName: "refreshtokens",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.RefreshToken.belongsTo(db.Trainer, {foreignKey: "trainerPhoneNumber", targetKey: "trainerPhoneNumber"});
    db.RefreshToken.belongsTo(db.Trainee, {foreignKey: "traineePhoneNumber", targetKey: "traineePhoneNumber"});
  }
};