const { createResponse } = require('../../../../utils/response');
const { Trainer, Trainee, Record, Exercise } = require('../../../../models');
const { JSON_WEB_TOKEN_ERROR, EXCEEDED_AUTH_ATTEMPTS, EXCEEDED_SMS_ATTEMPTS, AUTH_NUMBER_EXPIRED, CERTIFICATION_NOT_EXISTED, INVALID_AUTH_NUMBER, INVALID_FORMAT_PHONE, INVALID_PHONE_LENGTH, INVALID_TRAINER_PHONE, INVALID_TRAINEE_PHONE, INVALID_EXERCISE_NAME} = require('../../../../errors');
const { verifyToken } = require('../../../../utils/jwt');
const { Op } = require('sequelize');

const addRecords = async(req,res,next) => {
  const {body: {isTrainer, phoneNumber, type, date, records}} = req;
  try { //Record에 필요한 값들이랑, Exercise에 필요한 name을 req로 받기
    const accessToken = verifyToken(req.headers.authorization.split('Bearer ')[1]);
    if(!accessToken)
      return next(JSON_WEB_TOKEN_ERROR);

    // var isTrainer;
    // if(accessToken.trainerId)
    //   isTrainer = true;
    // else if(accessToken.traineeId)
    //   isTrainer = false;
    
    for(const record of records) {
      const name = record.name;

      for(const set of record.sets) {
        // set.kg, set.reps
        const record = await Record.create({kg: set.kg, reps: set.reps, type, date});

        if(isTrainer) {
          // const trainer = await Trainer.findByPk(accessToken.trainerId);
          const trainer = await Trainer.findOne({where: {trainerPhoneNumber: phoneNumber}});
          if(!trainer)
            return next(INVALID_TRAINER_PHONE);
          
          const exercise = await Exercise.findOne({where: {name}});
          if(!exercise)
            return next(INVALID_EXERCISE_NAME);

          await trainer.addRecord(record);
          await exercise.addRecord(record);
          
        } else {
          // const trainee = await Trainee.findByPk(accessToken.traineeId);
          const trainee = await Trainee.findOne({where: {traineePhoneNumber: phoneNumber}});
          if(!trainee)
            return next(INVALID_TRAINEE_PHONE);

          const exercise = await Exercise.findOne({where: {name}});
          if(!exercise)
            return next(INVALID_EXERCISE_NAME);

          await trainee.addRecord(record);
          await exercise.addRecord(record);
        }
      }
    }
    
    return res.json(createResponse(res));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getRecords = async(req,res,next) => {
  const {body: {isTrainer, phoneNumber, yearMonth}} = req;
  try {
    const accessToken = verifyToken(req.headers.authorization.split('Bearer ')[1]);
    if(!accessToken)
      return next(JSON_WEB_TOKEN_ERROR);
    
    var records;
    var response = [];

    if(isTrainer) {
      const trainer = await Trainer.findOne({where: {trainerPhoneNumber: phoneNumber}});
      records = await trainer.getRecords({where: {date: {[Op.like]:`${yearMonth}%`}}, order: [['date', 'ASC']]});
    } else {
      const trainee = await Trainee.findOne({where: {traineePhoneNumber: phoneNumber}});
      records = await trainee.getRecords({where: {date: {[Op.like]:`${yearMonth}%`}}, order: [['date', 'ASC']]});
    }


    
    return res.json(createResponse(res));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { addRecords, getRecords };