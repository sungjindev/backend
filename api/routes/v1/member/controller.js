const { createResponse } = require('../../../../utils/response');
const { Trainer, Trainee } = require('../../../../models');
const { JSON_WEB_TOKEN_ERROR, INVALID_TRAINER_PHONE, MEMBER_NOT_FOUND, INVALID_TRAINEE_PHONE } = require('../../../../errors');
const { verifyToken } = require('../../../../utils/jwt');

const getMembers = async(req,res,next) => {
  try {
    const accessToken = verifyToken(req.headers.authorization.split('Bearer ')[1]);
    if(!accessToken)
      return next(JSON_WEB_TOKEN_ERROR);

    if(!accessToken.trainerId)
      return next(INVALID_TRAINER_PHONE);

    const trainer = await Trainer.findByPk({where: {id: accessToken.trainerId}});
    let members = [];

    if(!trainer)
      return next(INVALID_TRAINER_PHONE);
    
    const trainees = await Trainee.findAll({where: {trainerId: trainer.id}});
    if(trainees.length == 0)
      return next(MEMBER_NOT_FOUND);

    for(const trainee of trainees) {
      // const member = await Trainee.findByPk(trainee.trainerPhoneNumber);
      members.push({traineePhoneNumber: trainee.traineePhoneNumber, traineeName: trainee.traineeName, expired: trainee.expired});
    }
    
    return res.json(createResponse(res, members));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const deleteMember = async(req,res,next) => {
  const {body: {deletingPhoneNumber}} = req;
  try {
    const accessToken = verifyToken(req.headers.authorization.split('Bearer ')[1]);
    if(!accessToken)
      return next(JSON_WEB_TOKEN_ERROR);

    var isTrainer, trainer, trainee;
    if(accessToken.trainerId)
      isTrainer = true;
    else if(accessToken.traineeId)
      isTrainer = false;

    if(isTrainer) {
      trainer = await Trainer.findByPk({where: {id: accessToken.trainerId}});
      if(!trainer)
        return next(INVALID_TRAINER_PHONE);
      trainee = await Trainee.findOne({where: {traineePhoneNumber: deletingPhoneNumber}});
      if(!trainee)
        return next(INVALID_TRAINEE_PHONE);

      const checkTrainee = await Trainee.findOne({where: {trainerId: trainer.id, traineeId: trainee.id}});
      if(!checkTrainee)
        return next(MEMBER_NOT_FOUND);
        
      await trainer.removeTrainee(trainee);
    }
    else {
      trainee = await Trainee.findByPk({where: {id: accessToken.traineeId}});
      if(!trainee)
        return next(INVALID_TRAINEE_PHONE);
      
      trainer = await Trainer.findOne({where: {trainerPhoneNumber: deletingPhoneNumber}});
      if(!trainer)
        return next(INVALID_TRAINER_PHONE);
  
      const checkTrainee = await Trainee.findOne({where: {trainerId: trainer.id, traineeId: trainee.id}});
      if(!checkTrainee)
        return next(MEMBER_NOT_FOUND);
          
      await trainer.removeTrainee(trainee);
    }

    // const trainer = await Trainer.findByPk(trainerPhoneNumber);
    // if(!trainer)
    //   return next(INVALID_TRAINER_PHONE);

    // const trainee = await Trainee.findByPk(traineePhoneNumber);
    // if(!trainee)
    //   return next(INVALID_TRAINEE_PHONE);
    
    // const checkTrainee = await Trainee.findOne({where: {trainerPhoneNumber, traineePhoneNumber}});
    // if(!checkTrainee)
    //   return next(MEMBER_NOT_FOUND);
    
    // await trainer.removeTrainee(trainee);
    return res.json(createResponse(res));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const putExpired = async(req,res,next) => {
  const {body: {expired}} = req;
  try {
    const accessToken = verifyToken(req.headers.authorization.split('Bearer ')[1]);
    if(!accessToken)
      return next(JSON_WEB_TOKEN_ERROR);
    var trainee;
    if(accessToken.trainerId)
      return next(INVALID_TRAINEE_PHONE);

    trainee = await Trainee.findByPk({where: {id: accessToken.traineeId}});
  
    // const trainee = await Trainee.findByPk(traineePhoneNumber);
    if(!trainee)
      return next(INVALID_TRAINEE_PHONE);
    await trainee.update({expired});
    return res.json(createResponse(res, trainee));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { getMembers, deleteMember, putExpired };