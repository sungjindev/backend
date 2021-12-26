const { Trainer, RefreshToken } = require('../../../../models');
const { createResponse } = require('../../../../utils/response');
const { JSON_WEB_TOKEN_ERROR, INVALID_TRAINER_PHONE, INVALID_TRAINER_PASSWORD, ALREADY_LOGGED_OUT, DUPLICATED_PHONE, DUPLICATED_PASSWORD, INVALID_FORMAT_PHONE, INVALID_PHONE_LENGTH, INVALID_FORMAT_PASSWORD } = require('../../../../errors');
const { SALT_ROUNDS, JWT_SECRET_KEY_FILE } = require('../../../../env');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { join } = require('path');
const { verifyToken } = require('../../../../utils/jwt');

const register = async(req,res,next) => {
  const {body: {trainerPhoneNumber, trainerPassword}} = req;
  try {
    if(trainerPhoneNumber.search(/^010/) == -1) //휴대폰 번호가 010으로 시작하는지 검사
      return next(INVALID_FORMAT_PHONE);
    if(trainerPhoneNumber.search(/^\d{11}$/))  //휴대폰 번호가 숫자 11자리인지 검사
      return next(INVALID_PHONE_LENGTH);
    const duplicateTest = await Trainer.findByPk(trainerPhoneNumber);
    if(duplicateTest) //기존에 동일한 휴대폰 번호의 회원이 있는지 검사
      return next(DUPLICATED_PHONE);
    if(trainerPassword.search(/^[A-Za-z0-9]{6,12}$/) == -1) //비밀번호가 대소문자 알파벳,숫자 6~12자로 이루어져 있는지 검사 
      return next(INVALID_FORMAT_PASSWORD);
    req.body.trainerPassword = bcrypt.hashSync(trainerPassword, parseInt(SALT_ROUNDS));
    const trainer = await Trainer.create(req.body);
    return res.json(createResponse(res, trainer));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const login = async(req,res,next) => {
  // const JWT_SECRET_KEY = fs.readFileSync(join(__dirname, '../../../../keys/', JWT_SECRET_KEY_FILE));
  const { trainerPhoneNumber, trainerPassword } = req.body;
  try {
    const trainer = await Trainer.findOne({where: {trainerPhoneNumber}});
    if(!trainer) return next(INVALID_TRAINER_PHONE);
    const same = bcrypt.compareSync(trainerPassword, trainer.trainerPassword);
    if(!same)
      return next(INVALID_TRAINER_PASSWORD);

    const refreshToken = await jwt.sign({}, JWT_SECRET_KEY_FILE, {algorithm: 'HS512', expiresIn: '14d'});  //refreshToken은 DB에 저장
    const check = await RefreshToken.findOne({where: {trainerId: trainer.id}});
    if(check) {
      await check.update({refreshToken});
    }
    else {
      const token = await RefreshToken.create({refreshToken});
      await token.setTrainer(trainer);  //저장 후 올바른 Trainer 인스턴스와 관계 맺어주기
    }

    const accessToken = await jwt.sign({trainerId: trainer.id}, JWT_SECRET_KEY_FILE, {algorithm: 'HS512', expiresIn: '1h'});  //accessToken 생성 
    //res.cookie('refreshToken', refreshToken, {httpOnly: true}); //refreshToken은 secure, httpOnly 옵션을 가진 쿠키로 보내 CSRF 공격을 방어
    //res.cookie('accessToken', accessToken, {httpOnly: true}); //accessToken은 secure, httpOnly 옵션을 가진 쿠키로 보내 CSRF 공격을 방어
    //원래는 accessToken은 authorization header에 보내주는 게 보안상 좋지만, MVP 모델에서는 간소화
    return res.json(createResponse(res, {accessToken, refreshToken})); 
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const logout = async(req,res,next) => {
  const {params: {trainerPhoneNumber}} = req;
  try {
    const accessToken = verifyToken(req.headers.authorization.split('Bearer ')[1]);
    if(!accessToken)
      return next(JSON_WEB_TOKEN_ERROR);
    var trainer;
    if(accessToken.traineeId)
      return next(INVALID_TRAINER_PHONE);

    trainer = await Trainer.findByPk(accessToken.trainerId);
    if(!trainer)
      return next(INVALID_TRAINER_PHONE);


    const refreshToken = await RefreshToken.destroy({where: {trainerId: trainer.id}});  //db에서 trainer와 연결된 refreshToken 제거
    if(!refreshToken)
      return next(ALREADY_LOGGED_OUT);
    //res.clearCookie('refreshToken');  //쿠키에 저장된 모든 토큰을 제거
    //res.clearCookie('accessToken');
    //이 부분에서 클라이언트가 알아서 로컬에 저장한 AccessToken과 RefreshToken을 날려버려야함!!!!!!!!!!!!!!!!!
    return res.json(createResponse(res));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const resetPassword = async(req,res,next) => {
  const { trainerPassword } = req.body;
  try {
    const accessToken = verifyToken(req.headers.authorization.split('Bearer ')[1]);
    if(!accessToken)
      return next(JSON_WEB_TOKEN_ERROR);
    var trainer;
    if(accessToken.traineeId)
      return next(INVALID_TRAINER_PHONE);

    trainer = await Trainer.findByPk(accessToken.trainerId);
    if(!trainer)
      return next(INVALID_TRAINER_PHONE);


    // const trainer = await Trainer.findByPk(trainerPhoneNumber);
    // if(!trainer) return next(INVALID_TRAINER_PHONE);
    const same = bcrypt.compareSync(trainerPassword, trainer.trainerPassword);
    if(same)  //기존의 비밀번호와 동일한 비밀번호는 아닌지 검사
      return next(DUPLICATED_PASSWORD);
    if(trainerPassword.search(/^[A-Za-z0-9]{6,12}$/) == -1) //비밀번호가 대소문자 알파벳,숫자 6~12자로 이루어져 있는지 검사 
      return next(INVALID_FORMAT_PASSWORD);
    const newTrainerPassword = bcrypt.hashSync(trainerPassword, parseInt(SALT_ROUNDS));
    await trainer.update({trainerPassword: newTrainerPassword});
    await RefreshToken.destroy({where: {trainerId: trainer.id}});  //db에서 trainer와 연결된 refreshToken 제거
    // res.clearCookie('refreshToken');  //쿠키에 저장된 모든 토큰을 제거
    // res.clearCookie('accessToken');
    //이 부분에서 클라이언트가 알아서 로컬에 저장한 AccessToken과 RefreshToken을 날려버려야함!!!!!!!!!!!!!!!!!
    return res.json(createResponse(res));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const test = async(req,res,next) => {
  try {
    console.log("성 공 적");
    console.log("이것은 Access");
    console.log(req.headers.authorization.split('Bearer ')[1]);
    console.log("이것은 Refresh");
    console.log(req.headers.refresh);
    return res.json(createResponse(res, "성공했습니다."));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { register, login, logout, resetPassword, test };