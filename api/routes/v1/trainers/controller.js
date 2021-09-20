const { Trainer } = require('../../../../models');
const { createResponse } = require('../../../../utils/response');
const { INVALID_TRAINER_PHONE, INVALID_TRAINER_PASSWORD } = require('../../../../errors');
const { saltRounds } = require('../../../../env');
const bcrypt = require('bcrypt');

const register = async(req,res,next) => {
  try {
    req.body.trainerPassword = bcrypt.hashSync(req.body.trainerPassword, parseInt(saltRounds));
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
    const same = bcrypt.compareSync(trainerPassword, trainer.trainerPassword);
    if(!same)
      return next(INVALID_TRAINER_PASSWORD);
    return res.json(createResponse(res, trainer));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { register, login };