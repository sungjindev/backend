const { createResponse } = require('../../../../utils/response');
const { Trainer, Trainee } = require('../../../../models');
const { JSON_WEB_TOKEN_ERROR, EXCEEDED_AUTH_ATTEMPTS, EXCEEDED_SMS_ATTEMPTS, AUTH_NUMBER_EXPIRED, CERTIFICATION_NOT_EXISTED, INVALID_AUTH_NUMBER, INVALID_FORMAT_PHONE, INVALID_PHONE_LENGTH, INVALID_TRAINER_PHONE, INVALID_TRAINEE_PHONE, INVALID_EXERCISE_NAME} = require('../../../../errors');
const { verifyToken } = require('../../../../utils/jwt');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

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
      return next(INVALID_TRAINEE_PHONE);
    } else {
      const trainee = await Trainee.findByPk(accessToken.traineeId);
      if(!trainee)
        return next(INVALID_TRAINEE_PHONE);
      await trainee.update({goal});
    }
    return res.json(createResponse(res));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'images/');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadImage = async(req,res,next) => {
  try {
    console.log(req.file);
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
      if(!trainer)
        return next(INVALID_TRAINER_PHONE);
      await trainer.update({image: `/images/${req.file.filename}`});
    } else {
      const trainee = await Trainee.findByPk(accessToken.traineeId);
      if(!trainee)
        return next(INVALID_TRAINEE_PHONE);
      await trainee.update({image: `/images/${req.file.filename}`});
    }

    return res.json(createResponse(res, {image: `/images/${req.file.filename}`}));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const uploadInbody = async(req,res,next) => {
  try {
    console.log(req.file);
    const accessToken = verifyToken(req.headers.authorization.split('Bearer ')[1]);
    if(!accessToken)
      return next(JSON_WEB_TOKEN_ERROR);

    var isTrainer;
    if(accessToken.trainerId)
      isTrainer = true;
    else if(accessToken.traineeId)
      isTrainer = false;
    
    if(isTrainer) {
      return next(INVALID_TRAINEE_PHONE);
    } else {
      const trainee = await Trainee.findByPk(accessToken.traineeId);
      if(!trainee)
        return next(INVALID_TRAINEE_PHONE);
      await trainee.update({inbody: `/images/inbody/${req.file.filename}`});
    }

    return res.json(createResponse(res, {image: `/images/inbody/${req.file.filename}`}));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getImage = async(req,res,next) => {
  try {
    
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { addGoal, upload, uploadImage, uploadInbody, getImage };