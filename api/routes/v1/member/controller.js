const { createResponse } = require('../../../../utils/response');
const { Trainer, Trainee } = require('../../../../models');
const { INVALID_TRAINER_PHONE, MEMBER_NOT_FOUND, INVALID_TRAINEE_PHONE } = require('../../../../errors');

const getMembers = async(req,res,next) => {
  const {body: {trainerPhoneNumber}} = req;
  try {
    let members = [];
    const trainer = await Trainer.findByPk(trainerPhoneNumber);
    if(!trainer)
      return next(INVALID_TRAINER_PHONE);
    
    const trainees = await Trainee.findAll({where: {trainerPhoneNumber}});
    if(trainees.length == 0)
      return next(MEMBER_NOT_FOUND);

    for(const trainee of trainees) {
      const member = await Trainee.findByPk(trainee.trainerPhoneNumber);
      members.push({traineePhoneNumber: trainee.traineePhoneNumber, traineeName: trainee.traineeName, expired: trainee.expired});
    }
    
    return res.json(createResponse(res, members));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const deleteMember = async(req,res,next) => {
  const {body: {trainerPhoneNumber, traineePhoneNumber}} = req;
  try {
    const trainer = await Trainer.findByPk(trainerPhoneNumber);
    if(!trainer)
      return next(INVALID_TRAINER_PHONE);

    const trainee = await Trainee.findByPk(traineePhoneNumber);
    if(!trainee)
      return next(INVALID_TRAINEE_PHONE);
    
    const checkTrainee = await Trainee.findOne({where: {trainerPhoneNumber, traineePhoneNumber}});
    if(!checkTrainee)
      return next(MEMBER_NOT_FOUND);
    
    await trainer.removeTrainee(trainee);
    return res.json(createResponse(res));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const putExpired = async(req,res,next) => {
  const {body: {traineePhoneNumber, expired}} = req;
  try {
    const trainee = await Trainee.findByPk(traineePhoneNumber);
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