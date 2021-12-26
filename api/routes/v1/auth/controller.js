const { createResponse } = require('../../../../utils/response');
const { Certification } = require('../../../../models');
const { makeAuthNumber, makeMessage } = require('../../../../utils/sms');
const { JSON_WEB_TOKEN_ERROR, EXCEEDED_AUTH_ATTEMPTS, EXCEEDED_SMS_ATTEMPTS, AUTH_NUMBER_EXPIRED, CERTIFICATION_NOT_EXISTED, INVALID_AUTH_NUMBER, INVALID_FORMAT_PHONE, INVALID_PHONE_LENGTH, INVALID_TRAINER_PHONE, INVALID_TRAINEE_PHONE} = require('../../../../errors');
const { default: axios } = require('axios');
const { Trainer, Trainee } = require('../../../../models');
const { verifyToken } = require('../../../../utils/jwt');

const verifyCertification = async(req,res,next) => {
  try {
    const accessToken = verifyToken(req.headers.authorization.split('Bearer ')[1]);
    if(!accessToken)
      return next(JSON_WEB_TOKEN_ERROR);
    var isTrainer, phone, trainer, trainee;
    if(accessToken.trainerId)
      isTrainer = true;
    else if(accessToken.traineeId)
      isTrainer = false;

    if(isTrainer) {
      trainer = await Trainer.findByPk({where: {id: accessToken.trainerId}});
      if(!trainer)
        return next(INVALID_TRAINER_PHONE);
      phone = trainer.trainerPhoneNumber;
    }
    else {
      trainee = await Trainee.findByPk({where: {id: accessToken.traineeId}});
      if(!trainee)
        return next(INVALID_TRAINEE_PHONE);
      phone = trainee.traineePhoneNumber;
    }

    if(phone.search(/^010/) == -1) //휴대폰 번호가 010으로 시작하는지 검사
      return next(INVALID_FORMAT_PHONE);
    if(phone.search(/^\d{11}$/))  //휴대폰 번호가 숫자 11자리인지 검사
      return next(INVALID_PHONE_LENGTH);
    const authNumber = makeAuthNumber();
    res.locals.authNumber = authNumber;
    res.locals.phone = phone;
    const date = new Date();
    let certification;
    if(isTrainer) { //트레이너는 isTrainer 값이 True, 트레이니는 isTrainer 값이 False 
      certification = await Certification.findOrCreate({where: {trainerId: accessToken.trainerId}, defaults: {trainerId: accessToken.trainerId, lastRequest: date, authNumber}});
    } else {
      certification = await Certification.findOrCreate({where: {traineeId: accessToken.traineeId}, defaults: {traineeId: accessToken.traineeId, lastRequest: date, authNumber}});
    }
    if(!certification[1]) { //기존에 certification이 존재했다면
      const elapsedTime = (date.getTime()-certification[0].lastRequest.getTime()) / 1000; //경과시간을 초단위로 표현한 것
      if(elapsedTime < 86400 && certification[0].smsAttempts >= 500)
        return next(EXCEEDED_SMS_ATTEMPTS);
      if(elapsedTime >= 86400) {  //하루가 지났다면
        await certification[0].update({authNumber, smsAttempts: 1, authAttempts: 0, lastRequest: date});
      }
      else {  //하루가 지나지 않았지만 sms 시도 횟수는 5회 미만이라면,
        await certification[0].increment('smsAttempts', {by: 1});
        await certification[0].update({authNumber, lastRequest: date});
      }
    }
    next();
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const sendMessage = async(req,res,next) => {
  try {
    const phone = res.locals.phone;
    const authNumber = res.locals.authNumber;
    const form = makeMessage(phone, authNumber);
    await axios({
      method: "POST",
      json: true,
      url: form.url.toString(),
      headers: form.headers,
      data: form.data
    });
    res.json(createResponse(res));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const compareAuthNumber = async(req,res,next) => {
  const {body: {key}} = req;
  try {
    const accessToken = verifyToken(req.headers.authorization.split('Bearer ')[1]);
    if(!accessToken)
      return next(JSON_WEB_TOKEN_ERROR);
    var isTrainer, phone, trainer, trainee;
    if(accessToken.trainerId)
      isTrainer = true;
    else if(accessToken.traineeId)
      isTrainer = false;

    if(isTrainer) {
      trainer = await Trainer.findByPk({where: {id: accessToken.trainerId}});
      if(!trainer)
        return next(INVALID_TRAINER_PHONE);
      phone = trainer.trainerPhoneNumber;
    }
    else {
      trainee = await Trainee.findByPk({where: {id: accessToken.traineeId}});
      if(!trainee)
        return next(INVALID_TRAINEE_PHONE);
      phone = trainee.traineePhoneNumber;
    }

    if(phone.search(/^010/) == -1) //휴대폰 번호가 010으로 시작하는지 검사
      return next(INVALID_FORMAT_PHONE);
    if(phone.search(/^\d{11}$/))  //휴대폰 번호가 숫자 11자리인지 검사
      return next(INVALID_PHONE_LENGTH);

    let certification;
    const date = new Date().getTime();

    if(isTrainer) { //트레이너는 isTrainer 값이 True, 트레이니는 isTrainer 값이 False 
      certification = await Certification.findOne({where: {trainerId: accessToken.trainerId}});
    } else {
      certification = await Certification.findOne({where: {traineeId: accessToken.traineeId}});
    }

    if(!certification) next(CERTIFICATION_NOT_EXISTED);
    if((date - certification.lastRequest)/1000 > 60) return next(AUTH_NUMBER_EXPIRED); //60초라는 인증 시간이 경과한 경우
    if(certification.authAttempts >= 500) return next(EXCEEDED_AUTH_ATTEMPTS); //인증 시도를 5번 이상 하는 경우
    if(certification.authNumber != key) { //authNumber 값이 일치하지 않는 경우
      await certification.increment('authAttempts', {by:1});
      return next(INVALID_AUTH_NUMBER);
    }

    await certification.destroy();  //인증 정보 없애주기
    return res.json(createResponse(res));                 
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { verifyCertification, sendMessage, compareAuthNumber };