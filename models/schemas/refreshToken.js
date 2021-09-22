const Sequelize = require('sequelize');

module.exports = class refreshToken extends Sequelize.model { 
  static init(sequelize) {
    return super.init (
      {
        token: {
          type: Sequelize.STRING(100),
          allowNull: false,
          primaryKey: true
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