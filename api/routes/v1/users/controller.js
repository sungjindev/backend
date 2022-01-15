const { createResponse } = require('../../../../utils/response');
const { Trainer, Trainee } = require('../../../../models');
const { JSON_WEB_TOKEN_ERROR, EXCEEDED_AUTH_ATTEMPTS, EXCEEDED_SMS_ATTEMPTS, AUTH_NUMBER_EXPIRED, CERTIFICATION_NOT_EXISTED, INVALID_AUTH_NUMBER, INVALID_FORMAT_PHONE, INVALID_PHONE_LENGTH, INVALID_TRAINER_PHONE, INVALID_TRAINEE_PHONE, INVALID_EXERCISE_NAME} = require('../../../../errors');
const { verifyToken } = require('../../../../utils/jwt');



module.exports = {  };