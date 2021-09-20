const { Trainee } = require('../../../../models');
const { createResponse } = require('../../../../utils/response');
const { INVALID_TRAINEE_PHONE, INVALID_TRAINEE_PASSWORD } = require('../../../../errors');
const { saltRounds } = require('../../../../env');
const bcrypt = require('bcrypt');

const register = async(req,res,next) => {
  try {
    req.body.traineePassword = bcrypt.hashSync(req.body.traineePassword, parseInt(saltRounds));
    const trainee = await Trainee.create(req.body);
    return res.json(createResponse(res, trainee));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const login = async(req,res,next) => {
  const { traineePhoneNumber, traineePassword } = req.body;
  try {
    const trainee = await Trainee.findByPk(traineePhoneNumber);
    if(!trainee) return next(INVALID_TRAINEE_PHONE);
    const same = bcrypt.compareSync(traineePassword, trainee.traineePassword);
    if(!same)
      return next(INVALID_TRAINEE_PASSWORD);
    return res.json(createResponse(res, trainee));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { register, login };