const { Trainer } = require('../../../../models');
const { createResponse } = require('../../../../utils/response');
const { INVALID_TRAINER_PHONE, INVALID_TRAINER_PASSWORD } = require('../../../../errors');
const { SALT_ROUNDS, COOKIE_NAME } = require('../../../../env');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { join } = require('path');
const privateKey = fs.readFileSync(join(__dirname, '../../../../keys/private.key'));

const register = async(req,res,next) => {
  try {
    req.body.trainerPassword = bcrypt.hashSync(req.body.trainerPassword, parseInt(SALT_ROUNDS));
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
    const token = await jwt.sign({trainerPhoneNumber}, privateKey, {algorithm: 'HS512', expiresIn: '7d'});
    res.cookie(COOKIE_NAME, token);
    return res.json(createResponse(res, trainer));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const test = (req,res,next) => {
  try {
    console.log("성공적");
    return res.json(createResponse(res, "성공했어요"));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { register, login, test };