const { createResponse } = require('../../../../utils/response');
const { Request, Trainer, Trainee } = require('../../../../models');
const { INVALID_TRAINER_PHONE, INVALID_TRAINEE_PHONE, DUPLICATED_REQUEST, REQUEST_NOT_FOUND } = require('../../../../errors');

const request = async(req,res,next) => {
  const {body: {requestor, requestee}} = req;
  try {
    const trainer = await Trainer.findByPk(requestee);
    const trainee = await Trainee.findByPk(requestor);
    if(!trainer)
      return next(INVALID_TRAINER_PHONE);
    if(!trainee)
      return next(INVALID_TRAINEE_PHONE);
    
    const duplicated = await Request.findOne({where: {requestor, requestee}});
  
    if(duplicated)
      return next(DUPLICATED_REQUEST);

    const request = await Request.create(req.body);
    return res.json(createResponse(res, request));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const accept = async(req,res,next) => {
  const {body: {requestor, requestee}} = req;
  try {
    const trainer = await Trainer.findByPk(requestee);
    const trainee = await Trainee.findByPk(requestor);
    if(!trainer)
      return next(INVALID_TRAINER_PHONE);
    if(!trainee)
      return next(INVALID_TRAINEE_PHONE);
    
    const request = await Request.findOne({where: {requestor, requestee}});
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
  const {body: {requestor, requestee}} = req;
  try {
    const trainer = await Trainer.findByPk(requestee);
    const trainee = await Trainee.findByPk(requestor);
    if(!trainer)
      return next(INVALID_TRAINER_PHONE);
    if(!trainee)
      return next(INVALID_TRAINEE_PHONE);

    const request = await Request.findOne({where: {requestor, requestee}});
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
  const {body: {trainerPhoneNumber}} = req;
  try {
    let trainees = [];
    const trainer = await Trainer.findByPk(trainerPhoneNumber);
    if(!trainer)
      return next(INVALID_TRAINER_PHONE);

    const requests = await Request.findAll({where: {requestee: trainerPhoneNumber}});
    if(requests.length == 0)
      return next(REQUEST_NOT_FOUND);
    for(const request of requests) {
      const trainee = await Trainee.findByPk(request.requestor);
      trainees.push({traineePhoneNumber: trainee.traineePhoneNumber, traineeName: trainee.traineeName});
    } 

    return res.json(createResponse(res, trainees));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { request, accept, reject, getRequests };