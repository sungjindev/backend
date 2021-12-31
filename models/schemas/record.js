const Sequelize = require('sequelize');

module.exports = class Record extends Sequelize.Model { 
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
        },
        kg: {
          type: Sequelize.STRING(10)
        },
        reps: {
          type: Sequelize.STRING(10)
        },
        sets: {
          type: Sequelize.STRING(10)
        },
        type: {
          type: Sequelize.STRING(10)
        },
        date: {
          type: Sequelize.DATEONLY
        }
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "Record",
        tableName: "records",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.Record.belongsTo(db.Trainer, {foreignKey: "trainerId", targetKey: "id"});
    db.Record.belongsTo(db.Trainee, {foreignKey: "traineeId", targetKey: "id"});
  }
};