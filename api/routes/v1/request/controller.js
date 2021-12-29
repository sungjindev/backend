const { createResponse } = require('../../../../utils/response');
const { Request, Trainer, Trainee } = require('../../../../models');
const { JSON_WEB_TOKEN_ERROR, INVALID_TRAINER_PHONE, INVALID_TRAINEE_PHONE, INVALID_REQUEST, INVALID_ACCEPT, DUPLICATED_REQUEST, REQUEST_NOT_FOUND } = require('../../../../errors');
const { verifyToken } = require('../../../../utils/jwt');

const request = async(req,res,next) => {
  const {body: {trainerPhoneNumber}} = req;
  try {
    const accessToken = verifyToken(req.headers.authorization.split('Bearer ')[1]);
    if(!accessToken)
      return next(JSON_WEB_TOKEN_ERROR);
    var trainer, trainee;
    if(accessToken.trainerId)
      return next(INVALID_REQUEST);

    trainee = await Trainee.findByPk(accessToken.traineeId);
    if(!trainee)
      return next(INVALID_TRAINEE_PHONE);
    
    trainer = await Trainer.findOne({where: {trainerPhoneNumber}});
    if(!trainer)
      return next(INVALID_TRAINER_PHONE);

    // const trainer = await Trainer.findByPk(requestee);
    // const trainee = await Trainee.findByPk(requestor);
    // if(!trainer)
    //   return next(INVALID_TRAINER_PHONE);
    // if(!trainee)
    //   return next(INVALID_TRAINEE_PHONE);
    
    const duplicated = await Request.findOne({where: {traineeId: trainee.id, trainerId: trainer.id}});
  
    if(duplicated)
      return next(DUPLICATED_REQUEST);

    const request = await Request.create({traineeId: trainee.id, trainerId: trainer.id});
    return res.json(createResponse(res, request));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const accept = async(req,res,next) => {
  const {body: {traineePhoneNumber}} = req;
  try {
    const accessToken = verifyToken(req.headers.authorization.split('Bearer ')[1]);
    if(!accessToken)
      return next(JSON_WEB_TOKEN_ERROR);
    var trainer, trainee;
    if(accessToken.traineeId)
      return next(INVALID_ACCEPT);

    trainee = await Trainee.findOne({where: {traineePhoneNumber}});
    if(!trainee)
      return next(INVALID_TRAINEE_PHONE);
    
    trainer = await Trainer.findByPk(accessToken.trainerId);
    if(!trainer)
      return next(INVALID_TRAINER_PHONE);


    // const trainer = await Trainer.findByPk(requestee);
    // const trainee = await Trainee.findByPk(requestor);
    // if(!trainer)
    //   return next(INVALID_TRAINER_PHONE);
    // if(!trainee)
    //   return next(INVALID_TRAINEE_PHONE);
    
    const request = await Request.findOne({where: {traineeId: trainee.id, trainerId: trainer.id}});
    if(!request)
      return next(REQUEST_NOT_FOUND);

    await trainer.addTrainee(trainee);
    await request.destroy();
    return res.json(createResponse(res));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const reject = async(req,res,next) => {
  const {body: {traineePhoneNumber}} = req;
  try {
    const accessToken = verifyToken(req.headers.authorization.split('Bearer ')[1]);
    if(!accessToken)
      return next(JSON_WEB_TOKEN_ERROR);
    var trainer, trainee;
    if(accessToken.traineeId)
      return next(INVALID_ACCEPT);

    trainee = await Trainee.findOne({where: {traineePhoneNumber}});
    if(!trainee)
      return next(INVALID_TRAINEE_PHONE);
    
    trainer = await Trainer.findByPk(accessToken.trainerId);
    if(!trainer)
      return next(INVALID_TRAINER_PHONE);


    // const trainer = await Trainer.findByPk(requestee);
    // const trainee = await Trainee.findByPk(requestor);
    // if(!trainer)
    //   return next(INVALID_TRAINER_PHONE);
    // if(!trainee)
    //   return next(INVALID_TRAINEE_PHONE);

    const request = await Request.findOne({where: {traineeId: trainee.id, trainerId: trainer.id}});
    if(!request)
      return next(REQUEST_NOT_FOUND);

    await request.destroy();
    return res.json(createResponse(res));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getRequests = async(req,res,next) => {
  try {
    const accessToken = verifyToken(req.headers.authorization.split('Bearer ')[1]);
    if(!accessToken)
      return next(JSON_WEB_TOKEN_ERROR);
    var trainer;
    if(accessToken.traineeId)
      return next(INVALID_ACCEPT);

    trainer = await Trainer.findByPk(accessToken.trainerId);
    if(!trainer)
      return next(INVALID_TRAINER_PHONE);

    let trainees = [];
    // const trainer = await Trainer.findByPk(trainerPhoneNumber);
    // if(!trainer)
    //   return next(INVALID_TRAINER_PHONE);

    const requests = await Request.findAll({where: {trainerId: trainer.id}});
    if(requests.length == 0)
      return next(REQUEST_NOT_FOUND);
    for(const request of requests) {
      const trainee = await Trainee.findByPk(request.traineeId);
      trainees.push({traineePhoneNumber: trainee.traineePhoneNumber, traineeName: trainee.traineeName});
    } 

    return res.json(createResponse(res, trainees));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { request, accept, reject, getRequests };