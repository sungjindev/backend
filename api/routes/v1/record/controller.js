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

    let trainer, trainee;

    if(isTrainer) {
      trainer = await Trainer.findOne({where: {trainerPhoneNumber: phoneNumber}});
      if(!trainer)
        return next(INVALID_TRAINER_PHONE);
      
      await Record.destroy({where: {trainerId: trainer.id, date: date, type: type}});
    } else {
      trainee = await Trainee.findOne({where: {traineePhoneNumber: phoneNumber}});
      if(!trainee)
        return next(INVALID_TRAINEE_PHONE);

      await Record.destroy({where: {traineeId: trainee.id, date: date, type: type}});
    }
    
    for(const record of records) {
      const name = record.name;

      for(const set of record.sets) {
        // set.kg, set.reps
        const record = await Record.create({kg: set.kg, reps: set.reps, type, date});

        if(isTrainer) {
          // const trainer = await Trainer.findByPk(accessToken.trainerId);
          // const trainer = await Trainer.findOne({where: {trainerPhoneNumber: phoneNumber}});
          // if(!trainer)
          //   return next(INVALID_TRAINER_PHONE);
          
          const exercise = await Exercise.findOne({where: {name}});
          if(!exercise)
            return next(INVALID_EXERCISE_NAME);

          await trainer.addRecord(record);
          await exercise.addRecord(record);
          
        } else {
          // const trainee = await Trainee.findByPk(accessToken.traineeId);
          // const trainee = await Trainee.findOne({where: {traineePhoneNumber: phoneNumber}});
          // if(!trainee)
          //   return next(INVALID_TRAINEE_PHONE);

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
    var responses = [];    
    var dates = new Set();
    var trainer;
    var trainee;

    if(isTrainer) {
      trainer = await Trainer.findOne({where: {trainerPhoneNumber: phoneNumber}});
      if(!trainer)
        return next(INVALID_TRAINER_PHONE);
      records = await trainer.getRecords({where: {date: {[Op.like]:`${yearMonth}%`}}, order: [['date', 'ASC'], ['id', 'ASC']]});
    } else {
      trainee = await Trainee.findOne({where: {traineePhoneNumber: phoneNumber}});
      if(!trainee)
        return next(INVALID_TRAINEE_PHONE);
      records = await trainee.getRecords({where: {date: {[Op.like]:`${yearMonth}%`}}, order: [['date', 'ASC'], ['id', 'ASC']]});
    }

    for(const record of records) {
      dates.add(record.date);
    }
    console.log(dates);
    
    for(const date of dates) {
      const exerciseIds = new Set();
      for(const record of records) {
        if(record.date === date)
          exerciseIds.add(record.exerciseId);
      }
      let arrayIds = [];
      exerciseIds.forEach(v => arrayIds.push(v));
      arrayIds.sort(function (a,b) {
        return a-b;
      });

      for(const arrayId of arrayIds) {
        var setsAT = [];
        var setsPT = [];
        var type;
        for(const record of records) {
          if(record.date === date && record.exerciseId === arrayId) {
            const temp = { kg: record.kg, reps: record.reps };
            // type = record.type;
            // sets.push(temp);

            if(record.type === "AT")
              setsAT.push(temp);
            else if(record.type === "PT")
              setsPT.push(temp);
          }
        }
        const exercise = await Exercise.findByPk(arrayId);

        if(setsAT.length != 0) {
          const response = { date: date, name: exercise.name, part: exercise.part, unit: exercise.unit, type: "AT", sets: setsAT };
          responses.push(response);
        }

        if(setsPT.length != 0) {
          const response = { date: date, name: exercise.name, part: exercise.part, unit: exercise.unit, type: "PT", sets: setsPT };
          responses.push(response);
        }
        // const response = { date: date, name: exercise.name, part: exercise.part, unit: exercise.unit, type: type, sets: sets };
        // responses.push(response);
      }
    }
    console.log(responses);
    
    return res.json(createResponse(res, responses));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { addRecords, getRecords };