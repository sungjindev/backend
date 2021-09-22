const { Trainer, RefreshToken } = require('../../../../models');
const { createResponse } = require('../../../../utils/response');
const { INVALID_TRAINER_PHONE, INVALID_TRAINER_PASSWORD } = require('../../../../errors');
const { SALT_ROUNDS, ROOT_DIR, JWT_SECRET_KEY_FILE } = require('../../../../env');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { join } = require('path');

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
  const JWT_SECRET_KEY = fs.readFileSync(join(ROOT_DIR, 'keys', JWT_SECRET_KEY_FILE));
  const { trainerPhoneNumber, trainerPassword } = req.body;
  try {
    const trainer = await Trainer.findByPk(trainerPhoneNumber);
    if(!trainer) return next(INVALID_TRAINER_PHONE);
    const same = bcrypt.compareSync(trainerPassword, trainer.trainerPassword);
    if(!same)
      return next(INVALID_TRAINER_PASSWORD);

    const refreshToken = await jwt.sign({}, JWT_SECRET_KEY, {algorithm: 'HS512', expiresIn: '14d'});  //refreshToken은 DB에 저장
    const token = await RefreshToken.create({refreshToken});
    await token.addTrainer(trainer);  //저장 후 올바른 Trainer 인스턴스와 관계 맺어주기
    const accessToken = await jwt.sign({trainerPhoneNumber}, JWT_SECRET_KEY, {algorithm: 'HS512', expiresIn: '1h'});  //accessToken 생성 
    res.cookie('refreshToken', refreshToken, {secure: true, httpOnly: true}); //refreshToken은 secure, httpOnly 옵션을 가진 쿠키로 보내 CSRF 공격을 방어
    return res.json(createResponse(res, {accessToken}));  //accessToken은 Json형식으로 보내고 Client는 로컬에 잘 가지고 있다가 api요청을 할때마다 Authorization 헤더에 넣어서 보내주게 된다.
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