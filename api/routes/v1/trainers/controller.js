const { Trainer } = require('../../../../models');
const { createResponse } = require('../../../../utils/response');
const { INVALID_TRAINER_PHONE, INVALID_TRAINER_PASSWORD } = require('../../../../errors');

const register = async(req,res,next) => {
  try {
    const trainer = await Trainer.create(req.body);
    return res.json(createResponse(res, trainer));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const login = async(req,res,next) => {
  const { trainerPhoneNumber, trainerPassword } = req.body;
  try {
    const trainer = await Trainer.findByPk(trainerPhoneNumber);
    if(!trainer) return next(INVALID_TRAINER_PHONE);
    if(trainer.trainerPassword != trainerPassword)
      return next(INVALID_TRAINER_PASSWORD);
    return res.json(createResponse(res, trainer));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { register, login };