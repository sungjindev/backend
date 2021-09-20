const { Trainee } = require('../../../../models');
const { createResponse } = require('../../../../utils/response');
const { INVALID_TRAINEE_PHONE, INVALID_TRAINEE_PASSWORD } = require('../../../../errors');
const { SALT_ROUNDS, COOKIE_NAME } = require('../../../../env');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { join } = require('path');
const privateKey = fs.readFileSync(join(__dirname, '../../../../keys/private.key'));

const register = async(req,res,next) => {
  try {
    req.body.traineePassword = bcrypt.hashSync(req.body.traineePassword, parseInt(SALT_ROUNDS));
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
    const token = await jwt.sign({traineePhoneNumber}, privateKey, {algorithm: 'HS512', expiresIn: '10000'});
    res.cookie(COOKIE_NAME, token);
    return res.json(createResponse(res, trainee));
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