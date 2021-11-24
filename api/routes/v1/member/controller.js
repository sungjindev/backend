const { createResponse } = require('../../../../utils/response');
const { Trainer, Trainee } = require('../../../../models');
const { INVALID_TRAINER_PHONE, MEMBER_NOT_FOUND } = require('../../../../errors');

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
      members.push({traineePhoneNumber: trainee.traineePhoneNumber, traineeName: trainee.traineeName});
    }
    
    return res.json(createResponse(res, members));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { getMembers };