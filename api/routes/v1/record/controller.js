const { createResponse } = require('../../../../utils/response');
const { Trainer, Trainee, Record, Exercise } = require('../../../../models');
const { JSON_WEB_TOKEN_ERROR, EXCEEDED_AUTH_ATTEMPTS, EXCEEDED_SMS_ATTEMPTS, AUTH_NUMBER_EXPIRED, CERTIFICATION_NOT_EXISTED, INVALID_AUTH_NUMBER, INVALID_FORMAT_PHONE, INVALID_PHONE_LENGTH, INVALID_TRAINER_PHONE, INVALID_TRAINEE_PHONE} = require('../../../../errors');
const { verifyToken } = require('../../../../utils/jwt');

const addRecord = async(req,res,next) => {
  try { //Record에 필요한 값들이랑, Exercise에 필요한 name을 req로 받기
    const accessToken = verifyToken(req.headers.authorization.split('Bearer ')[1]);
    if(!accessToken)
      return next(JSON_WEB_TOKEN_ERROR);

    var isTrainer;
    if(accessToken.trainerId)
      isTrainer = true;
    else if(accessToken.traineeId)
      isTrainer = false;

    const record = await Record.create(req.body);
    
    if(isTrainer) {
      const trainer = await Trainer.findByPk(accessToken.trainerId);
      if(!trainer)
        return next(INVALID_TRAINER_PHONE);
      await trainer.addRecord(record);
    } else {
      const trainee = await Trainee.findByPk(accessToken.traineeId);
      if(!trainee)
        return next(INVALID_TRAINEE_PHONE);
      await trainee.addRecord(record);
    }

    return res.json(createResponse(res));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const deleteRecord = async(req,res,next) => {
  try {
    
    
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getRecord = async(req,res,next) => {
  try {
    
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { addRecord, deleteRecord, getRecord };