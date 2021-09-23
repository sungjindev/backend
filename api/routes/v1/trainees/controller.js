const { Trainee, RefreshToken } = require('../../../../models');
const { createResponse } = require('../../../../utils/response');
const { INVALID_TRAINEE_PHONE, INVALID_TRAINEE_PASSWORD } = require('../../../../errors');
const { SALT_ROUNDS, JWT_SECRET_KEY_FILE } = require('../../../../env');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { join } = require('path');

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
  // const JWT_SECRET_KEY = fs.readFileSync(join(__dirname, '../../../../keys/', JWT_SECRET_KEY_FILE));
  const { traineePhoneNumber, traineePassword } = req.body;
  try {
    const trainee = await Trainee.findByPk(traineePhoneNumber);
    if(!trainee) return next(INVALID_TRAINEE_PHONE);
    const same = bcrypt.compareSync(traineePassword, trainee.traineePassword);
    if(!same)
      return next(INVALID_TRAINEE_PASSWORD);

    const refreshToken = await jwt.sign({}, JWT_SECRET_KEY_FILE, {algorithm: 'HS512', expiresIn: '14d'});  //refreshToken은 DB에 저장
    const check = await RefreshToken.findOne({where: {traineePhoneNumber}});
    if(check) {
      await check.update({refreshToken});
    }
    else {
      const token = await RefreshToken.create({refreshToken});
      await token.setTrainee(trainee);  //저장 후 올바른 Trainer 인스턴스와 관계 맺어주기
    }

    const accessToken = await jwt.sign({traineePhoneNumber}, JWT_SECRET_KEY_FILE, {algorithm: 'HS512', expiresIn: '1h'});  //accessToken 생성 
    res.cookie('refreshToken', refreshToken, {httpOnly: true}); //refreshToken은 secure, httpOnly 옵션을 가진 쿠키로 보내 CSRF 공격을 방어
    res.cookie('accessToken', accessToken, {httpOnly: true}); //accessToken은 secure, httpOnly 옵션을 가진 쿠키로 보내 CSRF 공격을 방어
    //원래는 accessToken은 authorization header에 보내주는 게 보안상 좋지만, MVP 모델에서는 간소화
    return res.json(createResponse(res, trainee));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const logout = async(req,res,next) => {
  const {params: {traineePhoneNumber}} = req;
  try {
    await RefreshToken.destroy({where: {traineePhoneNumber}});  //db에서 trainer와 연결된 refreshToken 제거
    res.clearCookie('refreshToken');  //쿠키에 저장된 모든 토큰을 제거
    res.clearCookie('accessToken');
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
    console.log(req.cookies.accessToken);
    console.log("이것은 Refresh");
    console.log(req.cookies.refreshToken);
    return res.json(createResponse(res, "성공했습니다."));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { register, login, logout, test };