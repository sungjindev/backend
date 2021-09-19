const { Trainer } = require('../../../../models');
const { createResponse } = require('../../../../utils/response');
const { INVALID_TRAINER_ID, INVALID_TRAINER_PASSWORD } = require('../../../../errors');

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
  const { trainerId, trainerPassword } = req.body;
  try {
    const trainer = await Trainer.findByPk({trainerId});
    if(!trainer) next(INVALID_TRAINER_ID);
    if(trainer.trainerPassword != trainerPassword)
      next(INVALID_TRAINER_PASSWORD);
    return res.json(createResponse(res, trainer));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { register, login };