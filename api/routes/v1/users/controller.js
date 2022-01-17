const { createResponse } = require('../../../../utils/response');
const { Trainer, Trainee } = require('../../../../models');
const { JSON_WEB_TOKEN_ERROR, EXCEEDED_AUTH_ATTEMPTS, EXCEEDED_SMS_ATTEMPTS, AUTH_NUMBER_EXPIRED, CERTIFICATION_NOT_EXISTED, INVALID_AUTH_NUMBER, INVALID_FORMAT_PHONE, INVALID_PHONE_LENGTH, INVALID_TRAINER_PHONE, INVALID_TRAINEE_PHONE, INVALID_EXERCISE_NAME} = require('../../../../errors');
const { verifyToken } = require('../../../../utils/jwt');

const addGoal = async(req,res,next) => {
  const {body: {goal}} = req;
  try {
    const accessToken = verifyToken(req.headers.authorization.split('Bearer ')[1]);
    if(!accessToken)
      return next(JSON_WEB_TOKEN_ERROR);

    var isTrainer;
    if(accessToken.trainerId)
      isTrainer = true;
    else if(accessToken.traineeId)
      isTrainer = false;

    if(isTrainer) {
      const trainer = await Trainer.findByPk(accessToken.trainerId);
      
    }

    
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { addGoal };