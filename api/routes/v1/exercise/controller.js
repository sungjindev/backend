const { createResponse } = require('../../../../utils/response');
const { Exercise } = require('../../../../models');
const { JSON_WEB_TOKEN_ERROR, EXCEEDED_AUTH_ATTEMPTS, EXCEEDED_SMS_ATTEMPTS, AUTH_NUMBER_EXPIRED, CERTIFICATION_NOT_EXISTED, INVALID_AUTH_NUMBER, INVALID_FORMAT_PHONE, INVALID_PHONE_LENGTH, INVALID_TRAINER_PHONE, INVALID_TRAINEE_PHONE} = require('../../../../errors');
const { verifyToken } = require('../../../../utils/jwt');

const getExercises = async(req,res,next) => {
  try {
    const accessToken = verifyToken(req.headers.authorization.split('Bearer ')[1]);
    if(!accessToken)
      return next(JSON_WEB_TOKEN_ERROR);
  
    const exercises = await Exercise.findAll();
    return res.json(createResponse(res, exercises));
  } catch (error) {
    console.error(error);
    next(error); 
  }
};

module.exports = { getExercises };